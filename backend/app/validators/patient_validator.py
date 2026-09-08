"""Reusable patient field validation.

These are called from Pydantic ``field_validator`` hooks in
``app/schemas/patient.py`` and therefore raise plain ``ValueError`` so Pydantic
wraps them into a single, field-located ``RequestValidationError`` (→ the
standard 422 error envelope).
"""

from __future__ import annotations

import re
from datetime import date

_PHONE_RE = re.compile(r"^\+?[0-9()][0-9\s\-().]{4,30}$")
# National numbers are typically 10 digits; E.164 allows at most 15 (excl. the
# leading "+"). Separators (spaces, dashes, parens) do not count.
_MIN_PHONE_DIGITS = 10
_MAX_PHONE_DIGITS = 15
_MAX_AGE_YEARS = 120


def normalize_name(value: str) -> str:
    cleaned = " ".join(value.split())
    if not cleaned:
        raise ValueError("Name must not be blank")
    return cleaned


def validate_phone(value: str) -> str:
    cleaned = value.strip()
    digits = sum(c.isdigit() for c in cleaned)
    if not _PHONE_RE.match(cleaned):
        raise ValueError(
            "Phone number may contain only digits, spaces, and the characters "
            "+ - ( ) ."
        )
    if digits < _MIN_PHONE_DIGITS:
        raise ValueError(f"Phone number must have at least {_MIN_PHONE_DIGITS} digits")
    if digits > _MAX_PHONE_DIGITS:
        raise ValueError(f"Phone number must have at most {_MAX_PHONE_DIGITS} digits")
    return cleaned


def calculate_age(dob: date, *, on: date | None = None) -> int:
    ref = on or date.today()
    return ref.year - dob.year - ((ref.month, ref.day) < (dob.month, dob.day))


def validate_dob(value: date) -> date:
    today = date.today()
    if value > today:
        raise ValueError("Date of birth cannot be in the future")
    if calculate_age(value, on=today) > _MAX_AGE_YEARS:
        raise ValueError(f"Date of birth implies an age over {_MAX_AGE_YEARS} years")
    return value
