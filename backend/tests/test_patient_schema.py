"""Input schemas validate; the response schema does not (so legacy data still reads)."""

from datetime import datetime

import pytest
from pydantic import ValidationError as PydanticValidationError

from app.schemas.patient import PatientCreate, PatientResponse


def _create_payload(**overrides):
    base = {
        "first_name": "Asha",
        "last_name": "Rao",
        "date_of_birth": "1990-04-12",
        "gender": "female",
        "phone_number": "9876543210",
    }
    base.update(overrides)
    return base


def test_create_accepts_valid_phone():
    model = PatientCreate(**_create_payload(phone_number="9876543210"))
    assert model.phone_number == "9876543210"


@pytest.mark.parametrize("phone", ["638147801", "12345", "1234567890123456"])
def test_create_rejects_bad_phone(phone):
    with pytest.raises(PydanticValidationError):
        PatientCreate(**_create_payload(phone_number=phone))


def test_response_does_not_revalidate_stored_short_phone():
    """A patient stored before the 10-digit rule must still serialize on read."""
    model = PatientResponse(
        first_name="Maria",
        last_name="Gomez",
        date_of_birth="1988-01-01",
        gender="female",
        phone_number="+1 555 0199",  # only 7 digits — legacy value
        allergies=[],
        patient_id="PAT-2026-00002",
        age=38,
        created_at=datetime(2026, 1, 1),
        updated_at=datetime(2026, 1, 1),
    )
    assert model.phone_number == "+1 555 0199"
    assert model.patient_id == "PAT-2026-00002"
