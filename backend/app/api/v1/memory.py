"""AI Memory endpoints: CRUD, enable/disable, and the global memory setting."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_registered_user
from app.core.responses import success
from app.database.session import get_db
from app.models.user import User
from app.schemas.memory import MemoryCreate, MemoryRead, MemorySettings, MemoryUpdate
from app.services.memory import service as memory
from app.services.users.service import get_preferences

router = APIRouter(prefix="/memory", tags=["memory"])


def _mem(m) -> dict:
    return MemoryRead.model_validate(m).model_dump(mode="json")


@router.get("/settings")
async def read_settings(
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    prefs = await get_preferences(db, user.id)
    return success({"enabled": prefs.memory_enabled})


@router.patch("/settings")
async def update_settings(
    payload: MemorySettings,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    prefs = await get_preferences(db, user.id)
    prefs.memory_enabled = payload.enabled
    await db.flush()
    return success({"enabled": prefs.memory_enabled}, "Memory setting updated")


@router.post("")
async def create(
    payload: MemoryCreate,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    mem = await memory.create_memory(
        db, user, title=payload.title, content=payload.content, category=payload.category
    )
    return success(_mem(mem), "Memory saved")


@router.get("")
async def list_all(
    category: str | None = Query(default=None),
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    mems = await memory.list_memories(db, user, category=category)
    return success([_mem(m) for m in mems])


@router.get("/{memory_id}")
async def detail(
    memory_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    return success(_mem(await memory.get_memory(db, user, memory_id)))


@router.patch("/{memory_id}")
async def update(
    memory_id: uuid.UUID,
    payload: MemoryUpdate,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    mem = await memory.update_memory(
        db, user, memory_id, **payload.model_dump(exclude_unset=True)
    )
    return success(_mem(mem), "Memory updated")


@router.delete("/{memory_id}")
async def remove(
    memory_id: uuid.UUID,
    user: User = Depends(require_registered_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    await memory.delete_memory(db, user, memory_id)
    return success({"id": str(memory_id)}, "Memory deleted")
