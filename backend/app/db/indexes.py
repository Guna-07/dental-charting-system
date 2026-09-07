"""Index definitions applied once on application startup."""

from __future__ import annotations

from app.core.logging import get_logger
from app.db.mongodb import get_database

logger = get_logger(__name__)

# collection name -> chart document key
CHART_COLLECTIONS = ("dental_investigations", "surface_findings", "gingival_examinations")


async def ensure_indexes() -> None:
    db = get_database()

    await db.patients.create_index("patient_id", unique=True, name="ux_patient_id")
    await db.patients.create_index(
        [("first_name", 1), ("last_name", 1)], name="ix_patient_name"
    )
    await db.patients.create_index("phone_number", name="ix_patient_phone")

    for name in CHART_COLLECTIONS:
        await db[name].create_index("patient_id", unique=True, name="ux_patient_id")

    logger.info("MongoDB indexes ensured")
