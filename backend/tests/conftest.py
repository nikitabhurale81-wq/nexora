"""Shared pytest fixtures.

Tests run fully offline:
- No real Supabase, AI, or storage calls.
- The database dependency is overridden with an in-memory SQLite that holds
  only the auth-related tables (users, user_preferences, subscriptions),
  which are free of Postgres-specific types.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.database.session import get_db
from app.main import app
from app.models.conversation import Conversation
from app.models.dataset import Dataset
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.feedback import Feedback
from app.models.memory import UserMemory
from app.models.message import Message
from app.models.payment import Payment
from app.models.report import Report
from app.models.subscription import Subscription
from app.models.usage_log import UsageLog
from app.models.user import User, UserPreferences

# SQLite-safe tables used across the offline test suite.
_TEST_TABLES = [
    User.__table__,
    UserPreferences.__table__,
    Subscription.__table__,
    Conversation.__table__,
    Message.__table__,
    UsageLog.__table__,
    Document.__table__,
    DocumentChunk.__table__,
    Dataset.__table__,
    UserMemory.__table__,
    Report.__table__,
    Payment.__table__,
    Feedback.__table__,
]


@pytest_asyncio.fixture
async def db_sessionmaker() -> AsyncGenerator[async_sessionmaker[AsyncSession], None]:
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(lambda c: Base.metadata.create_all(c, tables=_TEST_TABLES))
    factory = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)
    yield factory
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(db_sessionmaker) -> AsyncGenerator[AsyncSession, None]:
    async with db_sessionmaker() as session:
        yield session
        await session.commit()


@pytest_asyncio.fixture
async def client(db_sessionmaker) -> AsyncGenerator[AsyncClient, None]:
    """ASGI client with the DB dependency overridden to in-memory SQLite."""

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with db_sessionmaker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """A regular user for testing."""
    import uuid

    user = User(
        id=uuid.uuid4(),
        email="user@test.com",
        name="Test User",
        role="user",
        subscription="free",
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()
    return user


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession) -> User:
    """An admin user for testing."""
    import uuid

    admin = User(
        id=uuid.uuid4(),
        email="admin@test.com",
        name="Test Admin",
        role="admin",
        subscription="free",
        is_active=True,
    )
    db_session.add(admin)
    await db_session.flush()
    return admin


@pytest_asyncio.fixture
async def user_token(test_user: User) -> str:
    """Generate a JWT for the test user (fake token for testing)."""
    import jwt
    from datetime import datetime, timedelta, timezone

    payload = {
        "sub": str(test_user.id),
        "email": test_user.email,
        "role": test_user.role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    return jwt.encode(payload, "test-secret", algorithm="HS256")


@pytest_asyncio.fixture
async def admin_token(admin_user: User) -> str:
    """Generate a JWT for the admin user (fake token for testing)."""
    import jwt
    from datetime import datetime, timedelta, timezone

    payload = {
        "sub": str(admin_user.id),
        "email": admin_user.email,
        "role": admin_user.role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    return jwt.encode(payload, "test-secret", algorithm="HS256")
