"""Text extraction from uploaded documents (PDF / DOCX / TXT).

Returns a list of (page_number, text). DOCX has no fixed pages, so it is
treated as a single logical page. SDKs are imported lazily.
"""

from __future__ import annotations

import io

from app.core.exceptions import ValidationAppError


def extract_text(data: bytes, file_type: str) -> list[tuple[int, str]]:
    ft = file_type.lower()
    if ft == "pdf":
        return _extract_pdf(data)
    if ft == "docx":
        return _extract_docx(data)
    if ft == "txt":
        return [(1, data.decode("utf-8", errors="replace"))]
    raise ValidationAppError(f"Unsupported document type: {file_type}")


def _extract_pdf(data: bytes) -> list[tuple[int, str]]:
    import fitz  # PyMuPDF

    pages: list[tuple[int, str]] = []
    with fitz.open(stream=data, filetype="pdf") as doc:
        for index, page in enumerate(doc):
            pages.append((index + 1, page.get_text()))
    return pages


def _extract_docx(data: bytes) -> list[tuple[int, str]]:
    import docx

    document = docx.Document(io.BytesIO(data))
    text = "\n".join(p.text for p in document.paragraphs)
    return [(1, text)]
