"""Tooth Surface Chart schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.constants.dental import SurfaceFinding


class SurfaceFindingInput(BaseModel):
    finding: SurfaceFinding
    notes: str = Field(default="", max_length=500)


class SurfaceFindingEntry(SurfaceFindingInput):
    created_at: datetime
    updated_at: datetime


class ToothSurfaceUpdate(BaseModel):
    """Partial update: only the surfaces present are changed.

    A surface mapped to ``null`` is cleared; a surface mapped to an object is
    created or replaced. Surfaces absent from the payload are left untouched.
    """

    surfaces: dict[str, SurfaceFindingInput | None] = Field(default_factory=dict)


class ToothSurfaceResponse(BaseModel):
    tooth_number: str
    surfaces: dict[str, SurfaceFindingEntry] = Field(default_factory=dict)
    updated_at: datetime


class SurfaceChartResponse(BaseModel):
    patient_id: str
    teeth: dict[str, ToothSurfaceResponse] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime
