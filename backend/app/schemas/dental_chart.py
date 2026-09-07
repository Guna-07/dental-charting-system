"""Dental Investigation Chart schemas (tooth-level findings)."""

from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from pydantic import BaseModel, Field

from app.constants.dental import Dentition, FindingStatus, InvestigationFinding


class ToothFindingInput(BaseModel):
    # Optional: pass an existing finding's id to preserve its identity/created_at
    # across an edit; omit it for a new finding.
    id: str | None = None
    type: InvestigationFinding
    status: FindingStatus = FindingStatus.CURRENT
    notes: str = Field(default="", max_length=500)


class ToothFinding(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    type: InvestigationFinding
    status: FindingStatus = FindingStatus.CURRENT
    notes: str = Field(default="", max_length=500)
    created_at: datetime
    updated_at: datetime


class ToothInvestigationInput(BaseModel):
    """Payload for PUT .../dental-chart/teeth/{tooth_number} — replaces the tooth entry."""

    dentition: Dentition | None = None  # derived from the tooth number when omitted
    findings: list[ToothFindingInput] = Field(default_factory=list)
    notes: str = Field(default="", max_length=1000)


class ToothInvestigation(BaseModel):
    tooth_number: str
    dentition: Dentition
    findings: list[ToothFinding] = Field(default_factory=list)
    notes: str = ""
    created_at: datetime
    updated_at: datetime


class DentalChartResponse(BaseModel):
    patient_id: str
    teeth: dict[str, ToothInvestigation] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime
