"""Application configuration.

Settings are loaded from environment variables (and a local ``.env`` file in
development) using Pydantic Settings. Every value has a safe development
default so the app can start before external services are configured.
Production mode is validated explicitly before the app is allowed to serve.
"""

from __future__ import annotations

import json
from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed application settings sourced from the environment."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application ------------------------------------------------------
    app_env: str = Field(default="development")
    app_name: str = Field(default="NEXORA AI")
    app_version: str = Field(default="0.1.0")
    secret_key: str = Field(default="dev-insecure-change-me-please-set-a-strong-secret")
    frontend_origin: str = Field(default="http://localhost:3000")
    api_v1_prefix: str = Field(default="/api/v1")

    # --- Database ---------------------------------------------------------
    database_url: str = Field(default="")

    # --- Supabase Auth ----------------------------------------------------
    supabase_url: str = Field(default="")
    supabase_jwks_url: str = Field(default="")
    supabase_jwt_issuer: str = Field(default="")
    supabase_jwt_audience: str = Field(default="authenticated")
    # Optional legacy HS256 shared secret (only if the project uses it).
    supabase_jwt_secret: str = Field(default="")
    # Anon/publishable key (sent as apikey header when fetching JWKS).
    supabase_anon_key: str = Field(default="")
    # Guest session token lifetime (signed with SECRET_KEY, not Supabase).
    guest_token_ttl_minutes: int = Field(default=120)

    # --- AI providers -----------------------------------------------------
    ai_provider: str = Field(default="huggingface")
    gemini_api_key: str = Field(default="")
    openai_api_key: str = Field(default="")
    huggingface_api_key: str = Field(default="")
    huggingface_api_url: str = Field(default="https://router.huggingface.co/v1")
    ai_model: str = Field(default="deepseek-ai/DeepSeek-V3-0324")
    embedding_provider: str = Field(default="gemini")
    embedding_model: str = Field(default="gemini-embedding-001")
    # Target embedding dimension (matches the pgvector column width).
    embedding_dim: int = Field(default=768)

    # --- Object storage (Cloudflare R2) -----------------------------------
    r2_account_id: str = Field(default="")
    r2_access_key_id: str = Field(default="")
    r2_secret_access_key: str = Field(default="")
    r2_bucket_name: str = Field(default="")
    r2_endpoint_url: str = Field(default="")

    # --- Optional cache ---------------------------------------------------
    redis_url: str = Field(default="")

    # --- Voice (optional) -------------------------------------------------
    voice_provider: str = Field(default="gemini")
    stt_api_key: str = Field(default="")
    tts_api_key: str = Field(default="")

    # --- Limits & plans ---------------------------------------------------
    max_upload_size_mb: int = Field(default=25)
    free_plan_limits: dict = Field(
        default_factory=lambda: {
            "messages": 50,
            "documents": 3,
            "datasets": 2,
            "reports": 5,
            "storage_mb": 512,
        }
    )

    # --- Validators -------------------------------------------------------
    @field_validator("free_plan_limits", mode="before")
    @classmethod
    def _parse_free_plan_limits(cls, value: object) -> object:
        """Allow FREE_PLAN_LIMITS to be provided as a JSON string."""
        if isinstance(value, str) and value.strip():
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return {}
        return value

    # --- Derived helpers --------------------------------------------------
    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def cors_origins(self) -> list[str]:
        """Allowed CORS origins parsed from a comma-separated string."""
        return [o.strip() for o in self.frontend_origin.split(",") if o.strip()]

    @property
    def database_configured(self) -> bool:
        return bool(self.database_url.strip())

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_jwks_url.strip())

    @property
    def storage_configured(self) -> bool:
        return bool(self.r2_bucket_name.strip() and self.r2_endpoint_url.strip())

    @property
    def redis_configured(self) -> bool:
        return bool(self.redis_url.strip())

    @property
    def voice_configured(self) -> bool:
        return bool(self.voice_provider.strip())

    def validate_production(self) -> None:
        """Fail fast if required production settings are missing or unsafe.

        Called during startup only when APP_ENV=production so local
        development is never blocked by missing external credentials.
        """
        problems: list[str] = []
        if not self.secret_key or self.secret_key.startswith("dev-insecure"):
            problems.append("SECRET_KEY must be set to a strong unique value.")
        if not self.database_configured:
            problems.append("DATABASE_URL is required in production.")
        if not self.supabase_configured:
            problems.append("SUPABASE_JWKS_URL is required in production.")
        if not self.cors_origins:
            problems.append("FRONTEND_ORIGIN must list at least one origin.")
        if "*" in self.cors_origins:
            problems.append("Wildcard CORS origin is not allowed in production.")
        if problems:
            raise RuntimeError(
                "Invalid production configuration:\n- " + "\n- ".join(problems)
            )


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()


settings = get_settings()
