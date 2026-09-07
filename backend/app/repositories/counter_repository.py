"""Atomic sequence generator backed by a ``counters`` collection."""

from __future__ import annotations

from pymongo import ReturnDocument
from pymongo.asynchronous.collection import AsyncCollection

from app.db.mongodb import get_database


class CounterRepository:
    @property
    def collection(self) -> AsyncCollection:
        return get_database()["counters"]

    async def next_value(self, key: str) -> int:
        """Atomically increment and return the sequence for ``key``.

        ``find_one_and_update`` with ``$inc`` is a single atomic MongoDB
        operation, so concurrent callers each receive a distinct value.
        """
        doc = await self.collection.find_one_and_update(
            {"_id": key},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
        return int(doc["seq"])

    async def peek(self, key: str) -> int:
        doc = await self.collection.find_one({"_id": key})
        return int(doc["seq"]) if doc else 0
