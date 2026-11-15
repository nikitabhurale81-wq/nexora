"""RAG endpoint: ask questions about your own documents."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_registered_user
from app.core.responses import success
from app.database.session import get_db
from app.models.user import User
from app.schemas.document import RagQueryRequest
from app.services.rag import service as rag

router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/query")
async def query(
    payload: RagQueryRequest,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await rag.query_documents(
        db, user, question=payload.question, document_id=payload.document_id
    )
    return success(result, "Answer generated")
