"""Document service tests: upload, ownership, delete (in-memory storage)."""

from __future__ import annotations

import uuid

import pytest

from app.core.exceptions import NotFoundError, ValidationAppError
from app.models.user import User
from app.services.documents import service as docsvc


class MemStorage:
    def __init__(self) -> None:
        self.data: dict[str, bytes] = {}

    async def upload(self, key, data, content_type):
        self.data[key] = data

    async def download(self, key):
        return self.data[key]

    async def delete(self, key):
        self.data.pop(key, None)

    async def signed_url(self, key, expires_seconds=900):
        return f"mem://{key}"


@pytest.fixture
def mem_storage(monkeypatch):
    store = MemStorage()
    monkeypatch.setattr(docsvc, "get_storage", lambda: store)
    return store


async def _user(db, plan="free") -> User:
    u = User(id=uuid.uuid4(), email=f"{uuid.uuid4().hex}@ex.com", role="user", subscription=plan, is_active=True)
    db.add(u)
    await db.flush()
    return u


async def test_upload_creates_document_and_stores_file(db_session, mem_storage):
    user = await _user(db_session)
    doc = await docsvc.create_document(
        db_session, user, filename="notes.txt", data=b"hello world", content_type="text/plain"
    )
    assert doc.status == "uploaded"
    assert doc.file_type == "txt"
    assert doc.storage_key in mem_storage.data

    docs = await docsvc.list_documents(db_session, user)
    assert len(docs) == 1


async def test_upload_rejects_unsupported_type(db_session, mem_storage):
    user = await _user(db_session)
    with pytest.raises(ValidationAppError):
        await docsvc.create_document(
            db_session, user, filename="x.exe", data=b"x", content_type="application/octet-stream"
        )


async def test_ownership_isolation(db_session, mem_storage):
    owner = await _user(db_session)
    other = await _user(db_session)
    doc = await docsvc.create_document(
        db_session, owner, filename="a.txt", data=b"secret", content_type="text/plain"
    )
    with pytest.raises(NotFoundError):
        await docsvc.get_document(db_session, other, doc.id)


async def test_delete_removes_document_and_object(db_session, mem_storage):
    user = await _user(db_session)
    doc = await docsvc.create_document(
        db_session, user, filename="a.txt", data=b"data", content_type="text/plain"
    )
    await docsvc.delete_document(db_session, user, doc.id)
    assert await docsvc.list_documents(db_session, user) == []
    assert doc.storage_key not in mem_storage.data
