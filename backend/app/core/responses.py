"""Helpers for the standard success response envelope.

Every route returns ``envelope(...)``; errors are shaped by the exception handler.
"""

from typing import Any


def envelope(data: Any = None, message: str = "OK") -> dict[str, Any]:
    return {"success": True, "data": data, "message": message}


def error_body(
    message: str,
    error_code: str,
    details: list | None = None,
) -> dict[str, Any]:
    return {
        "success": False,
        "message": message,
        "error_code": error_code,
        "details": details or [],
    }
