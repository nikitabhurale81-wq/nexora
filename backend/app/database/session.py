"""Async database engine and session management.

The engine is created lazily so the application starts even when no
DATABASE_URL is configured (free-tier friendly). Endpoints that need the
database depend on ``get_db`` and receive a clear 503 if it is unavailable.
"""

from __future__ import annotations

import ssl
from collections.abc import AsyncGenerator
from urllib.parse import urlsplit

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings
from app.core.exceptions import ServiceUnavailableError
from app.core.logging import get_logger

logger = get_logger("nexora.database")

_engine: AsyncEngine | None = None
_sessionmaker: async_sessionmaker[AsyncSession] | None = None

_LOCAL_HOSTS = {"localhost", "127.0.0.1", "::1", ""}


def _normalize_async_url(url: str) -> str:
    """Ensure the URL uses an async driver (asyncpg)."""
    if url.startswith("postgresql+asyncpg://"):
        return url
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    return url


def build_connect_args(url: str) -> dict:
    """Build asyncpg connect args.

    Remote Postgres (e.g. Supabase) requires TLS; local databases do not.

    The connection is encrypted, but certificate-chain verification is
    relaxed because the Supabase pooler / local trust store can present a
    chain that does not verify on some machines (and TLS-inspecting
    antivirus/proxies trip strict verification). This is the common
    ``sslmode=require`` behaviour. For strict verification in production,
    supply the provider CA certificate and tighten this context.

    ``statement_cache_size=0`` keeps us compatible with connection poolers
    (Supabase Supavisor) that can choke on cached prepared statements.
    """
    host = urlsplit(url).hostname or ""
    if host in _LOCAL_HOSTS:
        return {}
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    return {"ssl": ssl_ctx, "statement_cache_size": 0}


def get_engine() -> AsyncEngine:
    """Return the lazily-initialized async engine."""
    global _engine, _sessionmaker
    if not settings.database_configured:
        raise ServiceUnavailableError(
            "Database is not configured. Set DATABASE_URL to enable this feature."
        )
    if _engine is None:
        url = _normalize_async_url(settings.database_url)
        # Conservative pool sizing for free-tier / serverless hosts.
        _engine = create_async_engine(
            url,
            echo=False,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=5,
            pool_recycle=1800,
            connect_args=build_connect_args(url),
        )
        _sessionmaker = async_sessionmaker(
            bind=_engine, expire_on_commit=False, class_=AsyncSession
        )
        logger.info("Database engine initialized.")
    return _engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    """Return the session factory, initializing the engine if needed."""
    if _sessionmaker is None:
        get_engine()
    assert _sessionmaker is not None  # for type checkers
    return _sessionmaker


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding a transactional async session."""
    factory = get_sessionmaker()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def check_db_connection() -> bool:
    """Lightweight connectivity probe used by the readiness endpoint."""
    if not settings.database_configured:
        return False
    from sqlalchemy import text

    try:
        engine = get_engine()
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:  # pragma: no cover - depends on live DB
        logger.warning("Database connectivity check failed: %s", exc)
        return False


async def dispose_engine() -> None:
    """Dispose the engine on shutdown if it was created."""
    global _engine, _sessionmaker
    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _sessionmaker = None
        logger.info("Database engine disposed.")
