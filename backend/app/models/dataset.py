"""Dataset model for Excel/CSV analysis (metadata + storage key only)."""

from __future__ import annotations

import uuid

from sqlalchemy import BigInteger, ForeignKey, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.mixins import TimestampMixin, UUIDPkMixin
from app.models.types import JSONB_VARIANT

DATASET_TYPES = ("csv", "xlsx", "xls")
DATASET_STATUSES = ("uploaded", "processing", "completed", "failed")


class Dataset(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "datasets"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(10), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    storage_key: Mapped[str] = mapped_column(String(1024), nullable=False)
    row_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    columns: Mapped[list | None] = mapped_column(JSONB_VARIANT, nullable=True)
    sheet_names: Mapped[list | None] = mapped_column(JSONB_VARIANT, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="uploaded", nullable=False)
