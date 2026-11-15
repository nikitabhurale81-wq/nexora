"""Report Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReportSection(BaseModel):
    heading: str = Field(default="", max_length=300)
    body: str = Field(default="", max_length=20000)


class ReportCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    report_type: str = Field(default="summary")
    format: str = Field(default="pdf")
    source_type: str = Field(default="manual")  # manual | conversation | dataset
    source_id: uuid.UUID | None = None
    sections: list[ReportSection] = Field(default_factory=list)


class ReportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    report_type: str
    format: str
    status: str
    source_type: str | None = None
    created_at: datetime
