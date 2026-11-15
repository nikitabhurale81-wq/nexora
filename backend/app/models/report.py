"""Generated report model (metadata + storage key only)."""

from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.mixins import TimestampMixin, UUIDPkMixin

REPORT_TYPES = ("summary", "analysis", "custom")
REPORT_FORMATS = ("pdf", "docx", "xlsx", "csv")
REPORT_STATUSES = ("pending", "processing", "completed", "failed")
REPORT_SOURCE_TYPES = ("chat", "document", "dataset", "manual")


class Report(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "reports"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    report_type: Mapped[str] = mapped_column(String(20), default="summary", nullable=False)
    format: Mapped[str] = mapped_column(String(10), default="pdf", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    storage_key: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    source_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    source_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True)
