"""Dataset service (upload/ownership) + Coding Assistant service tests."""

from __future__ import annotations

import uuid

import pytest

from app.core.exceptions import NotFoundError, ValidationAppError
from app.integrations.ai_providers.mock import MockProvider
from app.models.user import User
from app.services.coding import service as coding
from app.services.data_analysis import service as data

CSV = b"region,sales\nNorth,100\nSouth,200\n"


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
    monkeypatch.setattr(data, "get_storage", lambda: store)
    return store


async def _user(db):
    u = User(id=uuid.uuid4(), email=f"{uuid.uuid4().hex}@ex.com", role="user", subscription="free", is_active=True)
    db.add(u)
    await db.flush()
    return u


# ---- Data Lab ----
async def test_dataset_upload_extracts_metadata(db_session, mem):
    user = await _user(db_session)
    ds = await data.create_dataset(db_session, user, filename="sales.csv", data=CSV, content_type="text/csv")
    assert ds.row_count == 2
    assert ds.columns == ["region", "sales"]
    assert ds.storage_key in mem.data


async def test_dataset_upload_rejects_bad_type(db_session, mem):
    user = await _user(db_session)
    with pytest.raises(ValidationAppError):
        await data.create_dataset(db_session, user, filename="x.pdf", data=CSV, content_type="application/pdf")


async def test_dataset_ownership(db_session, mem):
    owner = await _user(db_session)
    other = await _user(db_session)
    ds = await data.create_dataset(db_session, owner, filename="s.csv", data=CSV, content_type="text/csv")
    with pytest.raises(NotFoundError):
        await data.get_dataset(db_session, other, ds.id)


async def test_dataset_analyze_roundtrip(db_session, mem):
    user = await _user(db_session)
    ds = await data.create_dataset(db_session, user, filename="s.csv", data=CSV, content_type="text/csv")
    out = await data.analyze(db_session, user, ds.id, "aggregate", {"group_by": "region", "metric": "sales", "agg": "sum"})
    assert dict(zip(out["labels"], out["values"]))["South"] == 200


async def test_dataset_ask_uses_ai(db_session, mem, monkeypatch):
    monkeypatch.setattr(data, "get_ai_provider", lambda: MockProvider())
    user = await _user(db_session)
    ds = await data.create_dataset(db_session, user, filename="s.csv", data=CSV, content_type="text/csv")
    out = await data.ask(db_session, user, ds.id, "What is total sales?")
    assert out["answer"].startswith("[mock reply]")


# ---- Coding Assistant ----
@pytest.fixture
def mock_code_ai(monkeypatch):
    monkeypatch.setattr(coding, "get_ai_provider", lambda: MockProvider())


async def test_coding_explain(db_session, mock_code_ai):
    user = await _user(db_session)
    out = await coding.assist(db_session, user, action="explain", language="python", code="print(1)")
    assert out["action"] == "explain"
    assert out["content"].startswith("[mock reply]")


async def test_coding_generate_requires_instructions(db_session, mock_code_ai):
    user = await _user(db_session)
    with pytest.raises(ValidationAppError):
        await coding.assist(db_session, user, action="generate", instructions="")


async def test_coding_debug_requires_code(db_session, mock_code_ai):
    user = await _user(db_session)
    with pytest.raises(ValidationAppError):
        await coding.assist(db_session, user, action="debug", code="")


async def test_coding_bad_action(db_session, mock_code_ai):
    user = await _user(db_session)
    with pytest.raises(ValidationAppError):
        await coding.assist(db_session, user, action="run", code="print(1)")
