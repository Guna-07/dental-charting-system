"""Patient endpoints. Thin: validate input, call the service, wrap the result."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status

from app.api.dependencies import get_patient_service
from app.constants.messages import Messages
from app.core.responses import envelope
from app.schemas.patient import PatientCreate, PatientUpdate
from app.services.patient_service import PatientService

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("")
async def list_patients(
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    service: PatientService = Depends(get_patient_service),
):
    result = await service.list(search=search, page=page, limit=limit)
    return envelope(result.model_dump(mode="json"), Messages.PATIENTS_RETRIEVED)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_patient(
    payload: PatientCreate,
    service: PatientService = Depends(get_patient_service),
):
    patient = await service.create(payload)
    return envelope(patient.model_dump(mode="json"), Messages.PATIENT_CREATED)


@router.get("/{patient_id}")
async def get_patient(
    patient_id: str,
    service: PatientService = Depends(get_patient_service),
):
    patient = await service.get(patient_id)
    return envelope(patient.model_dump(mode="json"), Messages.PATIENT_RETRIEVED)


@router.put("/{patient_id}")
async def update_patient(
    patient_id: str,
    payload: PatientUpdate,
    service: PatientService = Depends(get_patient_service),
):
    patient = await service.update(patient_id, payload)
    return envelope(patient.model_dump(mode="json"), Messages.PATIENT_UPDATED)


@router.delete("/{patient_id}")
async def delete_patient(
    patient_id: str,
    service: PatientService = Depends(get_patient_service),
):
    await service.delete(patient_id)
    return envelope(None, Messages.PATIENT_DELETED)
