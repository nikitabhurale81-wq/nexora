"""Feedback API endpoint tests.

NOTE: These tests require full authentication integration and are currently skipped
in the test suite. The underlying service logic is tested in test_admin_and_feedback.py.
"""

from __future__ import annotations

import uuid

import pytest

pytestmark = pytest.mark.skip(reason="Integration tests require Supabase auth setup")


async def test_submit_feedback(client, user_token):
    r = await client.post(
        "/api/v1/feedback",
        json={"title": "Feature request", "message": "Add dark mode", "category": "feature"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert r.status_code == 200
    data = r.json()["data"]
    assert data["title"] == "Feature request"
    assert data["status"] == "new"


async def test_list_feedback_admin_only(client, user_token):
    r = await client.get("/api/v1/feedback", headers={"Authorization": f"Bearer {user_token}"})
    assert r.status_code == 403


async def test_list_feedback_as_admin(client, admin_token, db_session, test_user):
    from app.services.feedback import service as feedback

    await feedback.submit_feedback(db_session, test_user, title="Bug", message="crash", category="bug")
    await db_session.commit()
    r = await client.get("/api/v1/feedback?category=bug", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    data = r.json()["data"]
    assert len(data) >= 1


async def test_get_feedback_detail(client, admin_token, db_session, test_user):
    from app.services.feedback import service as feedback

    fb = await feedback.submit_feedback(db_session, test_user, title="Test", message="msg")
    await db_session.commit()
    r = await client.get(f"/api/v1/feedback/{fb.id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200


async def test_update_feedback_status(client, admin_token, db_session, test_user):
    from app.services.feedback import service as feedback

    fb = await feedback.submit_feedback(db_session, test_user, title="Issue", message="problem")
    await db_session.commit()
    r = await client.patch(
        f"/api/v1/feedback/{fb.id}",
        json={"status": "reviewing"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    assert r.json()["data"]["status"] == "reviewing"
