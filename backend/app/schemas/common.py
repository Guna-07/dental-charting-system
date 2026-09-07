"""Shared response-shape schemas."""

from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T | None = None
    message: str = "OK"


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: str
    details: list = []


class PageMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int


class Page(BaseModel, Generic[T]):
    items: list[T]
    meta: PageMeta
