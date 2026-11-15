"""Document chunk model with a pgvector embedding column.

The embedding dimension matches the default embedding model
(Gemini ``text-embedding-004`` = 768 dims). Changing the embedding provider
to a different dimension requires a migration to alter this column.
"""

from __future__ import annotations

import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, ForeignKey, Integer, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.mixins import CreatedAtMixin, UUIDPkMixin

EMBEDDING_DIM = 768

# Native pgvector on PostgreSQL; plain JSON on other dialects (SQLite tests).
# Vector similarity search only runs on PostgreSQL.
_EMBEDDING_TYPE = Vector(EMBEDDING_DIM).with_variant(JSON(), "sqlite")


class DocumentChunk(UUIDPkMixin, CreatedAtMixin, Base):
    __tablename__ = "document_chunks"

    document_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Denormalized owner id — never mix chunks across users.
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    embedding: Mapped[list[float] | None] = mapped_column(_EMBEDDING_TYPE, nullable=True)
