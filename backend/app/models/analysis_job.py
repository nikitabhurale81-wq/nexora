"""Analysis job model — a safe, allowlisted operation run on a dataset."""

from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.mixins import TimestampMixin, UUIDPkMixin
from app.models.types import JSONB_VARIANT

ANALYSIS_STATUSES = ("pending", "running", "completed", "failed")


class AnalysisJob(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "analysis_jobs"

    dataset_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    operation: Mapped[str] = mapped_column(String(100), nullable=False)
    params: Mapped[dict | None] = mapped_column(JSONB_VARIANT, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    result: Mapped[dict | None] = mapped_column(JSONB_VARIANT, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
