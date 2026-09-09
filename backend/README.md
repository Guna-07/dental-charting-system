# Backend — Dental Charting System

FastAPI service backing the dental charting app. REST API over MongoDB, layered
as **Route → Service → Repository → MongoDB**.

For the product overview, features, and dental domain assumptions see the
[root README](../README.md).

---

## Prerequisites

| Tool | Version |
|---|---|
| Python | 3.11+ (developed and tested on 3.14) |
| MongoDB | Atlas cluster **or** a local `mongod` (6.0+ recommended) |
| Git | any |

---

## Setup

All commands are run from the `backend/` directory.

### 1. Create a virtual environment

**Windows (PowerShell)**

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
# If activation is blocked ("running scripts is disabled"):
#   Set-ExecutionPolicy -Scope Process -Bypass
#   then re-run the activate line
```

**Windows (Git Bash)**

```bash
cd backend
python -m venv venv
source venv/Scripts/activate
```

**macOS / Linux**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

The prompt should now start with `(venv)`.

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

Key packages (all pinned in `requirements.txt`): `fastapi 0.141.1`,
`uvicorn 0.52.4`, `pydantic 2.13.5`, `pydantic-settings 2.7.1`,
`pymongo 4.18.0`, `dnspython 2.8.0` (needed for `mongodb+srv://` URIs),
`email-validator 2.2.0`. Dev: `pytest 8.3.4`, `pytest-asyncio 0.25.2`,
`httpx 0.28.1`.

### 3. Create the `.env` file

```bash
# do NOT overwrite an existing .env
cp -n .env.example .env         # PowerShell: Copy-Item .env.example .env
```

Then edit `.env` and set `MONGODB_URI` (see below).

---

## Environment Variables

Read once by `app/core/config.py`. `.env` is git-ignored; only `.env.example`
(placeholders) is committed.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MONGODB_URI` | **Yes** — app won't start without it | *(none)* | MongoDB connection string (`mongodb://…` local or `mongodb+srv://…` Atlas). **Secret.** |
| `DATABASE_NAME` | No | `dental_charting` | database name for all collections |
| `APP_ENV` | No | `development` | `development` or `production` |
| `LOG_LEVEL` | No | `INFO` | `DEBUG` \| `INFO` \| `WARNING` \| `ERROR` |
| `CORS_ORIGINS` | No | `http://localhost:3000` | comma-separated list of allowed browser origins (a JSON array is also accepted) |

`.env.example`:

```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=dental_charting
APP_ENV=development
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## MongoDB Connection

### Atlas

1. Create a free M0 cluster at <https://www.mongodb.com/cloud/atlas>.
2. **Database Access** → add a user (username + password).
3. **Network Access** → add your IP (or `0.0.0.0/0` for local dev only).
4. **Connect → Drivers** → copy the `mongodb+srv://…` string into `MONGODB_URI`.

### Local

Install MongoDB Community Server, start `mongod` on `localhost:27017`, and set
`MONGODB_URI=mongodb://localhost:27017`.

### What the app creates on startup

The lifespan hook connects the client and calls `ensure_indexes()`. No manual
schema setup is needed.

| Collection | Contents | Indexes |
|---|---|---|
| `patients` | one document per patient | `patient_id` unique; `(first_name, last_name)`; `phone_number` |
| `counters` | sequence docs, `_id` like `patient:2026`, field `seq` | `_id` |
| `dental_investigations` | one document per patient, `teeth` keyed by FDI number | `patient_id` unique |
| `surface_findings` | one document per patient | `patient_id` unique |
| `gingival_examinations` | one document per patient | `patient_id` unique |

---

## Running the API

```bash
uvicorn app.main:app --reload --port 8000
# if `uvicorn` is not found, the venv isn't active — use:
#   venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000   (Windows)
#   python -m uvicorn app.main:app --reload --port 8000                    (macOS/Linux)
```

On startup you should see `Connected to MongoDB database 'dental_charting'` and
`MongoDB indexes ensured`.

| URL | |
|---|---|
| `http://127.0.0.1:8000/api/v1` | API base |
| `http://127.0.0.1:8000/docs` | Swagger UI — test endpoints from the browser |
| `http://127.0.0.1:8000/health` | health check (pings MongoDB) |
| `http://127.0.0.1:8000/` | service info |

> **Windows + `--reload` note:** the reloader spawns worker subprocesses that
> sometimes survive a killed parent and keep the port. If you hit "address in
> use" or stale behaviour after a restart, stop the server with **Ctrl+C in its
> own terminal** (not by killing PIDs), or run without `--reload`. To find
> leftovers:
> `Get-CimInstance Win32_Process -Filter "name='python.exe'" | Where-Object { $_.CommandLine -match 'uvicorn|spawn_main' }`

---

## Tests

```bash
pytest -q
```

**36 tests** covering:

* `test_patient_id.py` — ID format, sequential increment, concurrency (with a
  fake counter repository)
* `test_patient_validator.py` — name / phone / date-of-birth rules
* `test_chart_validator.py` — tooth number, surface-for-tooth, measurement ranges, CAL
* `test_patient_schema.py` — input schema rejects bad data; **response schema
  does not re-validate stored data**

There are no integration tests against a live MongoDB.

---

## Helper Script

```bash
python -m scripts.inspect_db                 # collection counts + patient list
python -m scripts.inspect_db PAT-2026-00001  # full dump: patient + all 3 charts
```

---

## API Details

* **Base path:** `/api/v1` (`GET /` and `GET /health` sit outside it).
* **Docs:** `GET /docs`, `GET /openapi.json`.

### Response envelope

Success (every endpoint):

```json
{ "success": true, "data": { "...": "endpoint payload" }, "message": "..." }
```

The list endpoint's `data` is `{ "items": [...], "meta": { "page", "limit", "total", "total_pages" } }`.

Error (from the global exception handlers):

```json
{ "success": false, "message": "Patient 'PAT-2026-00099' was not found",
  "error_code": "PATIENT_NOT_FOUND", "details": [] }
```

Status codes: `201` create, `400` generic, `404` not found, `409`
`PATIENT_ID_CONFLICT`, `422` validation (`VALIDATION_ERROR` or a domain code such
as `INVALID_TOOTH_NUMBER` / `INVALID_SURFACE` / `MEASUREMENT_OUT_OF_RANGE`;
`details` carries the field errors), `500` `INTERNAL_ERROR`.

### Routes

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/v1/patients` | query: `search`, `page` (≥1), `limit` (1–100); search matches name / phone / patient ID |
| `POST` | `/api/v1/patients` | **201**; `patient_id` generated server-side |
| `GET` | `/api/v1/patients/{patient_id}` | 404 → `PATIENT_NOT_FOUND` |
| `PUT` | `/api/v1/patients/{patient_id}` | partial update (all fields optional) |
| `DELETE` | `/api/v1/patients/{patient_id}` | also deletes that patient's 3 chart documents |
| `GET` | `/api/v1/patients/{patient_id}/dental-chart` | full chart (`teeth: {}` if none) |
| `PUT` | `/api/v1/patients/{patient_id}/dental-chart/teeth/{tooth_number}` | create-or-replace one tooth entry |
| `DELETE` | `/api/v1/patients/{patient_id}/dental-chart/teeth/{tooth_number}` | clear one tooth |
| `GET` | `/api/v1/patients/{patient_id}/surface-chart` | full chart |
| `PUT` | `/api/v1/patients/{patient_id}/surface-chart/teeth/{tooth_number}` | partial: only listed surfaces change; `null` clears a surface |
| `GET` | `/api/v1/patients/{patient_id}/gingival-chart` | full chart; every site includes a computed `cal` |
| `PUT` | `/api/v1/patients/{patient_id}/gingival-chart` | **bulk** save of the whole chart (the path the UI uses) |
| `PATCH` | `/api/v1/patients/{patient_id}/gingival-chart/teeth/{tooth_number}` | single-tooth update (exposed; not used by the frontend) |

### Patient ID generation

`PAT-<year>-<5-digit sequence>` (e.g. `PAT-2026-00001`), generated **only on the
backend** by `PatientIdService`. A single atomic
`counters.find_one_and_update({_id: "patient:<year>"}, {$inc: {seq: 1}}, upsert=True)`
gives each concurrent request a distinct number; the unique index on
`patients.patient_id` is the backstop, with a bounded retry (max 3). The frontend
never generates or sends an ID.

### Validation

* **Patient fields** — `app/validators/patient_validator.py`, called from the
  Pydantic schema so create and update validate identically: non-blank names,
  phone with **10–15 digits** (only digits, spaces, `+ - ( ) .`), date of birth
  not in the future and implying an age ≤ 120.
* **Chart data** — `app/validators/chart_validator.py`, called from the services:
  valid FDI tooth number, surface valid for that tooth's class, PD `0–15`, GM
  `−5–10`, mobility / furcation `0–3`.
* **Vocabulary** — `app/constants/dental.py` is the single source; the frontend
  mirrors it in `src/constants/dental/`.
* **CAL** — `calculate_cal(pd, gm)` returns `pd + gm` when both are present, else
  `None`. Computed on read, never stored, never accepted as input.

---

## Backend Architecture

```
app/
├── main.py                app factory: CORS + RequestLoggingMiddleware,
│                          exception handlers, /api/v1 router,
│                          lifespan = connect Mongo + ensure indexes,
│                          plus GET / and GET /health
├── api/
│   ├── router.py          APIRouter(prefix="/api/v1"), includes 4 routers
│   ├── dependencies.py    builds a service (+ its repositories) per request
│   └── routes/            THIN: parse request → call ONE service → envelope()
│       ├── patients.py
│       ├── dental_chart.py
│       ├── surface_chart.py
│       └── gingival_chart.py
├── services/              ALL business logic
│   ├── patient_service.py         create / update / delete (cascades charts) / list
│   ├── patient_id_service.py      PAT-YYYY-NNNNN allocation
│   ├── dental_chart_service.py
│   ├── surface_chart_service.py
│   └── gingival_chart_service.py  computes CAL on read
├── repositories/          ALL MongoDB access; targeted `$set` on `teeth.<fdi>`
│   ├── base.py            shared per-patient chart-document repository
│   ├── counter_repository.py
│   ├── patient_repository.py
│   └── {dental,surface,gingival}_chart_repository.py
├── schemas/               Pydantic models — PatientFields (no validation, used by
│                          responses) vs PatientBase (constraints + validators)
├── validators/            reusable field + dental validation
├── constants/             dental.py (FDI teeth, surfaces, findings, ranges, CAL),
│                          messages.py
├── middleware/            exception_handler.py, request_logging.py
├── core/                  config.py, exceptions.py, responses.py, logging.py
└── db/                    mongodb.py (shared AsyncMongoClient), indexes.py
```

**Layer rules**

| Layer | May do | May not do |
|---|---|---|
| `api/routes` | parse request, call one service method, wrap in `envelope()` | business rules, Mongo |
| `services` | domain rules, orchestration, map to schemas | HTTP objects, Mongo queries |
| `repositories` | Mongo queries only | business rules, HTTP |

**Storage model:** one document per patient per chart, with `teeth` as an object
keyed by FDI number (`{"teeth": {"16": {…}}}`). A chart is read whole in one
query; per-tooth writes use `{"$set": {"teeth.16.…": …}}` so they never rewrite
the document or clobber sibling teeth.
