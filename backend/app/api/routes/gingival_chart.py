"""Gingival / Periodontal Examination Chart endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.dependencies import get_gingival_chart_service
from app.constants.messages import Messages
from app.core.responses import envelope
from app.schemas.gingival_chart import GingivalChartUpdate, ToothPerioInput
from app.services.gingival_chart_service import GingivalChartService

router = APIRouter(prefix="/patients/{patient_id}/gingival-chart", tags=["gingival-chart"])


@router.get("")
async def get_gingival_chart(
    patient_id: str,
    service: GingivalChartService = Depends(get_gingival_chart_service),
):
    chart = await service.get_chart(patient_id)
    return envelope(chart.model_dump(mode="json"), Messages.GINGIVAL_CHART_RETRIEVED)


@router.put("")
async def save_gingival_chart(
    patient_id: str,
    payload: GingivalChartUpdate,
    service: GingivalChartService = Depends(get_gingival_chart_service),
):
    chart = await service.save_chart(patient_id, payload)
    return envelope(chart.model_dump(mode="json"), Messages.GINGIVAL_CHART_SAVED)


@router.patch("/teeth/{tooth_number}")
async def update_gingival_tooth(
    patient_id: str,
    tooth_number: str,
    payload: ToothPerioInput,
    service: GingivalChartService = Depends(get_gingival_chart_service),
):
    chart = await service.update_tooth(patient_id, tooth_number, payload)
    return envelope(chart.model_dump(mode="json"), Messages.GINGIVAL_TOOTH_UPDATED)
