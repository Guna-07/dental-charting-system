"""Single source of truth for dental domain vocabulary.

Numbering system: FDI World Dental Federation notation (ISO 3950).
  - Permanent dentition quadrants: 1=UR, 2=UL, 3=LL, 4=LR ; tooth 1-8 from midline
  - Primary dentition quadrants:   5=UR, 6=UL, 7=LL, 8=LR ; tooth 1-5 from midline
"""

from __future__ import annotations

from enum import Enum

# --------------------------------------------------------------------------- #
# Dentition
# --------------------------------------------------------------------------- #


class Dentition(str, Enum):
    PERMANENT = "permanent"
    PRIMARY = "primary"


# FDI numbers, ordered UR -> UL -> LL -> LR, each quadrant from midline outward.
PERMANENT_UPPER: list[str] = (
    [f"1{i}" for i in range(1, 9)] + [f"2{i}" for i in range(1, 9)]
)
PERMANENT_LOWER: list[str] = (
    [f"4{i}" for i in range(1, 9)] + [f"3{i}" for i in range(1, 9)]
)
PRIMARY_UPPER: list[str] = (
    [f"5{i}" for i in range(1, 6)] + [f"6{i}" for i in range(1, 6)]
)
PRIMARY_LOWER: list[str] = (
    [f"8{i}" for i in range(1, 6)] + [f"7{i}" for i in range(1, 6)]
)

PERMANENT_TEETH: list[str] = PERMANENT_UPPER + PERMANENT_LOWER
PRIMARY_TEETH: list[str] = PRIMARY_UPPER + PRIMARY_LOWER
ALL_TEETH: set[str] = set(PERMANENT_TEETH) | set(PRIMARY_TEETH)


def dentition_for_tooth(tooth_number: str) -> Dentition | None:
    if tooth_number in PERMANENT_TEETH:
        return Dentition.PERMANENT
    if tooth_number in PRIMARY_TEETH:
        return Dentition.PRIMARY
    return None


def is_valid_tooth(tooth_number: str) -> bool:
    return tooth_number in ALL_TEETH


# --------------------------------------------------------------------------- #
# Anterior vs posterior
# --------------------------------------------------------------------------- #
# Position within quadrant: 1-3 = anterior (incisors, canine), 4+ = posterior.


def is_anterior(tooth_number: str) -> bool:
    return tooth_number[-1] in {"1", "2", "3"}


def is_posterior(tooth_number: str) -> bool:
    return not is_anterior(tooth_number)


def is_upper(tooth_number: str) -> bool:
    return tooth_number[0] in {"1", "2", "5", "6"}


# Multi-rooted teeth where a furcation reading is clinically meaningful:
# all molars (position 6-8 permanent, 4-5 primary) + upper first premolars (x4).
def has_furcation(tooth_number: str) -> bool:
    quadrant, position = tooth_number[0], tooth_number[-1]
    if quadrant in {"1", "2", "3", "4"}:
        if position in {"6", "7", "8"}:
            return True
        if position == "4" and quadrant in {"1", "2"}:  # upper first premolars
            return True
        return False
    # primary molars
    return position in {"4", "5"}


# --------------------------------------------------------------------------- #
# Tooth surfaces
# --------------------------------------------------------------------------- #


class Surface(str, Enum):
    MESIAL = "mesial"
    DISTAL = "distal"
    BUCCAL = "buccal"      # posterior facial aspect
    LABIAL = "labial"      # anterior facial aspect (a.k.a. facial)
    LINGUAL = "lingual"    # oral aspect (displayed as "palatal" for upper teeth)
    OCCLUSAL = "occlusal"  # posterior chewing surface
    INCISAL = "incisal"    # anterior biting edge


POSTERIOR_SURFACES: list[str] = [
    Surface.MESIAL, Surface.DISTAL, Surface.BUCCAL, Surface.LINGUAL, Surface.OCCLUSAL,
]
ANTERIOR_SURFACES: list[str] = [
    Surface.MESIAL, Surface.DISTAL, Surface.LABIAL, Surface.LINGUAL, Surface.INCISAL,
]


def surfaces_for_tooth(tooth_number: str) -> list[str]:
    return (
        list(ANTERIOR_SURFACES) if is_anterior(tooth_number) else list(POSTERIOR_SURFACES)
    )


def is_valid_surface(tooth_number: str, surface: str) -> bool:
    return surface in surfaces_for_tooth(tooth_number)


# --------------------------------------------------------------------------- #
# Finding vocabularies
# --------------------------------------------------------------------------- #


class InvestigationFinding(str, Enum):
    CARIES = "caries"
    MISSING = "missing"
    FILLED = "filled"
    CROWN = "crown"
    ROOT_CANAL_TREATED = "root_canal_treated"
    FRACTURED = "fractured"
    IMPLANT = "implant"
    EXTRACTION_REQUIRED = "extraction_required"
    HEALTHY = "healthy"
    OTHER = "other"


class FindingStatus(str, Enum):
    """Which panel of the investigation chart a finding belongs to."""

    CURRENT = "current"    # existing condition
    PLANNED = "planned"    # treatment required


class SurfaceFinding(str, Enum):
    CARIES = "caries"
    RESTORATION = "restoration"
    SEALANT = "sealant"
    WEAR = "wear"
    FRACTURE = "fracture"
    HEALTHY = "healthy"
    OTHER = "other"


# --------------------------------------------------------------------------- #
# Periodontal charting
# --------------------------------------------------------------------------- #


class PerioAspect(str, Enum):
    BUCCAL = "buccal"
    LINGUAL = "lingual"


class PerioSite(str, Enum):
    MESIAL = "mesial"
    MID = "mid"
    DISTAL = "distal"


PERIO_ASPECTS: list[str] = [PerioAspect.BUCCAL, PerioAspect.LINGUAL]
PERIO_SITES: list[str] = [PerioSite.MESIAL, PerioSite.MID, PerioSite.DISTAL]

# Inclusive measurement ranges (millimetres unless noted).
PD_RANGE = (0, 15)          # probing depth
GM_RANGE = (-5, 10)         # gingival margin / recession (+ = recession)
MOBILITY_RANGE = (0, 3)     # Miller classification
FURCATION_RANGE = (0, 3)    # Glickman classification


def calculate_cal(probing_depth: int | float | None, gingival_margin: int | float | None):
    """Clinical Attachment Level = PD + GM (GM recorded as recession).

    Returns ``None`` when either input is missing.
    """
    if probing_depth is None or gingival_margin is None:
        return None
    return probing_depth + gingival_margin
