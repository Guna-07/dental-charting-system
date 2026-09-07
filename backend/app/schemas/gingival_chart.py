"""Gingival / Periodontal Examination Chart schemas.

Six sites per tooth: {buccal, lingual} x {mesial, mid, distal}.
CAL is always computed (PD + GM), never accepted as input.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.constants.dental import (
    FURCATION_RANGE,
    GM_RANGE,
    MOBILITY_RANGE,
    PD_RANGE,
    PerioSite,
)


class SiteMeasurementInput(BaseModel):
    pd: int | None = Field(default=None, description="Probing depth (mm)")
    gm: int | None = Field(default=None, description="Gingival margin / recession (mm)")
    bop: bool = False
    plaque: bool = False
    suppuration: bool = False

    @field_validator("pd")
    @classmethod
    def _pd_range(cls, v: int | None) -> int | None:
        if v is not None and not (PD_RANGE[0] <= v <= PD_RANGE[1]):
            raise ValueError(f"pd must be within {PD_RANGE[0]}..{PD_RANGE[1]}")
        return v

    @field_validator("gm")
    @classmethod
    def _gm_range(cls, v: int | None) -> int | None:
        if v is not None and not (GM_RANGE[0] <= v <= GM_RANGE[1]):
            raise ValueError(f"gm must be within {GM_RANGE[0]}..{GM_RANGE[1]}")
        return v


class SiteMeasurementResponse(SiteMeasurementInput):
    cal: int | None = None  # computed = pd + gm


class ToothPerioInput(BaseModel):
    buccal: dict[str, SiteMeasurementInput] = Field(default_factory=dict)
    lingual: dict[str, SiteMeasurementInput] = Field(default_factory=dict)
    mobility: int | None = None
    furcation: int | None = None
    notes: str = Field(default="", max_length=1000)

    @field_validator("buccal", "lingual")
    @classmethod
    def _valid_sites(
        cls, v: dict[str, SiteMeasurementInput]
    ) -> dict[str, SiteMeasurementInput]:
        allowed = {s.value for s in PerioSite}
        bad = set(v) - allowed
        if bad:
            raise ValueError(f"Unknown perio site(s): {', '.join(sorted(bad))}")
        return v

    @field_validator("mobility")
    @classmethod
    def _mobility_range(cls, v: int | None) -> int | None:
        if v is not None and not (MOBILITY_RANGE[0] <= v <= MOBILITY_RANGE[1]):
            raise ValueError(f"mobility must be within {MOBILITY_RANGE}")
        return v

    @field_validator("furcation")
    @classmethod
    def _furcation_range(cls, v: int | None) -> int | None:
        if v is not None and not (FURCATION_RANGE[0] <= v <= FURCATION_RANGE[1]):
            raise ValueError(f"furcation must be within {FURCATION_RANGE}")
        return v


class ToothPerioResponse(BaseModel):
    tooth_number: str
    buccal: dict[str, SiteMeasurementResponse] = Field(default_factory=dict)
    lingual: dict[str, SiteMeasurementResponse] = Field(default_factory=dict)
    mobility: int | None = None
    furcation: int | None = None
    notes: str = ""
    updated_at: datetime


class GingivalChartUpdate(BaseModel):
    """Bulk save of the whole chart (primary write path for the grid)."""

    teeth: dict[str, ToothPerioInput] = Field(default_factory=dict)


class GingivalChartResponse(BaseModel):
    patient_id: str
    teeth: dict[str, ToothPerioResponse] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime
