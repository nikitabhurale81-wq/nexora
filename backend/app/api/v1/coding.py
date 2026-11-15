"""Coding Assistant endpoint (analysis only — never executes code)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_registered_user
from app.core.responses import success
from app.database.session import get_db
from app.models.user import User
from app.schemas.coding import CodingRequest
from app.services.coding import service as coding

router = APIRouter(prefix="/coding", tags=["coding"])


@router.post("/assist")
async def assist(
    payload: CodingRequest,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await coding.assist(
        db, user,
        action=payload.action,
        language=payload.language,
        code=payload.code,
        instructions=payload.instructions,
        error=payload.error,
    )
    return success(result, "Completed")
