"""Document service: validated upload, async processing, listing, deletion.

Strict per-user isolation: every query filters by the owner's id. Uploaded
documents are treated as untrusted input.
"""

from __future__ import annotations

import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import NotFoundError, ValidationAppError
from app.core.logging import get_logger
from app.integrations.ai_providers.embeddings import get_embedding_provider
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.user import User
from app.services.documents.chunk import chunk_pages
from app.services.documents.extract import extract_text
from app.services.storage.factory import get_storage
from app.services.usage.service import enforce_quota, log_usage

logger = get_logger("nexora.documents")

ALLOWED_TYPES = {"pdf", "docx", "txt"}
_CONTENT_TYPES = {
    "pdf": {"application/pdf"},
    "docx": {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",
    },
    "txt": {"text/plain", "application/octet-stream"},
}
EMBED_BATCH = 50


def _ext(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def validate_upload(filename: str, content_type: str, size: int) -> str:
    """Validate extension, declared MIME type, and size. Returns file_type."""
    file_type = _ext(filename)
    if file_type not in ALLOWED_TYPES:
        raise ValidationAppError("Only PDF, DOCX, and TXT files are supported.")
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if size <= 0:
        raise ValidationAppError("Uploaded file is empty.")
    if size > max_bytes:
        raise ValidationAppError(f"File exceeds the {settings.max_upload_size_mb} MB limit.")
    allowed_ct = _CONTENT_TYPES.get(file_type, set())
    if content_type and allowed_ct and content_type not in allowed_ct:
        raise ValidationAppError("File content type does not match its extension.")
    return file_type


async def create_document(
    db: AsyncSession, user: User, *, filename: str, data: bytes, content_type: str
) -> Document:
    """Validate + store the file and create an 'uploaded' document row."""
    file_type = validate_upload(filename, content_type, len(data))
    await enforce_quota(db, user.id, user.subscription, "documents")

    doc_id = uuid.uuid4()
    storage_key = f"documents/{user.id}/{doc_id}/{filename}"
    await get_storage().upload(storage_key, data, content_type or "application/octet-stream")

    doc = Document(
        id=doc_id, user_id=user.id, name=filename, file_type=file_type,
        size_bytes=len(data), storage_key=storage_key, status="uploaded",
    )
    db.add(doc)
    await log_usage(db, user.id, "documents", "upload", units=1,
                    details={"file_type": file_type, "size": len(data)})
    await db.flush()
    return doc


async def process_document(db: AsyncSession, document_id: uuid.UUID) -> None:
    """Extract, chunk, embed, and store chunks. Updates status as it goes."""
    doc = await db.get(Document, document_id)
    if doc is None:
        return
    try:
        doc.status = "processing"
        await db.flush()

        data = await get_storage().download(doc.storage_key)
        pages = extract_text(data, doc.file_type)
        chunks = chunk_pages(pages)
        if not chunks:
            raise ValidationAppError("No extractable text found in the document.")

        provider = get_embedding_provider()
        # Embed in batches to limit request size.
        for start in range(0, len(chunks), EMBED_BATCH):
            batch = chunks[start : start + EMBED_BATCH]
            vectors = await provider.embed([c.content for c in batch])
            for chunk, vector in zip(batch, vectors):
                db.add(DocumentChunk(
                    document_id=doc.id, user_id=doc.user_id,
                    chunk_index=chunk.index, content=chunk.content,
                    page_number=chunk.page_number, embedding=vector,
                ))
            await db.flush()

        doc.page_count = max((p for p, _ in pages), default=0)
        doc.status = "completed"
        await db.flush()
        logger.info("Processed document %s (%d chunks)", document_id, len(chunks))
    except Exception as exc:
        await db.rollback()
        doc = await db.get(Document, document_id)
        if doc is not None:
            doc.status = "failed"
            doc.error = str(exc)[:500]
            await db.flush()
        logger.warning("Document %s processing failed: %s", document_id, exc)


async def list_documents(db: AsyncSession, user: User) -> list[Document]:
    stmt = select(Document).where(Document.user_id == user.id).order_by(Document.created_at.desc())
    return list((await db.execute(stmt)).scalars().all())


async def get_document(db: AsyncSession, user: User, document_id: uuid.UUID) -> Document:
    doc = await db.get(Document, document_id)
    if doc is None or doc.user_id != user.id:
        raise NotFoundError("Document not found.")
    return doc


async def delete_document(db: AsyncSession, user: User, document_id: uuid.UUID) -> None:
    doc = await get_document(db, user, document_id)
    await db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == doc.id))
    try:
        await get_storage().delete(doc.storage_key)
    except Exception as exc:  # storage delete is best-effort
        logger.warning("Could not delete stored object %s: %s", doc.storage_key, exc)
    await db.delete(doc)
    await db.flush()
