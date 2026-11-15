"""Local filesystem storage — DEVELOPMENT/TEST ONLY.

Used when Cloudflare R2 is not configured so the full upload/RAG pipeline
works locally. NOT for production: files on an app server's disk are
ephemeral. Production must configure R2 (see storage/r2.py).
"""

from __future__ import annotations

import asyncio
from pathlib import Path

from app.core.exceptions import NotFoundError
from app.services.storage.base import Storage

_BASE = Path("uploads")  # gitignored


class LocalStorage(Storage):
    name = "local"

    def _path(self, key: str) -> Path:
        safe = key.replace("..", "_").lstrip("/\\")
        return _BASE / safe

    async def upload(self, key: str, data: bytes, content_type: str) -> None:
        def _write() -> None:
            path = self._path(key)
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)

        await asyncio.to_thread(_write)

    async def download(self, key: str) -> bytes:
        def _read() -> bytes:
            path = self._path(key)
            if not path.exists():
                raise NotFoundError("Stored file not found.")
            return path.read_bytes()

        return await asyncio.to_thread(_read)

    async def delete(self, key: str) -> None:
        def _delete() -> None:
            path = self._path(key)
            if path.exists():
                path.unlink()

        await asyncio.to_thread(_delete)

    async def signed_url(self, key: str, expires_seconds: int = 900) -> str:
        # No real signing locally; return an app-relative marker path.
        return f"/local-storage/{key}"
