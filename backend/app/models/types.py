"""Shared column types.

``JSONB_VARIANT`` stores JSON as native ``JSONB`` on PostgreSQL (production)
and as generic ``JSON`` on other dialects (e.g. SQLite in tests), so the same
models work in both places without changing the production schema.
"""

from __future__ import annotations

from sqlalchemy import JSON
from sqlalchemy.dialects.postgresql import JSONB

JSONB_VARIANT = JSON().with_variant(JSONB(), "postgresql")
