"""User-controlled AI memory model."""

from __future__ import annotations

import uuid

from sqlalchemy import Boolean, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.mixins import TimestampMixin, UUIDPkMixin

MEMORY_CATEGORIES = (
    "preferences",
    "work_context",
    "writing_preferences",
    "project_context",
    "other",
)


class UserMemory(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "user_memories"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(40), default="other", nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
