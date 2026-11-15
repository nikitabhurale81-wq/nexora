"""Usage tracking and server-side quota enforcement.

Quotas are counted per calendar month from the append-only ``usage_logs``
table, so users cannot bypass limits by creating many conversations.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import QuotaExceededError
from app.core.plans import get_limit
from app.models.usage_log import UsageLog


def _month_start(now: datetime | None = None) -> datetime:
    now = now or datetime.now(timezone.utc)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


async def count_feature_usage(
    db: AsyncSession, user_id: uuid.UUID, feature: str
) -> int:
    """Count usage units for a feature in the current month."""
    stmt = (
        select(func.coalesce(func.sum(UsageLog.units), 0))
        .where(UsageLog.user_id == user_id)
        .where(UsageLog.feature == feature)
        .where(UsageLog.created_at >= _month_start())
    )
    return int((await db.execute(stmt)).scalar_one())


async def enforce_quota(
    db: AsyncSession, user_id: uuid.UUID, plan: str, feature: str
) -> None:
    """Raise QuotaExceededError if the user is at/over their monthly limit."""
    limit = get_limit(plan, feature)
    if limit is None:  # unlimited
        return

    # For documents/datasets/reports — count actual existing rows, not logs
    # This way deleted items free up quota.
    if feature == "documents":
        from sqlalchemy import func, select
        from app.models.document import Document
        used = int((await db.execute(
            select(func.count(Document.id)).where(Document.user_id == user_id)
        )).scalar_one())
    elif feature == "datasets":
        from sqlalchemy import func, select
        from app.models.dataset import Dataset
        used = int((await db.execute(
            select(func.count(Dataset.id)).where(Dataset.user_id == user_id)
        )).scalar_one())
    elif feature == "reports":
        from sqlalchemy import func, select
        from app.models.report import Report
        used = int((await db.execute(
            select(func.count(Report.id)).where(Report.user_id == user_id)
        )).scalar_one())
    else:
        used = await count_feature_usage(db, user_id, feature)

    if used >= limit:
        raise QuotaExceededError(
            f"Monthly {feature} limit reached ({used}/{limit}) for the {plan} plan."
        )


async def log_usage(
    db: AsyncSession,
    user_id: uuid.UUID,
    feature: str,
    action: str,
    *,
    tokens: int = 0,
    units: int = 1,
    details: dict | None = None,
) -> None:
    """Record a usage event (append-only)."""
    db.add(
        UsageLog(
            user_id=user_id,
            feature=feature,
            action=action,
            tokens=tokens,
            units=units,
            details=details,
        )
    )
    await db.flush()


async def usage_summary(db: AsyncSession, user_id: uuid.UUID, plan: str) -> dict:
    """Return current-month usage vs limits for the dashboard/usage page."""
    summary: dict[str, dict] = {}
    for feature in ("messages", "documents", "datasets", "reports"):
        used = await count_feature_usage(db, user_id, feature)
        summary[feature] = {"used": used, "limit": get_limit(plan, feature)}
    return summary
