"""Phase 2 foundation tests: startup, health, readiness, error envelope."""

from __future__ import annotations

import pytest


@pytest.mark.asyncio
async def test_root_banner(client):
    resp = await client.get("/")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["service"] == "NEXORA AI"


@pytest.mark.asyncio
async def test_health_liveness(client):
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["status"] == "ok"


@pytest.mark.asyncio
async def test_readiness_reports_integrations(client):
    resp = await client.get("/api/v1/health/ready")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["status"] == "ready"
    integrations = body["data"]["integrations"]
    # Structure is stable regardless of which integrations are configured.
    for key in ("database", "supabase_auth", "storage_r2", "redis", "voice", "ai_provider"):
        assert key in integrations


@pytest.mark.asyncio
async def test_unknown_route_uses_error_envelope(client):
    resp = await client.get("/api/v1/does-not-exist")
    assert resp.status_code == 404
    body = resp.json()
    assert body["success"] is False
    assert body["error"]["code"] == "HTTP_404"
