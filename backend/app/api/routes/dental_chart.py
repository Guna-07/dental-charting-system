"""Dental Investigation Chart endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.dependencies import get_dental_chart_service
from app.constants.messages import Messages
from app.core.responses import envelope
from app.schemas.dental_chart import ToothInvestigationInput
from app.services.dental_chart_service import DentalChartService

router = APIRouter(prefix="/patients/{patient_id}/dental-chart", tags=["dental-chart"])


@router.get("")
async def get_dental_chart(
    patient_id: str,
    service: DentalChartService = Depends(get_dental_chart_service),
):
    chart = await service.get_chart(patient_id)
    return envelope(chart.model_dump(mode="json"), Messages.DENTAL_CHART_RETRIEVED)


@router.put("/teeth/{tooth_number}")
async def upsert_tooth(
    patient_id: str,
    tooth_number: str,
    payload: ToothInvestigationInput,
    service: DentalChartService = Depends(get_dental_chart_service),
):
    chart = await service.upsert_tooth(patient_id, tooth_number, payload)
    return envelope(chart.model_dump(mode="json"), Messages.DENTAL_TOOTH_UPDATED)


@router.delete("/teeth/{tooth_number}")
async def clear_tooth(
    patient_id: str,
    tooth_number: str,
    service: DentalChartService = Depends(get_dental_chart_service),
):
    chart = await service.clear_tooth(patient_id, tooth_number)
    return envelope(chart.model_dump(mode="json"), Messages.DENTAL_TOOTH_CLEARED)
