"""Document endpoints: upload, list, detail, status, download, delete."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_registered_user
from app.core.responses import success
from app.database.session import get_db, get_sessionmaker
from app.models.user import User
from app.schemas.document import DocumentRead
from app.services.documents import service as documents
from app.services.storage.factory import get_storage

router = APIRouter(prefix="/documents", tags=["documents"])


def _doc(d) -> dict:
    return DocumentRead.model_validate(d).model_dump(mode="json")


async def _process_in_background(document_id: uuid.UUID) -> None:
    """Run processing with its own DB session (request session is closed)."""
    factory = get_sessionmaker()
    async with factory() as db:
        await documents.process_document(db, document_id)
        await db.commit()


@router.post("")
async def upload(
    background: BackgroundTasks,
    file: UploadFile = File(...),
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    data = await file.read()
    doc = await documents.create_document(
        db, user,
        filename=file.filename or "upload",
        data=data,
        content_type=file.content_type or "",
    )
    await db.commit()  # persist before the background task reads it
    background.add_task(_process_in_background, doc.id)
    return success(_doc(doc), "Document uploaded; processing started")


@router.get("")
async def list_all(
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    docs = await documents.list_documents(db, user)
    return success([_doc(d) for d in docs])


@router.get("/{document_id}")
async def detail(
    document_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    doc = await documents.get_document(db, user, document_id)
    return success(_doc(doc))


@router.get("/{document_id}/status")
async def status(
    document_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    doc = await documents.get_document(db, user, document_id)
    return success({"id": str(doc.id), "status": doc.status, "error": doc.error})


@router.get("/{document_id}/preview")
async def preview(
    document_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Return first few chunks of document text for preview."""
    from sqlalchemy import select
    from app.models.document_chunk import DocumentChunk

    doc = await documents.get_document(db, user, document_id)
    stmt = (
        select(DocumentChunk)
        .where(DocumentChunk.document_id == doc.id)
        .order_by(DocumentChunk.chunk_index)
        .limit(5)
    )
    chunks = (await db.execute(stmt)).scalars().all()
    text = "\n\n".join(c.content for c in chunks) if chunks else ""
    return success({
        "id": str(doc.id),
        "name": doc.name,
        "status": doc.status,
        "page_count": doc.page_count,
        "text": text or "No preview available yet.",
    })


@router.get("/{document_id}/download")
async def download(
    document_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    doc = await documents.get_document(db, user, document_id)
    url = await get_storage().signed_url(doc.storage_key)
    return success({"url": url, "expires_in": 900})


@router.delete("/{document_id}")
async def remove(
    document_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    await documents.delete_document(db, user, document_id)
    return success({"id": str(document_id)}, "Document deleted")
