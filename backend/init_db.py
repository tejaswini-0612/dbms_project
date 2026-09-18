"""Create the database and apply schema + seed data if it isn't set up yet.

Safe to run repeatedly: the schema is only applied when the tables are missing,
and the seed rows only when the reference tables are still empty.
"""
import asyncio
import os
import sys
from pathlib import Path
from urllib.parse import urlparse

import asyncpg
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent
SQL_DIR = BACKEND_DIR.parent / "db"

load_dotenv(BACKEND_DIR / ".env")

DEFAULT_URL = "postgresql+asyncpg://postgres:password@localhost:5432/vsms_db"


def parse_dsn(url: str):
    dsn = url.replace("+asyncpg", "")
    parts = urlparse(dsn)
    db_name = parts.path.lstrip("/")
    admin_dsn = dsn.replace(f"/{db_name}", "/postgres")
    return dsn, admin_dsn, db_name


async def connect_with_retry(dsn: str, attempts: int = 10, delay: float = 1.5):
    """The database server may still be booting (e.g. a container that just started)."""
    last_error = None
    for _ in range(attempts):
        try:
            return await asyncpg.connect(dsn)
        except (OSError, asyncpg.CannotConnectNowError) as exc:
            last_error = exc
            await asyncio.sleep(delay)
    raise last_error


async def main():
    dsn, admin_dsn, db_name = parse_dsn(os.getenv("DATABASE_URL") or DEFAULT_URL)

    admin = await connect_with_retry(admin_dsn)
    try:
        exists = await admin.fetchval("SELECT 1 FROM pg_database WHERE datname = $1", db_name)
        if exists:
            print(f"[init_db] database '{db_name}' already exists")
        else:
            await admin.execute(f'CREATE DATABASE "{db_name}"')
            print(f"[init_db] created database '{db_name}'")
    finally:
        await admin.close()

    conn = await connect_with_retry(dsn)
    try:
        if await conn.fetchval("SELECT to_regclass('public.customer')") is None:
            await conn.execute((SQL_DIR / "schema.sql").read_text(encoding="utf-8"))
            print("[init_db] applied schema.sql")
        else:
            print("[init_db] schema already present")

        if await conn.fetchval("SELECT count(*) FROM service_type") == 0:
            await conn.execute((SQL_DIR / "seed.sql").read_text(encoding="utf-8"))
            print("[init_db] applied seed.sql")
        else:
            print("[init_db] seed data already present")
    finally:
        await conn.close()

    print("[init_db] database ready")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as exc:
        print(f"[init_db] FAILED: {type(exc).__name__}: {exc}", file=sys.stderr)
        print(
            "[init_db] Is PostgreSQL running, and does DATABASE_URL in backend\\.env "
            "have the right user/password?",
            file=sys.stderr,
        )
        sys.exit(1)
