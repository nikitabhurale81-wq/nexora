"""User feedback submission and admin retrieval."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.feedback import Feedback
from app.models.user import User


async def submit_feedback(
    db: AsyncSession,
    user: User,
    *,
    title: str,
    message: str,
    category: str = "support",
    priority: str = "medium",
) -> Feedback:
    feedback = Feedback(
        user_id=user.id,
        title=title.strip(),
        message=message.strip(),
        category=category,
        priority=priority,
        status="new",
    )
    db.add(feedback)
    await db.flush()
    return feedback


async def list_feedback(
    db: AsyncSession, *, status: str | None = None, category: str | None = None, limit: int = 50
) -> list[Feedback]:
    stmt = select(Feedback).order_by(Feedback.created_at.desc()).limit(min(limit, 500))
    if status:
        stmt = stmt.where(Feedback.status == status)
    if category:
        stmt = stmt.where(Feedback.category == category)
    return list((await db.execute(stmt)).scalars().all())


async def get_feedback(db: AsyncSession, feedback_id: uuid.UUID) -> Feedback:
    fb = await db.get(Feedback, feedback_id)
    if not fb:
        raise NotFoundError("Feedback not found.")
    return fb


async def update_feedback_status(db: AsyncSession, feedback_id: uuid.UUID, status: str) -> Feedback:
    fb = await get_feedback(db, feedback_id)
    fb.status = status
    await db.flush()
    return fb
