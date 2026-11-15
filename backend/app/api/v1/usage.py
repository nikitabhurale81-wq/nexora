"""Usage & limits endpoint for the dashboard and usage page."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_registered_user
from app.core.responses import success
from app.database.session import get_db
from app.models.user import User
from app.services.usage.service import usage_summary

router = APIRouter(prefix="/usage", tags=["usage"])


@router.get("/summary")
async def summary(
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    data = await usage_summary(db, user.id, user.subscription)
    return success({"plan": user.subscription, "usage": data})
