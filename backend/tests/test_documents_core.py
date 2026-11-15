"""Extraction, chunking, and upload-validation tests (pure, offline)."""

from __future__ import annotations

import pytest

from app.core.exceptions import ValidationAppError
from app.services.documents.chunk import chunk_pages
from app.services.documents.extract import extract_text
from app.services.documents.service import validate_upload


def test_extract_txt():
    pages = extract_text(b"hello\nworld", "txt")
    assert pages == [(1, "hello\nworld")]


def test_extract_unsupported_type():
    with pytest.raises(ValidationAppError):
        extract_text(b"x", "exe")


def test_chunking_splits_long_text_with_sequential_indexes():
    chunks = chunk_pages([(1, "a" * 3000)], size=1000, overlap=100)
    assert len(chunks) >= 3
    assert [c.index for c in chunks] == list(range(len(chunks)))
    assert all(c.page_number == 1 for c in chunks)


def test_chunking_preserves_page_numbers():
    chunks = chunk_pages([(1, "alpha"), (2, "beta")], size=1000, overlap=0)
    assert {c.page_number for c in chunks} == {1, 2}


def test_validate_upload_accepts_pdf():
    assert validate_upload("report.pdf", "application/pdf", 1000) == "pdf"


def test_validate_upload_rejects_bad_extension():
    with pytest.raises(ValidationAppError):
        validate_upload("malware.exe", "application/octet-stream", 1000)


def test_validate_upload_rejects_oversize():
    with pytest.raises(ValidationAppError):
        validate_upload("big.pdf", "application/pdf", 999 * 1024 * 1024)


def test_validate_upload_rejects_empty():
    with pytest.raises(ValidationAppError):
        validate_upload("empty.txt", "text/plain", 0)
