"""Feedback / support-ticket model."""

from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.mixins import TimestampMixin, UUIDPkMixin

FEEDBACK_CATEGORIES = ("bug", "feature", "quality", "praise", "support")
FEEDBACK_PRIORITIES = ("low", "medium", "high")
FEEDBACK_STATUSES = ("new", "reviewing", "resolved")


class Feedback(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "feedback"

    # Nullable: a guest may submit feedback without an account.
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    category: Mapped[str] = mapped_column(String(20), default="support", nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(10), default="medium", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="new", nullable=False)
    assignee: Mapped[str | None] = mapped_column(String(200), nullable=True)
    votes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
