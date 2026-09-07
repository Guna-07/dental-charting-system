"""Patient domain logic. The only layer that knows how a patient is assembled."""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any

from pymongo.errors import DuplicateKeyError

from app.core.exceptions import ConflictError, PatientNotFoundError
from app.schemas.common import Page, PageMeta
from app.schemas.patient import PatientCreate, PatientResponse, PatientUpdate
from app.repositories.base import ChartRepository
from app.repositories.patient_repository import PatientRepository
from app.services.patient_id_service import PatientIdService
from app.validators.patient_validator import calculate_age

_MAX_ID_RETRIES = 3


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class PatientService:
    def __init__(
        self,
        repository: PatientRepository,
        id_service: PatientIdService,
        chart_repositories: list[ChartRepository] | None = None,
    ) -> None:
        self._repo = repository
        self._id_service = id_service
        self._chart_repos = chart_repositories or []

    # ------------------------------------------------------------------ #
    # commands
    # ------------------------------------------------------------------ #
    async def create(self, payload: PatientCreate) -> PatientResponse:
        base = payload.model_dump(mode="json")
        now = _utcnow()

        last_error: Exception | None = None
        for _ in range(_MAX_ID_RETRIES):
            patient_id = await self._id_service.generate()
            document: dict[str, Any] = {
                **base,
                "patient_id": patient_id,
                "created_at": now,
                "updated_at": now,
            }
            try:
                await self._repo.insert(document)
                return self._to_response(document)
            except DuplicateKeyError as exc:  # unique index backstop
                last_error = exc
                continue

        raise ConflictError(
            "Could not allocate a unique patient ID, please retry",
            details=[str(last_error)] if last_error else [],
        )

    async def update(self, patient_id: str, payload: PatientUpdate) -> PatientResponse:
        existing = await self._repo.get_by_patient_id(patient_id)
        if existing is None:
            raise PatientNotFoundError(patient_id)

        changes = payload.model_dump(mode="json", exclude_unset=True)
        if changes:
            changes["updated_at"] = _utcnow()
            updated = await self._repo.update(patient_id, changes)
        else:
            updated = existing
        return self._to_response(updated)

    async def delete(self, patient_id: str) -> None:
        deleted = await self._repo.delete(patient_id)
        if deleted == 0:
            raise PatientNotFoundError(patient_id)
        # cascade: a patient's charts have no meaning without the patient
        for repo in self._chart_repos:
            await repo.delete_for_patient(patient_id)

    # ------------------------------------------------------------------ #
    # queries
    # ------------------------------------------------------------------ #
    async def get(self, patient_id: str) -> PatientResponse:
        doc = await self._repo.get_by_patient_id(patient_id)
        if doc is None:
            raise PatientNotFoundError(patient_id)
        return self._to_response(doc)

    async def list(
        self, *, search: str | None, page: int, limit: int
    ) -> Page[PatientResponse]:
        items, total = await self._repo.search(term=search, page=page, limit=limit)
        total_pages = (total + limit - 1) // limit if limit else 0
        return Page[PatientResponse](
            items=[self._to_response(doc) for doc in items],
            meta=PageMeta(
                page=page, limit=limit, total=total, total_pages=total_pages
            ),
        )

    async def ensure_exists(self, patient_id: str) -> None:
        if await self._repo.get_by_patient_id(patient_id) is None:
            raise PatientNotFoundError(patient_id)

    # ------------------------------------------------------------------ #
    # mapping
    # ------------------------------------------------------------------ #
    @staticmethod
    def _to_response(doc: dict[str, Any]) -> PatientResponse:
        data = {k: v for k, v in doc.items() if k != "_id"}
        dob = data["date_of_birth"]
        dob_date = dob if isinstance(dob, date) else date.fromisoformat(str(dob)[:10])
        data["age"] = calculate_age(dob_date)
        return PatientResponse(**data)
