"""Coding Assistant Pydantic schemas."""

from __future__ import annotations

from pydantic import BaseModel, Field


class CodingRequest(BaseModel):
    action: str = Field(description="explain | generate | debug | review | refactor | explain_error")
    language: str = Field(default="python", max_length=40)
    code: str = Field(default="", max_length=40000)
    instructions: str = Field(default="", max_length=8000)
    error: str = Field(default="", max_length=8000)
