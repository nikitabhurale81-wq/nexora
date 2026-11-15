"""Admin-only endpoints: user management, activity logs, system stats."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_admin
from app.core.responses import success
from app.database.session import get_db
from app.models.user import User
from app.services.admin import service as admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
async def list_users(
    role: str | None = Query(default=None),
    active: bool | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return success(await admin.list_users(db, role=role, active=active, limit=limit))


@router.get("/users/{user_id}")
async def user_detail(
    user_id: uuid.UUID,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return success(await admin.get_user_detail(db, user_id))


@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: uuid.UUID,
    is_active: bool,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await admin.update_user_status(db, user_id, is_active)
    return success(result, f"User {'activated' if is_active else 'deactivated'}")


@router.get("/activity")
async def activity_logs(
    user_id: uuid.UUID | None = Query(default=None),
    days: int = Query(default=7, ge=1, le=90),
    limit: int = Query(default=100, ge=1, le=1000),
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return success(await admin.activity_logs(db, user_id=user_id, days=days, limit=limit))


@router.get("/stats")
async def system_stats(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return success(await admin.system_stats(db))
