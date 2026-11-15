"""Payment record model. Payment processing stays disabled until configured;
this table captures invoice/transaction history when a provider is added.
"""

from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Numeric, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.mixins import CreatedAtMixin, UUIDPkMixin

PAYMENT_STATUSES = ("pending", "paid", "failed", "refunded")


class Payment(UUIDPkMixin, CreatedAtMixin, Base):
    __tablename__ = "payments"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    subscription_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True
    )
    amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    provider: Mapped[str | None] = mapped_column(String(50), nullable=True)
    invoice_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
