"""Async MongoDB connection lifecycle.

A single ``AsyncMongoClient`` is created on startup and shared across the app.
Repositories obtain collections through ``get_database()``.
"""

from __future__ import annotations

from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_client: AsyncMongoClient | None = None
_db: AsyncDatabase | None = None


async def connect_to_mongo() -> None:
    global _client, _db
    _client = AsyncMongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=10_000)
    _db = _client[settings.DATABASE_NAME]
    await _client.admin.command("ping")
    logger.info("Connected to MongoDB database '%s'", settings.DATABASE_NAME)


async def close_mongo_connection() -> None:
    global _client
    if _client is not None:
        await _client.close()
        logger.info("Closed MongoDB connection")


def get_database() -> AsyncDatabase:
    if _db is None:
        raise RuntimeError("Database is not initialised. Did the app lifespan run?")
    return _db
