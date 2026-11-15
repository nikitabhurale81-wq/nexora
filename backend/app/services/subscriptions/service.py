"""Subscription and billing reads.

Payment processing is intentionally DISABLED — no charges are simulated. Plan
limits are config-driven (see core/plans.py). Plan changes are not performed
here because they require a real payment provider, which is not configured.
"""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.plans import PLAN_LIMITS
from app.models.payment import Payment
from app.models.subscription import Subscription
from app.models.user import User

PLAN_CATALOG = [
    {"id": "free", "name": "Free", "price_monthly": 0, "limits": PLAN_LIMITS["free"]},
    {"id": "pro", "name": "Pro", "price_monthly": None, "limits": PLAN_LIMITS["pro"]},
    {"id": "enterprise", "name": "Enterprise", "price_monthly": None, "limits": PLAN_LIMITS["enterprise"]},
]


async def get_current(db: AsyncSession, user: User) -> dict:
    sub = (
        await db.execute(select(Subscription).where(Subscription.user_id == user.id))
    ).scalar_one_or_none()
    if sub is None:
        sub = Subscription(user_id=user.id, plan="free", status="active")
        db.add(sub)
        await db.flush()
    return {
        "plan": sub.plan,
        "status": sub.status,
        "current_period_start": sub.current_period_start.isoformat() if sub.current_period_start else None,
        "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
        "limits": PLAN_LIMITS.get(sub.plan, PLAN_LIMITS["free"]),
        "payments_enabled": False,
    }


def plans() -> list[dict]:
    return PLAN_CATALOG


async def payments(db: AsyncSession, user: User) -> list[dict]:
    rows = (
        await db.execute(
            select(Payment).where(Payment.user_id == user.id).order_by(Payment.created_at.desc())
        )
    ).scalars().all()
    return [
        {
            "id": str(p.id),
            "amount": float(p.amount),
            "currency": p.currency,
            "status": p.status,
            "provider": p.provider,
            "invoice_id": p.invoice_id,
            "created_at": p.created_at.isoformat(),
        }
        for p in rows
    ]
