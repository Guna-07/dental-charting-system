"""Dental Investigation Chart domain logic."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from app.constants.dental import dentition_for_tooth
from app.repositories.dental_chart_repository import DentalChartRepository
from app.schemas.dental_chart import DentalChartResponse, ToothInvestigationInput
from app.services.patient_service import PatientService
from app.validators.chart_validator import require_valid_tooth


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class DentalChartService:
    def __init__(
        self, repository: DentalChartRepository, patients: PatientService
    ) -> None:
        self._repo = repository
        self._patients = patients

    async def get_chart(self, patient_id: str) -> DentalChartResponse:
        await self._patients.ensure_exists(patient_id)
        doc = await self._repo.get_or_create(patient_id)
        return self._to_response(doc)

    async def upsert_tooth(
        self, patient_id: str, tooth_number: str, payload: ToothInvestigationInput
    ) -> DentalChartResponse:
        await self._patients.ensure_exists(patient_id)
        require_valid_tooth(tooth_number)

        chart = await self._repo.get_or_create(patient_id)
        existing_tooth = (chart.get("teeth") or {}).get(tooth_number, {})
        existing_by_id = {
            f["id"]: f for f in existing_tooth.get("findings", []) if "id" in f
        }
        now = _utcnow()

        findings: list[dict[str, Any]] = []
        for item in payload.findings:
            prior = existing_by_id.get(item.id) if item.id else None
            findings.append(
                {
                    "id": item.id or str(uuid4()),
                    "type": item.type.value,
                    "status": item.status.value,
                    "notes": item.notes,
                    "created_at": prior["created_at"] if prior else now,
                    "updated_at": now,
                }
            )

        dentition = payload.dentition or dentition_for_tooth(tooth_number)
        tooth_doc = {
            "tooth_number": tooth_number,
            "dentition": dentition.value if dentition else None,
            "findings": findings,
            "notes": payload.notes,
            "created_at": existing_tooth.get("created_at", now),
            "updated_at": now,
        }
        updated = await self._repo.set_tooth(patient_id, tooth_number, tooth_doc)
        return self._to_response(updated)

    async def clear_tooth(
        self, patient_id: str, tooth_number: str
    ) -> DentalChartResponse:
        await self._patients.ensure_exists(patient_id)
        require_valid_tooth(tooth_number)
        updated = await self._repo.unset_tooth(patient_id, tooth_number)
        return self._to_response(updated)

    @staticmethod
    def _to_response(doc: dict[str, Any]) -> DentalChartResponse:
        data = {k: v for k, v in doc.items() if k != "_id"}
        return DentalChartResponse(**data)
