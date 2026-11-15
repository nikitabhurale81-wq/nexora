"""Subscription, plans, and payment-history endpoints (read-only; no charges)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_registered_user
from app.core.responses import success
from app.database.session import get_db
from app.models.user import User
from app.services.subscriptions import service as subs

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("")
async def current(
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return success(await subs.get_current(db, user))


@router.get("/plans")
async def plans(user: User = Depends(require_registered_user)) -> dict:
    return success(subs.plans())


@router.get("/payments")
async def payments(
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return success(await subs.payments(db, user))
