"""Base repository for the per-patient chart collections.

Each chart collection stores exactly one document per patient:

    { "patient_id": "...", "teeth": { "<fdi>": {...} }, "created_at", "updated_at" }

Writes are targeted at ``teeth.<fdi>`` so per-tooth updates never rewrite the
whole document and cannot clobber sibling teeth.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pymongo import ReturnDocument
from pymongo.asynchronous.collection import AsyncCollection

from app.db.mongodb import get_database


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ChartRepository:
    collection_name: str = ""

    @property
    def collection(self) -> AsyncCollection:
        return get_database()[self.collection_name]

    async def get(self, patient_id: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"patient_id": patient_id})

    async def get_or_create(self, patient_id: str) -> dict[str, Any]:
        now = utcnow()
        return await self.collection.find_one_and_update(
            {"patient_id": patient_id},
            {
                "$setOnInsert": {
                    "patient_id": patient_id,
                    "teeth": {},
                    "created_at": now,
                    "updated_at": now,
                }
            },
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )

    async def set_tooth(self, patient_id: str, tooth_number: str, tooth_doc: dict) -> dict:
        await self.get_or_create(patient_id)
        now = utcnow()
        return await self.collection.find_one_and_update(
            {"patient_id": patient_id},
            {"$set": {f"teeth.{tooth_number}": tooth_doc, "updated_at": now}},
            return_document=ReturnDocument.AFTER,
        )

    async def merge_tooth_fields(
        self, patient_id: str, tooth_number: str, fields: dict[str, Any]
    ) -> dict:
        await self.get_or_create(patient_id)
        now = utcnow()
        update = {f"teeth.{tooth_number}.{k}": v for k, v in fields.items()}
        update["updated_at"] = now
        return await self.collection.find_one_and_update(
            {"patient_id": patient_id},
            {"$set": update},
            return_document=ReturnDocument.AFTER,
        )

    async def unset_tooth(self, patient_id: str, tooth_number: str) -> dict:
        await self.get_or_create(patient_id)
        return await self.collection.find_one_and_update(
            {"patient_id": patient_id},
            {"$unset": {f"teeth.{tooth_number}": ""}, "$set": {"updated_at": utcnow()}},
            return_document=ReturnDocument.AFTER,
        )

    async def replace_teeth(self, patient_id: str, teeth: dict[str, Any]) -> dict:
        await self.get_or_create(patient_id)
        return await self.collection.find_one_and_update(
            {"patient_id": patient_id},
            {"$set": {"teeth": teeth, "updated_at": utcnow()}},
            return_document=ReturnDocument.AFTER,
        )

    async def delete_for_patient(self, patient_id: str) -> None:
        await self.collection.delete_one({"patient_id": patient_id})
