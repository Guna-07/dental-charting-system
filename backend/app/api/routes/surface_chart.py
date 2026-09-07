"""Tooth Surface Chart endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.dependencies import get_surface_chart_service
from app.constants.messages import Messages
from app.core.responses import envelope
from app.schemas.surface_chart import ToothSurfaceUpdate
from app.services.surface_chart_service import SurfaceChartService

router = APIRouter(prefix="/patients/{patient_id}/surface-chart", tags=["surface-chart"])


@router.get("")
async def get_surface_chart(
    patient_id: str,
    service: SurfaceChartService = Depends(get_surface_chart_service),
):
    chart = await service.get_chart(patient_id)
    return envelope(chart.model_dump(mode="json"), Messages.SURFACE_CHART_RETRIEVED)


@router.put("/teeth/{tooth_number}")
async def update_tooth_surfaces(
    patient_id: str,
    tooth_number: str,
    payload: ToothSurfaceUpdate,
    service: SurfaceChartService = Depends(get_surface_chart_service),
):
    chart = await service.update_tooth(patient_id, tooth_number, payload)
    return envelope(chart.model_dump(mode="json"), Messages.SURFACE_TOOTH_UPDATED)
