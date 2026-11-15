"""Storage factory.

Returns Cloudflare R2 when configured, otherwise the local dev fallback.
A warning is logged when the dev fallback is used so it is never mistaken
for production storage.
"""

from __future__ import annotations

from app.core.config import settings
from app.core.logging import get_logger
from app.services.storage.base import Storage
from app.services.storage.local import LocalStorage
from app.services.storage.r2 import R2Storage

logger = get_logger("nexora.storage")

_warned = False


def get_storage() -> Storage:
    global _warned
    if settings.storage_configured:
        return R2Storage()
    if not _warned:
        logger.warning(
            "Cloudflare R2 is not configured — using LOCAL dev storage. "
            "Do not use this in production."
        )
        _warned = True
    return LocalStorage()
