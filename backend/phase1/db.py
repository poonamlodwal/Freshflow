"""
db.py
-----
Async SQLAlchemy engine, session factory, and dependency injection helper.
Supports SQLite (local dev) and Postgres (production) via DATABASE_URL.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from config import settings

logger = logging.getLogger(__name__)

# ── Engine ────────────────────────────────────────────────────────────────────
# check_same_thread=False is required for SQLite in async contexts.
_connect_args: dict = (
    {"check_same_thread": False}
    if settings.DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,          # Set True temporarily to log SQL during debugging
    connect_args=_connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


# ── Base class for ORM models ─────────────────────────────────────────────────

class Base(DeclarativeBase):
    pass


# ── Lifecycle ─────────────────────────────────────────────────────────────────

async def init_db() -> None:
    """
    Create all tables that don't yet exist.
    Called once at FastAPI startup via the lifespan context manager.
    Does NOT run migrations — use Alembic for production schema changes.
    """
    # Import here to ensure all ORM models are registered before create_all.
    import models_db  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Database tables verified/created.")


async def close_db() -> None:
    """Dispose the connection pool on shutdown."""
    await engine.dispose()
    logger.info("Database connection pool closed.")


# ── FastAPI dependency ────────────────────────────────────────────────────────

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield an AsyncSession for a single request.
    Usage:
        async def my_route(db: AsyncSession = Depends(get_session)): ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
