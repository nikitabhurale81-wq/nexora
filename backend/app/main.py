"""NEXORA AI — FastAPI application entrypoint.

Creates the app with CORS, global error handling, structured logging, and a
lazy lifecycle so optional integrations never block startup. Production
configuration is validated before the app begins serving.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger
from app.core.responses import success
from app.database.session import dispose_engine

configure_logging()
logger = get_logger("nexora.app")


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Application startup/shutdown lifecycle."""
    if settings.is_production:
        # Fail fast on an unsafe/incomplete production configuration.
        settings.validate_production()
    logger.info(
        "Starting %s v%s (env=%s)",
        settings.app_name,
        settings.app_version,
        settings.app_env,
    )
    yield
    await dispose_engine()
    logger.info("Shutdown complete.")


def create_app() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Backend API for the NEXORA AI productivity workspace.",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # CORS — explicit origins only; never wildcard with credentials.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    register_exception_handlers(app)

    # Versioned API (health lives at /api/v1/health).
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.get("/", tags=["root"])
    async def root() -> dict:
        """Service banner with documentation links."""
        return success(
            {
                "service": settings.app_name,
                "version": settings.app_version,
                "docs": "/docs",
                "health": f"{settings.api_v1_prefix}/health",
            },
            message="NEXORA AI backend is running",
        )

    return app


app = create_app()
