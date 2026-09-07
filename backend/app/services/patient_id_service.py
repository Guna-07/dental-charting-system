"""Backend-only Patient ID generation: ``PAT-<year>-<5-digit sequence>``."""

from __future__ import annotations

from datetime import date

from app.repositories.counter_repository import CounterRepository


class PatientIdService:
    def __init__(self, counters: CounterRepository) -> None:
        self._counters = counters

    async def generate(self, *, year: int | None = None) -> str:
        year = year or date.today().year
        seq = await self._counters.next_value(f"patient:{year}")
        return f"PAT-{year}-{seq:05d}"
