import asyncio

import pytest

from app.services.patient_id_service import PatientIdService


class FakeCounterRepository:
    """In-memory stand-in with the same atomic-increment contract."""

    def __init__(self) -> None:
        self._seq: dict[str, int] = {}
        self._lock = asyncio.Lock()

    async def next_value(self, key: str) -> int:
        async with self._lock:
            self._seq[key] = self._seq.get(key, 0) + 1
            return self._seq[key]


@pytest.mark.asyncio
async def test_generate_format():
    service = PatientIdService(FakeCounterRepository())
    pid = await service.generate(year=2026)
    assert pid == "PAT-2026-00001"


@pytest.mark.asyncio
async def test_sequential_ids_increment():
    service = PatientIdService(FakeCounterRepository())
    ids = [await service.generate(year=2026) for _ in range(3)]
    assert ids == ["PAT-2026-00001", "PAT-2026-00002", "PAT-2026-00003"]


@pytest.mark.asyncio
async def test_concurrent_ids_are_unique():
    service = PatientIdService(FakeCounterRepository())
    ids = await asyncio.gather(*(service.generate(year=2026) for _ in range(50)))
    assert len(set(ids)) == 50
