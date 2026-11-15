"""Dataset and data-analysis Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DatasetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    file_type: str
    size_bytes: int
    row_count: int | None = None
    columns: list | None = None
    sheet_names: list | None = None
    status: str
    created_at: datetime


class AnalyzeRequest(BaseModel):
    operation: str = Field(description="preview | stats | filter | aggregate | value_counts")
    params: dict = Field(default_factory=dict)


class DatasetAskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)
