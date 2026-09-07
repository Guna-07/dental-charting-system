"""Reusable patient field validation, shared by schemas and services."""

from __future__ import annotations

import re
from datetime import date

from app.core.exceptions import ValidationError

_PHONE_RE = re.compile(r"^\+?[0-9()][0-9\s\-().]{4,30}$")
_MIN_PHONE_DIGITS = 6
_MAX_AGE_YEARS = 120


def normalize_name(value: str) -> str:
    cleaned = " ".join(value.split())
    if not cleaned:
        raise ValidationError("Name must not be blank")
    return cleaned


def validate_phone(value: str) -> str:
    cleaned = value.strip()
    digits = sum(c.isdigit() for c in cleaned)
    if not _PHONE_RE.match(cleaned) or digits < _MIN_PHONE_DIGITS:
        raise ValidationError(
            "Phone number must contain at least 6 digits and only digits, "
            "spaces, and the characters + - ( ) ."
        )
    return cleaned


def calculate_age(dob: date, *, on: date | None = None) -> int:
    ref = on or date.today()
    return ref.year - dob.year - ((ref.month, ref.day) < (dob.month, dob.day))


def validate_dob(value: date) -> date:
    today = date.today()
    if value > today:
        raise ValidationError("Date of birth cannot be in the future")
    if calculate_age(value, on=today) > _MAX_AGE_YEARS:
        raise ValidationError(f"Date of birth implies an age over {_MAX_AGE_YEARS} years")
    return value
