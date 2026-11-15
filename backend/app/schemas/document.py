"""Document and RAG Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    file_type: str
    size_bytes: int
    status: str
    page_count: int | None = None
    error: str | None = None
    created_at: datetime


class RagQueryRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)
    document_id: uuid.UUID | None = None


class RagSource(BaseModel):
    document_id: str
    page_number: int | None = None
    snippet: str


class RagAnswer(BaseModel):
    answer: str
    sources: list[RagSource]
    model: str
