"""Reusable dental chart validation used across all three chart services."""

from __future__ import annotations

from app.constants.dental import (
    FURCATION_RANGE,
    GM_RANGE,
    MOBILITY_RANGE,
    PD_RANGE,
    is_valid_surface,
    is_valid_tooth,
    surfaces_for_tooth,
)
from app.core.exceptions import AppError, ErrorCode, ValidationError


def require_valid_tooth(tooth_number: str) -> str:
    if not is_valid_tooth(tooth_number):
        raise AppError(
            f"'{tooth_number}' is not a valid FDI tooth number",
            error_code=ErrorCode.INVALID_TOOTH_NUMBER,
            status_code=422,
        )
    return tooth_number


def require_valid_surface(tooth_number: str, surface: str) -> str:
    if not is_valid_surface(tooth_number, surface):
        allowed = ", ".join(surfaces_for_tooth(tooth_number))
        raise AppError(
            f"Surface '{surface}' is not valid for tooth {tooth_number}. "
            f"Allowed: {allowed}",
            error_code=ErrorCode.INVALID_SURFACE,
            status_code=422,
        )
    return surface


def _check_range(name: str, value: float | None, bounds: tuple[int, int]) -> None:
    if value is None:
        return
    low, high = bounds
    if not (low <= value <= high):
        raise AppError(
            f"{name} value {value} is outside the allowed range {low}..{high}",
            error_code=ErrorCode.MEASUREMENT_OUT_OF_RANGE,
            status_code=422,
        )


def validate_probing_depth(value: float | None) -> None:
    _check_range("Probing depth", value, PD_RANGE)


def validate_gingival_margin(value: float | None) -> None:
    _check_range("Gingival margin", value, GM_RANGE)


def validate_mobility(value: float | None) -> None:
    _check_range("Mobility", value, MOBILITY_RANGE)


def validate_furcation(value: float | None) -> None:
    _check_range("Furcation", value, FURCATION_RANGE)
