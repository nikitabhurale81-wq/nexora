"""Split extracted page text into overlapping chunks for embedding."""

from __future__ import annotations

from dataclasses import dataclass

CHUNK_SIZE = 1200
CHUNK_OVERLAP = 150


@dataclass
class TextChunk:
    index: int
    page_number: int
    content: str


def chunk_pages(
    pages: list[tuple[int, str]],
    size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> list[TextChunk]:
    chunks: list[TextChunk] = []
    idx = 0
    step = max(1, size - overlap)
    for page_number, text in pages:
        cleaned = (text or "").strip()
        start = 0
        while start < len(cleaned):
            piece = cleaned[start : start + size].strip()
            if piece:
                chunks.append(TextChunk(index=idx, page_number=page_number, content=piece))
                idx += 1
            start += step
    return chunks
