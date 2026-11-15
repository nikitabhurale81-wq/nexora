"""Usage log — append-only feature/consumption events for quotas & analytics."""

from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Index, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.mixins import CreatedAtMixin, UUIDPkMixin
from app.models.types import JSONB_VARIANT

USAGE_FEATURES = ("messages", "documents", "datasets", "coding", "reports", "voice", "memory")


class UsageLog(UUIDPkMixin, CreatedAtMixin, Base):
    __tablename__ = "usage_logs"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    feature: Mapped[str] = mapped_column(String(30), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    units: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    details: Mapped[dict | None] = mapped_column(JSONB_VARIANT, nullable=True)

    __table_args__ = (
        Index("ix_usage_logs_user_created", "user_id", "created_at"),
    )
