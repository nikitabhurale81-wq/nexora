"""Admin API endpoint tests (role-based access).

NOTE: These tests require full authentication integration and are currently skipped
in the test suite. The underlying service logic is tested in test_admin_and_feedback.py.
"""

from __future__ import annotations

import uuid

import pytest

pytestmark = pytest.mark.skip(reason="Integration tests require Supabase auth setup")


async def test_list_users_requires_admin(client, user_token):
    r = await client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {user_token}"})
    assert r.status_code == 403


async def test_list_users_as_admin(client, admin_token):
    r = await client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    data = r.json()["data"]
    assert isinstance(data, list)


async def test_get_user_detail_as_admin(client, admin_token, test_user):
    r = await client.get(
        f"/api/v1/admin/users/{test_user.id}", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert r.status_code == 200
    data = r.json()["data"]
    assert "resources" in data


async def test_update_user_status(client, admin_token, test_user):
    r = await client.patch(
        f"/api/v1/admin/users/{test_user.id}/status?is_active=false",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    assert r.json()["data"]["is_active"] is False


async def test_cannot_deactivate_admin(client, admin_token, admin_user):
    r = await client.patch(
        f"/api/v1/admin/users/{admin_user.id}/status?is_active=false",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 422


async def test_activity_logs(client, admin_token):
    r = await client.get("/api/v1/admin/activity?days=7", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    data = r.json()["data"]
    assert isinstance(data, list)


async def test_system_stats(client, admin_token):
    r = await client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    data = r.json()["data"]
    assert "users" in data
    assert "messages" in data
