"""Application error hierarchy.

Services and repositories raise these; the exception-handler middleware turns them
into the standard error envelope. Business code never builds an HTTP response
directly.
"""

from __future__ import annotations


class ErrorCode:
    VALIDATION_ERROR = "VALIDATION_ERROR"
    PATIENT_NOT_FOUND = "PATIENT_NOT_FOUND"
    PATIENT_ID_CONFLICT = "PATIENT_ID_CONFLICT"
    INVALID_TOOTH_NUMBER = "INVALID_TOOTH_NUMBER"
    INVALID_SURFACE = "INVALID_SURFACE"
    INVALID_FINDING_TYPE = "INVALID_FINDING_TYPE"
    MEASUREMENT_OUT_OF_RANGE = "MEASUREMENT_OUT_OF_RANGE"
    CHART_NOT_FOUND = "CHART_NOT_FOUND"
    INTERNAL_ERROR = "INTERNAL_ERROR"


class AppError(Exception):
    """Base class for all expected, handled application errors."""

    status_code: int = 400
    error_code: str = ErrorCode.VALIDATION_ERROR

    def __init__(
        self,
        message: str,
        *,
        error_code: str | None = None,
        status_code: int | None = None,
        details: list | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        if error_code is not None:
            self.error_code = error_code
        if status_code is not None:
            self.status_code = status_code
        self.details = details or []


class NotFoundError(AppError):
    status_code = 404
    error_code = ErrorCode.CHART_NOT_FOUND


class PatientNotFoundError(NotFoundError):
    error_code = ErrorCode.PATIENT_NOT_FOUND

    def __init__(self, patient_id: str) -> None:
        super().__init__(f"Patient '{patient_id}' was not found")


class ConflictError(AppError):
    status_code = 409
    error_code = ErrorCode.PATIENT_ID_CONFLICT


class ValidationError(AppError):
    status_code = 422
    error_code = ErrorCode.VALIDATION_ERROR
