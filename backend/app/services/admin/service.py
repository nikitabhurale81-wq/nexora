"""Admin-only operations: user management, activity logs, system stats.

Security: every function here MUST be called by an endpoint protected with
require_admin. There is no API to promote a user to admin; that must be done
manually via DB update or a secure script.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ValidationAppError
from app.models.conversation import Conversation
from app.models.dataset import Dataset
from app.models.document import Document
from app.models.message import Message
from app.models.report import Report
from app.models.usage_log import UsageLog
from app.models.user import User


async def list_users(
    db: AsyncSession, *, role: str | None = None, active: bool | None = None, limit: int = 50
) -> list[dict]:
    stmt = select(User).order_by(User.created_at.desc()).limit(min(limit, 500))
    if role:
        stmt = stmt.where(User.role == role)
    if active is not None:
        stmt = stmt.where(User.is_active == active)
    users = (await db.execute(stmt)).scalars().all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "name": u.name,
            "role": u.role,
            "subscription": u.subscription,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


async def get_user_detail(db: AsyncSession, user_id: uuid.UUID) -> dict:
    user = await db.get(User, user_id)
    if not user:
        raise NotFoundError("User not found.")
    # Count resources
    messages = await db.scalar(select(func.count(Message.id)).where(Message.user_id == user_id))
    convs = await db.scalar(select(func.count(Conversation.id)).where(Conversation.user_id == user_id))
    docs = await db.scalar(select(func.count(Document.id)).where(Document.user_id == user_id))
    datasets = await db.scalar(select(func.count(Dataset.id)).where(Dataset.user_id == user_id))
    reports = await db.scalar(select(func.count(Report.id)).where(Report.user_id == user_id))
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "subscription": user.subscription,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat(),
        "resources": {
            "messages": messages or 0,
            "conversations": convs or 0,
            "documents": docs or 0,
            "datasets": datasets or 0,
            "reports": reports or 0,
        },
    }


async def update_user_status(db: AsyncSession, user_id: uuid.UUID, is_active: bool) -> dict:
    user = await db.get(User, user_id)
    if not user:
        raise NotFoundError("User not found.")
    if user.role == "admin":
        raise ValidationAppError("Cannot deactivate an admin account via API.")
    user.is_active = is_active
    await db.flush()
    return {"id": str(user.id), "is_active": user.is_active}


async def activity_logs(
    db: AsyncSession, *, user_id: uuid.UUID | None = None, days: int = 7, limit: int = 100
) -> list[dict]:
    since = datetime.now(timezone.utc) - timedelta(days=min(days, 90))
    stmt = (
        select(UsageLog)
        .where(UsageLog.created_at >= since)
        .order_by(UsageLog.created_at.desc())
        .limit(min(limit, 1000))
    )
    if user_id:
        stmt = stmt.where(UsageLog.user_id == user_id)
    logs = (await db.execute(stmt)).scalars().all()
    return [
        {
            "id": str(log.id),
            "user_id": str(log.user_id),
            "feature": log.feature,
            "action": log.action,
            "units": log.units or 0,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]


async def system_stats(db: AsyncSession) -> dict:
    total_users = await db.scalar(select(func.count(User.id)))
    active_users = await db.scalar(select(func.count(User.id)).where(User.is_active.is_(True)))
    total_messages = await db.scalar(select(func.count(Message.id)))
    total_convs = await db.scalar(select(func.count(Conversation.id)))
    total_docs = await db.scalar(select(func.count(Document.id)))
    total_datasets = await db.scalar(select(func.count(Dataset.id)))
    total_reports = await db.scalar(select(func.count(Report.id)))

    # Recent activity (last 7 days)
    since = datetime.now(timezone.utc) - timedelta(days=7)
    recent_users = await db.scalar(
        select(func.count(User.id)).where(User.created_at >= since)
    )
    recent_messages = await db.scalar(
        select(func.count(Message.id)).where(Message.created_at >= since)
    )

    return {
        "users": {"total": total_users or 0, "active": active_users or 0, "recent_7d": recent_users or 0},
        "messages": {"total": total_messages or 0, "recent_7d": recent_messages or 0},
        "conversations": total_convs or 0,
        "documents": total_docs or 0,
        "datasets": total_datasets or 0,
        "reports": total_reports or 0,
    }
