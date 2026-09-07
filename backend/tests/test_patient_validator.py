from datetime import date, timedelta

import pytest

from app.core.exceptions import ValidationError
from app.validators.patient_validator import (
    calculate_age,
    normalize_name,
    validate_dob,
    validate_phone,
)


def test_normalize_name_collapses_whitespace():
    assert normalize_name("  Asha   Rao ") == "Asha Rao"


def test_normalize_name_rejects_blank():
    with pytest.raises(ValidationError):
        normalize_name("   ")


@pytest.mark.parametrize("value", ["+91 98765 43210", "9876543210", "(044) 2345-6789"])
def test_validate_phone_accepts_valid(value):
    assert validate_phone(value)


@pytest.mark.parametrize("value", ["123", "abcdef", "++1234567"])
def test_validate_phone_rejects_invalid(value):
    with pytest.raises(ValidationError):
        validate_phone(value)


def test_validate_dob_rejects_future():
    with pytest.raises(ValidationError):
        validate_dob(date.today() + timedelta(days=1))


def test_validate_dob_rejects_implausible_age():
    with pytest.raises(ValidationError):
        validate_dob(date(1800, 1, 1))


def test_calculate_age_before_birthday():
    dob = date(2000, 12, 31)
    assert calculate_age(dob, on=date(2026, 1, 1)) == 25
