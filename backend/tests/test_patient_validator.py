from datetime import date, timedelta

import pytest

from app.validators.patient_validator import (
    calculate_age,
    normalize_name,
    validate_dob,
    validate_phone,
)


def test_normalize_name_collapses_whitespace():
    assert normalize_name("  Asha   Rao ") == "Asha Rao"


def test_normalize_name_rejects_blank():
    with pytest.raises(ValueError):
        normalize_name("   ")


@pytest.mark.parametrize(
    "value",
    [
        "+91 98765 43210",  # 12 digits
        "9876543210",       # 10 digits (minimum)
        "(044) 2345-6789",  # 11 digits
        "+1-212-555-0199",  # 11 digits
    ],
)
def test_validate_phone_accepts_valid(value):
    assert validate_phone(value)


@pytest.mark.parametrize(
    "value",
    [
        "123",          # too few digits
        "abcdef",       # non-numeric
        "++1234567",    # bad format
        "63814780",     # 8 digits — too short
        "638147801",    # 9 digits — too short
        "1234567890123456",  # 16 digits — too long
    ],
)
def test_validate_phone_rejects_invalid(value):
    with pytest.raises(ValueError):
        validate_phone(value)


def test_validate_dob_rejects_future():
    with pytest.raises(ValueError):
        validate_dob(date.today() + timedelta(days=1))


def test_validate_dob_rejects_implausible_age():
    with pytest.raises(ValueError):
        validate_dob(date(1800, 1, 1))


def test_calculate_age_before_birthday():
    dob = date(2000, 12, 31)
    assert calculate_age(dob, on=date(2026, 1, 1)) == 25
