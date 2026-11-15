"""Health and readiness endpoints.

``/health``  — liveness, always 200, no external dependencies.
``/health/ready`` — readiness, reports which integrations are configured
and whether the database is reachable. Never exposes secret values.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.core.config import settings
from app.core.responses import success
from app.database.session import check_db_connection

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    """Liveness probe. Succeeds whenever the process is running."""
    return success(
        {
            "status": "ok",
            "app": settings.app_name,
            "version": settings.app_version,
            "env": settings.app_env,
        },
        message="Service is alive",
    )


@router.get("/health/ready")
async def readiness() -> dict:
    """Readiness probe reporting configured integrations (no secrets)."""
    db_ok = await check_db_connection()
    integrations = {
        "database": "connected" if db_ok else (
            "configured" if settings.database_configured else "not_configured"
        ),
        "supabase_auth": "configured" if settings.supabase_configured else "not_configured",
        "storage_r2": "configured" if settings.storage_configured else "not_configured",
        "redis": "configured" if settings.redis_configured else "not_configured",
        "voice": "configured" if settings.voice_configured else "not_configured",
        "ai_provider": settings.ai_provider or "not_configured",
    }
    return success(
        {"status": "ready", "integrations": integrations},
        message="Readiness report",
    )
