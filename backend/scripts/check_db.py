"""Quick database connectivity check.

Prints the Postgres version and whether the pgvector extension is enabled.
Any connection error surfaces with a full traceback.

Usage:
    .venv\\Scripts\\python.exe scripts\\check_db.py
"""

from __future__ import annotations

import asyncio
import os
import sys

# Allow running directly: add the project root (parent of scripts/) to path.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text

from app.database.session import dispose_engine, get_engine


async def main() -> None:
    engine = get_engine()
    async with engine.connect() as conn:
        version = (await conn.execute(text("SELECT version()"))).scalar_one()
        print("Connected OK")
        print("Postgres:", version)

        vector = (
            await conn.execute(
                text("SELECT extname FROM pg_extension WHERE extname = 'vector'")
            )
        ).first()
        print("pgvector:", "enabled" if vector else "NOT enabled")
    await dispose_engine()


if __name__ == "__main__":
    asyncio.run(main())
