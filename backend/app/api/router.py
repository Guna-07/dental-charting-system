"""Aggregates every v1 router under a single ``/api/v1`` prefix."""

from fastapi import APIRouter

from app.api.routes import dental_chart, gingival_chart, patients, surface_chart

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(patients.router)
api_router.include_router(dental_chart.router)
api_router.include_router(surface_chart.router)
api_router.include_router(gingival_chart.router)
