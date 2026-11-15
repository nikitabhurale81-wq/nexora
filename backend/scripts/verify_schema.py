"""List public tables and the current Alembic version to verify migrations."""

from __future__ import annotations

import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text

from app.database.session import dispose_engine, get_engine


async def main() -> None:
    engine = get_engine()
    async with engine.connect() as conn:
        tables = (
            await conn.execute(
                text(
                    "SELECT tablename FROM pg_tables "
                    "WHERE schemaname = 'public' ORDER BY tablename"
                )
            )
        ).scalars().all()
        print(f"Public tables ({len(tables)}):")
        for t in tables:
            print("  -", t)

        version = (
            await conn.execute(text("SELECT version_num FROM alembic_version"))
        ).scalar_one_or_none()
        print("Alembic version:", version)
    await dispose_engine()


if __name__ == "__main__":
    asyncio.run(main())
