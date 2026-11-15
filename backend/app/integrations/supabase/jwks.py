"""Supabase JWKS client.

Fetches the project's public signing keys (JWKS) and caches them with a TTL.
Only public keys are handled here — no secrets. Used to verify the signature
of Supabase-issued access tokens.
"""

from __future__ import annotations

import time

import httpx

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("nexora.auth.jwks")


class JWKSCache:
    """In-memory JWKS cache with TTL and on-miss refresh (for key rotation)."""

    def __init__(self, ttl_seconds: int = 600) -> None:
        self._ttl = ttl_seconds
        self._keys: dict[str, dict] = {}
        self._fetched_at: float = 0.0

    async def _refresh(self) -> None:
        url = settings.supabase_jwks_url
        if not url:
            raise RuntimeError("SUPABASE_JWKS_URL is not configured")
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                url,
                headers={"apikey": settings.supabase_anon_key} if settings.supabase_anon_key else {},
            )
            resp.raise_for_status()
            data = resp.json()
        self._keys = {k["kid"]: k for k in data.get("keys", []) if k.get("kid")}
        self._fetched_at = time.time()
        logger.info("Refreshed Supabase JWKS (%d key(s))", len(self._keys))

    async def get_key(self, kid: str) -> dict | None:
        """Return the JWK for ``kid``, refreshing once on a cache miss."""
        expired = (time.time() - self._fetched_at) > self._ttl
        if not self._keys or expired:
            await self._refresh()
        if kid not in self._keys:
            # Possible key rotation — force one refresh before giving up.
            await self._refresh()
        return self._keys.get(kid)

    def clear(self) -> None:
        self._keys = {}
        self._fetched_at = 0.0


jwks_cache = JWKSCache()
