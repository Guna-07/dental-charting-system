"""Gingival / Periodontal Examination Chart domain logic.

CAL is computed on read for every site (PD + GM); it is never stored.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.constants.dental import calculate_cal
from app.repositories.gingival_chart_repository import GingivalChartRepository
from app.schemas.gingival_chart import (
    GingivalChartResponse,
    GingivalChartUpdate,
    ToothPerioInput,
)
from app.services.patient_service import PatientService
from app.validators.chart_validator import require_valid_tooth


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _sites_to_doc(sites: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for site, m in sites.items():
        data = m.model_dump() if hasattr(m, "model_dump") else dict(m)
        out[site] = {
            "pd": data.get("pd"),
            "gm": data.get("gm"),
            "bop": bool(data.get("bop", False)),
            "plaque": bool(data.get("plaque", False)),
            "suppuration": bool(data.get("suppuration", False)),
        }
    return out


def _sites_with_cal(sites: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for site, m in (sites or {}).items():
        out[site] = {**m, "cal": calculate_cal(m.get("pd"), m.get("gm"))}
    return out


class GingivalChartService:
    def __init__(
        self, repository: GingivalChartRepository, patients: PatientService
    ) -> None:
        self._repo = repository
        self._patients = patients

    async def get_chart(self, patient_id: str) -> GingivalChartResponse:
        await self._patients.ensure_exists(patient_id)
        doc = await self._repo.get_or_create(patient_id)
        return self._to_response(doc)

    async def save_chart(
        self, patient_id: str, payload: GingivalChartUpdate
    ) -> GingivalChartResponse:
        await self._patients.ensure_exists(patient_id)
        now = _utcnow()

        teeth: dict[str, Any] = {}
        for tooth_number, tooth in payload.teeth.items():
            require_valid_tooth(tooth_number)
            teeth[tooth_number] = self._tooth_to_doc(tooth_number, tooth, now)

        updated = await self._repo.replace_teeth(patient_id, teeth)
        return self._to_response(updated)

    async def update_tooth(
        self, patient_id: str, tooth_number: str, payload: ToothPerioInput
    ) -> GingivalChartResponse:
        await self._patients.ensure_exists(patient_id)
        require_valid_tooth(tooth_number)
        now = _utcnow()
        tooth_doc = self._tooth_to_doc(tooth_number, payload, now)
        updated = await self._repo.set_tooth(patient_id, tooth_number, tooth_doc)
        return self._to_response(updated)

    @staticmethod
    def _tooth_to_doc(
        tooth_number: str, tooth: ToothPerioInput, now: datetime
    ) -> dict[str, Any]:
        return {
            "tooth_number": tooth_number,
            "buccal": _sites_to_doc(tooth.buccal),
            "lingual": _sites_to_doc(tooth.lingual),
            "mobility": tooth.mobility,
            "furcation": tooth.furcation,
            "notes": tooth.notes,
            "updated_at": now,
        }

    @staticmethod
    def _to_response(doc: dict[str, Any]) -> GingivalChartResponse:
        data = {k: v for k, v in doc.items() if k != "_id"}
        for tooth in (data.get("teeth") or {}).values():
            tooth["buccal"] = _sites_with_cal(tooth.get("buccal"))
            tooth["lingual"] = _sites_with_cal(tooth.get("lingual"))
        return GingivalChartResponse(**data)
