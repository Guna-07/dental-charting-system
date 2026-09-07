"""Tooth Surface Chart domain logic."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.repositories.surface_chart_repository import SurfaceChartRepository
from app.schemas.surface_chart import SurfaceChartResponse, ToothSurfaceUpdate
from app.services.patient_service import PatientService
from app.validators.chart_validator import require_valid_surface, require_valid_tooth


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class SurfaceChartService:
    def __init__(
        self, repository: SurfaceChartRepository, patients: PatientService
    ) -> None:
        self._repo = repository
        self._patients = patients

    async def get_chart(self, patient_id: str) -> SurfaceChartResponse:
        await self._patients.ensure_exists(patient_id)
        doc = await self._repo.get_or_create(patient_id)
        return self._to_response(doc)

    async def update_tooth(
        self, patient_id: str, tooth_number: str, payload: ToothSurfaceUpdate
    ) -> SurfaceChartResponse:
        await self._patients.ensure_exists(patient_id)
        require_valid_tooth(tooth_number)

        chart = await self._repo.get_or_create(patient_id)
        tooth = (chart.get("teeth") or {}).get(tooth_number) or {
            "tooth_number": tooth_number,
            "surfaces": {},
        }
        surfaces: dict[str, Any] = dict(tooth.get("surfaces", {}))
        now = _utcnow()

        for surface, entry in payload.surfaces.items():
            require_valid_surface(tooth_number, surface)
            if entry is None:
                surfaces.pop(surface, None)
                continue
            prior = surfaces.get(surface)
            surfaces[surface] = {
                "finding": entry.finding.value,
                "notes": entry.notes,
                "created_at": prior["created_at"] if prior else now,
                "updated_at": now,
            }

        tooth_doc = {
            "tooth_number": tooth_number,
            "surfaces": surfaces,
            "updated_at": now,
        }
        updated = await self._repo.set_tooth(patient_id, tooth_number, tooth_doc)
        return self._to_response(updated)

    @staticmethod
    def _to_response(doc: dict[str, Any]) -> SurfaceChartResponse:
        data = {k: v for k, v in doc.items() if k != "_id"}
        return SurfaceChartResponse(**data)
