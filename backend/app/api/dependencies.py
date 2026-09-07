"""FastAPI dependency wiring: builds services from repositories per request."""

from __future__ import annotations

from fastapi import Depends

from app.repositories.counter_repository import CounterRepository
from app.repositories.dental_chart_repository import DentalChartRepository
from app.repositories.gingival_chart_repository import GingivalChartRepository
from app.repositories.patient_repository import PatientRepository
from app.repositories.surface_chart_repository import SurfaceChartRepository
from app.services.dental_chart_service import DentalChartService
from app.services.gingival_chart_service import GingivalChartService
from app.services.patient_id_service import PatientIdService
from app.services.patient_service import PatientService
from app.services.surface_chart_service import SurfaceChartService


def get_patient_service() -> PatientService:
    return PatientService(
        PatientRepository(),
        PatientIdService(CounterRepository()),
        chart_repositories=[
            DentalChartRepository(),
            SurfaceChartRepository(),
            GingivalChartRepository(),
        ],
    )


def get_dental_chart_service(
    patients: PatientService = Depends(get_patient_service),
) -> DentalChartService:
    return DentalChartService(DentalChartRepository(), patients)


def get_surface_chart_service(
    patients: PatientService = Depends(get_patient_service),
) -> SurfaceChartService:
    return SurfaceChartService(SurfaceChartRepository(), patients)


def get_gingival_chart_service(
    patients: PatientService = Depends(get_patient_service),
) -> GingivalChartService:
    return GingivalChartService(GingivalChartRepository(), patients)
