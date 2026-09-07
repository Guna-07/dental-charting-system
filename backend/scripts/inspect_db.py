"""Print a summary of everything in the database.

Usage (from the backend/ folder, with the venv active):
    python -m scripts.inspect_db                 # counts + patient list
    python -m scripts.inspect_db PAT-2026-00005  # full dump for one patient
"""

from __future__ import annotations

import asyncio
import json
import sys

from app.db.mongodb import connect_to_mongo, close_mongo_connection, get_database

COLLECTIONS = [
    "patients",
    "counters",
    "dental_investigations",
    "surface_findings",
    "gingival_examinations",
]


def show(doc: dict) -> str:
    return json.dumps(doc, indent=2, default=str, ensure_ascii=False)


async def summary() -> None:
    db = get_database()
    print("=== collection counts ===")
    for name in COLLECTIONS:
        print(f"  {name:<24} {await db[name].count_documents({})}")

    print("\n=== patients ===")
    async for p in db.patients.find({}, {"_id": 0}).sort("created_at", 1):
        print(
            f"  {p['patient_id']}  {p['first_name']} {p['last_name']}  "
            f"{p.get('phone_number', '')}"
        )

    print("\n=== counters ===")
    async for c in db.counters.find({}):
        print(f"  {c['_id']} -> {c['seq']}")


async def dump_patient(patient_id: str) -> None:
    db = get_database()
    patient = await db.patients.find_one({"patient_id": patient_id}, {"_id": 0})
    if not patient:
        print(f"No patient '{patient_id}'")
        return
    print("=== patient ===")
    print(show(patient))
    for name in ("dental_investigations", "surface_findings", "gingival_examinations"):
        chart = await db[name].find_one({"patient_id": patient_id}, {"_id": 0})
        print(f"\n=== {name} ===")
        print(show(chart) if chart else "  (none)")


async def main() -> None:
    await connect_to_mongo()
    try:
        if len(sys.argv) > 1:
            await dump_patient(sys.argv[1])
        else:
            await summary()
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(main())
