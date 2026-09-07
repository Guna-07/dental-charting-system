"""All MongoDB access for the ``patients`` collection."""

from __future__ import annotations

import re
from typing import Any

from pymongo import ASCENDING, ReturnDocument
from pymongo.asynchronous.collection import AsyncCollection

from app.db.mongodb import get_database


class PatientRepository:
    @property
    def collection(self) -> AsyncCollection:
        return get_database()["patients"]

    async def insert(self, document: dict[str, Any]) -> dict[str, Any]:
        await self.collection.insert_one(document)
        return document

    async def get_by_patient_id(self, patient_id: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"patient_id": patient_id})

    async def update(
        self, patient_id: str, changes: dict[str, Any]
    ) -> dict[str, Any] | None:
        return await self.collection.find_one_and_update(
            {"patient_id": patient_id},
            {"$set": changes},
            return_document=ReturnDocument.AFTER,
        )

    async def delete(self, patient_id: str) -> int:
        result = await self.collection.delete_one({"patient_id": patient_id})
        return result.deleted_count

    async def search(
        self, *, term: str | None, page: int, limit: int
    ) -> tuple[list[dict[str, Any]], int]:
        query: dict[str, Any] = {}
        if term:
            safe = re.escape(term.strip())
            rx = {"$regex": safe, "$options": "i"}
            query = {
                "$or": [
                    {"first_name": rx},
                    {"last_name": rx},
                    {"phone_number": rx},
                    {"patient_id": rx},
                ]
            }

        total = await self.collection.count_documents(query)
        cursor = (
            self.collection.find(query)
            .sort("created_at", ASCENDING)
            .skip((page - 1) * limit)
            .limit(limit)
        )
        items = [doc async for doc in cursor]
        return items, total
