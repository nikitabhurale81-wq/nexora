"""Storage abstraction.

Feature code depends only on this interface, so the object-storage provider
(Cloudflare R2 in production, a local folder in development) can be swapped
through configuration.
"""

from __future__ import annotations

from abc import ABC, abstractmethod


class Storage(ABC):
    name: str = "base"

    @abstractmethod
    async def upload(self, key: str, data: bytes, content_type: str) -> None:
        """Store bytes under ``key``."""

    @abstractmethod
    async def download(self, key: str) -> bytes:
        """Return the bytes stored under ``key``."""

    @abstractmethod
    async def delete(self, key: str) -> None:
        """Delete the object at ``key`` (no error if missing)."""

    @abstractmethod
    async def signed_url(self, key: str, expires_seconds: int = 900) -> str:
        """Return a short-lived download URL for ``key``."""
