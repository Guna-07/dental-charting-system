import pytest

from app.constants.dental import calculate_cal, surfaces_for_tooth
from app.core.exceptions import AppError
from app.validators.chart_validator import (
    require_valid_surface,
    require_valid_tooth,
    validate_probing_depth,
)


@pytest.mark.parametrize("tooth", ["11", "48", "18", "85"])
def test_require_valid_tooth_accepts_fdi(tooth):
    assert require_valid_tooth(tooth) == tooth


@pytest.mark.parametrize("tooth", ["00", "19", "51x", "9"])
def test_require_valid_tooth_rejects_non_fdi(tooth):
    with pytest.raises(AppError):
        require_valid_tooth(tooth)


def test_anterior_tooth_has_incisal_not_occlusal():
    surfaces = surfaces_for_tooth("11")
    assert "incisal" in surfaces and "occlusal" not in surfaces


def test_posterior_tooth_has_occlusal_not_incisal():
    surfaces = surfaces_for_tooth("16")
    assert "occlusal" in surfaces and "incisal" not in surfaces


def test_require_valid_surface_rejects_mismatch():
    with pytest.raises(AppError):
        require_valid_surface("11", "occlusal")


def test_probing_depth_out_of_range():
    with pytest.raises(AppError):
        validate_probing_depth(99)


def test_calculate_cal():
    assert calculate_cal(4, 1) == 5
    assert calculate_cal(3, -2) == 1
    assert calculate_cal(None, 1) is None
