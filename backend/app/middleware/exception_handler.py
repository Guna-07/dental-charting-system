"""Global exception handling → the standard error envelope."""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pymongo.errors import DuplicateKeyError

from app.core.exceptions import AppError, ErrorCode
from app.core.logging import get_logger
from app.core.responses import error_body

logger = get_logger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=error_body(exc.message, exc.error_code, exc.details),
        )

    @app.exception_handler(RequestValidationError)
    async def _handle_validation(_: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content=error_body(
                "Request validation failed",
                ErrorCode.VALIDATION_ERROR,
                jsonable_encoder(exc.errors()),
            ),
        )

    @app.exception_handler(DuplicateKeyError)
    async def _handle_duplicate(_: Request, exc: DuplicateKeyError) -> JSONResponse:
        return JSONResponse(
            status_code=409,
            content=error_body(
                "A record with the same unique key already exists",
                ErrorCode.PATIENT_ID_CONFLICT,
            ),
        )

    @app.exception_handler(Exception)
    async def _handle_unexpected(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=500,
            content=error_body("An unexpected error occurred", ErrorCode.INTERNAL_ERROR),
        )
