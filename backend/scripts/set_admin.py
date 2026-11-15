"""Promote or demote a user's role — trusted server-side operation only.

Admin privileges must never be grantable from the API or client. Run this
script from a trusted machine with database access.

Usage:
    .venv\\Scripts\\python.exe scripts\\set_admin.py user@example.com --role admin
    .venv\\Scripts\\python.exe scripts\\set_admin.py user@example.com --role user
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select

from app.database.session import dispose_engine, get_sessionmaker
from app.models.user import User

VALID_ROLES = ("user", "admin")


async def set_role(email: str, role: str) -> None:
    if role not in VALID_ROLES:
        raise SystemExit(f"Invalid role '{role}'. Use one of {VALID_ROLES}.")
    factory = get_sessionmaker()
    async with factory() as db:
        user = (
            await db.execute(select(User).where(User.email == email))
        ).scalar_one_or_none()
        if user is None:
            raise SystemExit(f"No user found with email '{email}'.")
        user.role = role
        await db.commit()
        print(f"OK: {email} is now '{role}'.")
    await dispose_engine()


def main() -> None:
    parser = argparse.ArgumentParser(description="Set a user's role.")
    parser.add_argument("email", help="User email address")
    parser.add_argument("--role", default="admin", choices=VALID_ROLES)
    args = parser.parse_args()
    asyncio.run(set_role(args.email, args.role))


if __name__ == "__main__":
    main()
