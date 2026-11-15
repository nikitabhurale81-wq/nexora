"""Report rendering/service + subscription read tests."""

from __future__ import annotations

import uuid

import pytest

from app.core.exceptions import NotFoundError, ValidationAppError
from app.models.user import User
from app.services.reports import renderers
from app.services.reports import service as reports
from app.services.subscriptions import service as subs

SECTIONS = [{"heading": "Overview", "body": "Line one\nLine two"}]


class MemStorage:
    def __init__(self):
        self.data = {}

    async def upload(self, key, d, c):
        self.data[key] = d

    async def download(self, key):
        return self.data[key]

    async def delete(self, key):
        self.data.pop(key, None)

    async def signed_url(self, key, expires_seconds=900):
        return f"mem://{key}"


@pytest.fixture
def mem(monkeypatch):
    store = MemStorage()
    monkeypatch.setattr(reports, "get_storage", lambda: store)
    return store


async def _user(db):
    u = User(id=uuid.uuid4(), email=f"{uuid.uuid4().hex}@ex.com", role="user", subscription="free", is_active=True)
    db.add(u)
    await db.flush()
    return u


# ---- Renderers ----
@pytest.mark.parametrize("fmt,magic", [("pdf", b"%PDF"), ("docx", b"PK"), ("xlsx", b"PK"), ("csv", b"")])
def test_render_formats(fmt, magic):
    data, mime = renderers.render("My Report", SECTIONS, fmt)
    assert isinstance(data, bytes) and len(data) > 0
    if magic:
        assert data.startswith(magic)


def test_csv_formula_injection_sanitized():
    data, _ = renderers.render("T", [{"heading": "=cmd", "body": "+evil"}], "csv")
    text = data.decode()
    assert "'=cmd" in text
    assert "'+evil" in text


def test_render_unsupported_format():
    with pytest.raises(ValueError):
        renderers.render("T", SECTIONS, "exe")


# ---- Service ----
async def test_create_manual_report(db_session, mem):
    user = await _user(db_session)
    r = await reports.create_report(db_session, user, title="Q2", fmt="pdf", source_type="manual", sections=SECTIONS)
    assert r.status == "completed"
    assert r.storage_key in mem.data
    assert len(await reports.list_reports(db_session, user)) == 1


async def test_manual_report_requires_sections(db_session, mem):
    user = await _user(db_session)
    with pytest.raises(ValidationAppError):
        await reports.create_report(db_session, user, title="x", fmt="pdf", source_type="manual", sections=[])


async def test_report_bad_format(db_session, mem):
    user = await _user(db_session)
    with pytest.raises(ValidationAppError):
        await reports.create_report(db_session, user, title="x", fmt="exe", source_type="manual", sections=SECTIONS)


async def test_report_ownership_and_delete(db_session, mem):
    owner = await _user(db_session)
    other = await _user(db_session)
    r = await reports.create_report(db_session, owner, title="x", fmt="csv", source_type="manual", sections=SECTIONS)
    with pytest.raises(NotFoundError):
        await reports.get_report(db_session, other, r.id)
    await reports.delete_report(db_session, owner, r.id)
    assert await reports.list_reports(db_session, owner) == []


# ---- Subscriptions ----
async def test_current_subscription_defaults_free(db_session):
    user = await _user(db_session)
    cur = await subs.get_current(db_session, user)
    assert cur["plan"] == "free"
    assert cur["payments_enabled"] is False
    assert "messages" in cur["limits"]


def test_plans_catalog():
    ids = {p["id"] for p in subs.plans()}
    assert ids == {"free", "pro", "enterprise"}


async def test_payments_empty(db_session):
    user = await _user(db_session)
    assert await subs.payments(db_session, user) == []
