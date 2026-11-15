"""Configurable subscription plan limits.

Final prices/quotas are NOT fixed yet. Limits are config-driven: the ``free``
plan is overridable via the ``FREE_PLAN_LIMITS`` env var; ``pro`` /
``enterprise`` have sensible defaults here that can be tuned without touching
business logic. A limit of ``None`` means unlimited.
"""

from __future__ import annotations

from app.core.config import settings

# Feature keys align with UsageLog.feature values.
PLAN_LIMITS: dict[str, dict[str, int | None]] = {
    "free": {
        "messages": settings.free_plan_limits.get("messages", 50),
        "documents": settings.free_plan_limits.get("documents", 3),
        "datasets": settings.free_plan_limits.get("datasets", 2),
        "reports": settings.free_plan_limits.get("reports", 5),
        "storage_mb": settings.free_plan_limits.get("storage_mb", 512),
    },
    "pro": {
        "messages": 2000,
        "documents": 100,
        "datasets": 50,
        "reports": 200,
        "storage_mb": 10240,
    },
    "enterprise": {
        "messages": None,
        "documents": None,
        "datasets": None,
        "reports": None,
        "storage_mb": None,
    },
}


def get_limit(plan: str, feature: str) -> int | None:
    """Return the limit for a plan/feature, or None if unlimited/unknown."""
    return PLAN_LIMITS.get(plan, PLAN_LIMITS["free"]).get(feature)
