"""User-controlled AI memory.

Rules:
- Users explicitly create/edit/delete memories; we do NOT auto-store every
  message.
- Strict per-user isolation — one user's memories never reach another.
- Disabled memories (and a disabled global preference) are never used.
- We avoid storing obvious secrets (passwords/tokens).
"""

from __future__ import annotations

import re
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ValidationAppError
from app.models.memory import UserMemory
from app.models.user import User
from app.services.users.service import get_preferences

VALID_CATEGORIES = {
    "preferences",
    "work_context",
    "writing_preferences",
    "project_context",
    "other",
}

# Light guard against obviously sensitive content.
_SECRET_PATTERNS = re.compile(
    r"(password\s*[:=]|api[_-]?key\s*[:=]|secret\s*[:=]|bearer\s+[A-Za-z0-9._-]{12,})",
    re.IGNORECASE,
)


def _check_content(content: str) -> None:
    if _SECRET_PATTERNS.search(content):
        raise ValidationAppError(
            "Please don't store passwords, API keys, or tokens in memory."
        )


async def create_memory(
    db: AsyncSession, user: User, *, title: str, content: str, category: str = "other"
) -> UserMemory:
    if category not in VALID_CATEGORIES:
        raise ValidationAppError(f"Invalid category. Use one of: {', '.join(VALID_CATEGORIES)}")
    _check_content(content)
    memory = UserMemory(
        user_id=user.id, title=title.strip(), content=content.strip(),
        category=category, enabled=True,
    )
    db.add(memory)
    await db.flush()
    return memory


async def list_memories(
    db: AsyncSession, user: User, *, category: str | None = None
) -> list[UserMemory]:
    stmt = select(UserMemory).where(UserMemory.user_id == user.id)
    if category:
        stmt = stmt.where(UserMemory.category == category)
    stmt = stmt.order_by(UserMemory.updated_at.desc())
    return list((await db.execute(stmt)).scalars().all())


async def get_memory(db: AsyncSession, user: User, memory_id: uuid.UUID) -> UserMemory:
    mem = await db.get(UserMemory, memory_id)
    if mem is None or mem.user_id != user.id:
        raise NotFoundError("Memory not found.")
    return mem


async def update_memory(
    db: AsyncSession, user: User, memory_id: uuid.UUID, **fields
) -> UserMemory:
    mem = await get_memory(db, user, memory_id)
    if "category" in fields and fields["category"] is not None:
        if fields["category"] not in VALID_CATEGORIES:
            raise ValidationAppError("Invalid category.")
        mem.category = fields["category"]
    if fields.get("title") is not None:
        mem.title = fields["title"].strip()
    if fields.get("content") is not None:
        _check_content(fields["content"])
        mem.content = fields["content"].strip()
    if fields.get("enabled") is not None:
        mem.enabled = bool(fields["enabled"])
    await db.flush()
    return mem


async def delete_memory(db: AsyncSession, user: User, memory_id: uuid.UUID) -> None:
    mem = await get_memory(db, user, memory_id)
    await db.delete(mem)
    await db.flush()


async def get_active_memories(
    db: AsyncSession, user_id: uuid.UUID, limit: int = 10
) -> list[UserMemory]:
    """Enabled memories to personalize chat — respects the global preference."""
    prefs = await get_preferences(db, user_id)
    if not prefs.memory_enabled:
        return []
    stmt = (
        select(UserMemory)
        .where(UserMemory.user_id == user_id)
        .where(UserMemory.enabled.is_(True))
        .order_by(UserMemory.updated_at.desc())
        .limit(limit)
    )
    return list((await db.execute(stmt)).scalars().all())


def memories_to_context(memories: list[UserMemory]) -> str | None:
    """Render active memories as a system-prompt addition."""
    if not memories:
        return None
    lines = [f"- {m.title}: {m.content}" for m in memories]
    return (
        "Known facts about the user (use when relevant; do not repeat verbatim):\n"
        + "\n".join(lines)
    )
