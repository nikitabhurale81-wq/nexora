"""Feedback endpoints: user submit, admin read/update."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_admin, require_registered_user
from app.core.responses import success
from app.database.session import get_db
from app.models.user import User
from app.schemas.feedback import FeedbackRead, FeedbackStatusUpdate, FeedbackSubmit
from app.services.feedback import service as feedback

router = APIRouter(prefix="/feedback", tags=["feedback"])


def _fb(f) -> dict:
    return FeedbackRead.model_validate(f).model_dump(mode="json")


@router.post("")
async def submit(
    payload: FeedbackSubmit,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    fb = await feedback.submit_feedback(
        db,
        user,
        title=payload.title,
        message=payload.message,
        category=payload.category,
        priority=payload.priority,
    )
    return success(_fb(fb), "Thank you for your feedback")


@router.get("")
async def list_all(
    status: str | None = Query(default=None),
    category: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict:
    items = await feedback.list_feedback(db, status=status, category=category, limit=limit)
    return success([_fb(f) for f in items])


@router.get("/{feedback_id}")
async def detail(
    feedback_id: uuid.UUID,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return success(_fb(await feedback.get_feedback(db, feedback_id)))


@router.patch("/{feedback_id}")
async def update_status(
    feedback_id: uuid.UUID,
    payload: FeedbackStatusUpdate,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict:
    fb = await feedback.update_feedback_status(db, feedback_id, payload.status)
    return success(_fb(fb), "Status updated")
