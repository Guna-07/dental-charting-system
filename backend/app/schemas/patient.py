"""Patient API input/output schemas."""

from __future__ import annotations

from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.validators.patient_validator import (
    normalize_name,
    validate_dob,
    validate_phone,
)


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    UNDISCLOSED = "undisclosed"


class BloodGroup(str, Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"


class Address(BaseModel):
    line1: str | None = None
    line2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = None


class EmergencyContact(BaseModel):
    name: str | None = None
    relationship: str | None = None
    phone_number: str | None = None


class PatientBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=80)
    last_name: str = Field(..., min_length=1, max_length=80)
    date_of_birth: date
    gender: Gender
    phone_number: str = Field(..., min_length=6, max_length=32)
    email: EmailStr | None = None
    address: Address | None = None
    emergency_contact: EmergencyContact | None = None
    medical_notes: str | None = Field(default=None, max_length=2000)
    allergies: list[str] = Field(default_factory=list)
    blood_group: BloodGroup | None = None

    @field_validator("first_name", "last_name")
    @classmethod
    def _clean_name(cls, value: str) -> str:
        return normalize_name(value)

    @field_validator("phone_number")
    @classmethod
    def _check_phone(cls, value: str) -> str:
        return validate_phone(value)

    @field_validator("date_of_birth")
    @classmethod
    def _check_dob(cls, value: date) -> date:
        return validate_dob(value)


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    """All fields optional — only provided fields are changed."""

    model_config = ConfigDict(extra="forbid")

    first_name: str | None = Field(default=None, min_length=1, max_length=80)
    last_name: str | None = Field(default=None, min_length=1, max_length=80)
    date_of_birth: date | None = None
    gender: Gender | None = None
    phone_number: str | None = Field(default=None, min_length=6, max_length=32)
    email: EmailStr | None = None
    address: Address | None = None
    emergency_contact: EmergencyContact | None = None
    medical_notes: str | None = Field(default=None, max_length=2000)
    allergies: list[str] | None = None
    blood_group: BloodGroup | None = None

    @field_validator("first_name", "last_name")
    @classmethod
    def _clean_name(cls, value: str | None) -> str | None:
        return normalize_name(value) if value is not None else None

    @field_validator("phone_number")
    @classmethod
    def _check_phone(cls, value: str | None) -> str | None:
        return validate_phone(value) if value is not None else None

    @field_validator("date_of_birth")
    @classmethod
    def _check_dob(cls, value: date | None) -> date | None:
        return validate_dob(value) if value is not None else None


class PatientResponse(PatientBase):
    patient_id: str
    age: int
    created_at: datetime
    updated_at: datetime
