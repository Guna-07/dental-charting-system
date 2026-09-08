# Dental Charting System

A patient-management and dental-charting web application for a single dental
organization. Its focus is three clinical charts — a **Dental Investigation
Chart**, a **Tooth Surface Chart**, and a **Gingival / Periodontal Examination
Chart** — with every finding persisted in MongoDB so nothing is lost on refresh.

> ## ⚠️ This is a technical/educational assignment, not a clinical tool
>
> This project was built as a take-home engineering exercise. It is **not** a
> clinical decision-support system and must not be used for patient care. The
> periodontal and dental domain models are **deliberately simplified** (6 sites
> per tooth instead of the full clinical set, one finding per surface, a
> single-formula CAL, no radiographs, no charting history). Where a real clinical
> assumption was needed it is documented in
> [Dental Domain Assumptions](#10-dental-domain-assumptions) — treat those as
> reasonable simplifications, not clinical guidance.

Authentication is intentionally out of scope (single organization, trusted
network).

---

## Table of contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Prerequisites](#4-prerequisites)
5. [Backend Setup](#5-backend-setup)
6. [Frontend Setup](#6-frontend-setup)
7. [MongoDB Setup](#7-mongodb-setup)
8. [Environment Variables](#8-environment-variables)
9. [Running Locally](#9-running-locally)
10. [Dental Domain Assumptions](#10-dental-domain-assumptions)
11. [Known Limitations](#11-known-limitations)
12. [Future Improvements](#12-future-improvements)
- [API Summary](#api-summary)

---

## 1. Project Overview

| Area | What it does |
|------|--------------|
| **Patients** | Home page lists all patients with server-side search (name / phone / patient ID) and pagination. Create via a reusable modal form; a backend-generated ID (`PAT-<year>-<5 digits>`, e.g. `PAT-2026-00001`) is assigned atomically. A patient profile page has Overview + three chart tabs. Edit and delete are supported; deleting a patient also deletes that patient's three chart documents. |
| **Dental Investigation Chart** | FDI tooth grid with two layers — *Current Condition* and *Treatment Required* (and a "Both" view). Click a tooth → a drawer opens to add / edit / remove tooth-level findings (caries, crown, root canal treated, missing, …). Permanent / primary dentition toggle. |
| **Tooth Surface Chart** | Pick a tooth → a 5-zone surface diagram (Mesial / Distal / Buccal-or-Labial / Lingual / Occlusal-or-Incisal) → select one or more surfaces → apply a surface finding. Anterior vs posterior surface sets are enforced on the server. Permanent / primary toggle. |
| **Gingival / Periodontal Chart** | Spreadsheet-style grid: 6 measurement sites per tooth (Facial/Buccal + Lingual × Mesial / Mid / Distal) with Pocket Depth, Gingival Margin, computed CAL, Bleeding on Probing, Plaque, Suppuration, plus per-tooth Mobility and Furcation. Inline editing into a local draft; one explicit **Save** writes the whole chart; an unsaved-changes guard blocks navigation while dirty. Permanent dentition only. |
| **Persistence** | All patient and chart data is stored in MongoDB. Reloading or reopening the app restores everything. |

---

## 2. Architecture

### Backend — `Route → Service → Repository → MongoDB`

```
backend/app/
├── main.py                 app factory: CORS + request-logging middleware,
│                           global exception handlers, /api/v1 router,
│                           lifespan = connect Mongo + ensure indexes,
│                           plus meta routes GET / and GET /health
├── api/
│   ├── router.py           APIRouter(prefix="/api/v1") — aggregates 4 routers
│   ├── dependencies.py     builds a service (with its repositories) per request
│   └── routes/             THIN handlers: parse request → call ONE service → envelope()
│       ├── patients.py
│       ├── dental_chart.py
│       ├── surface_chart.py
│       └── gingival_chart.py
├── services/               ALL business logic (ID allocation, finding merges,
│                           CAL, "patient must exist", cascade delete)
│   ├── patient_service.py
│   ├── patient_id_service.py
│   ├── dental_chart_service.py
│   ├── surface_chart_service.py
│   └── gingival_chart_service.py
├── repositories/           ALL MongoDB access; targeted `$set` on `teeth.<fdi>`
│   ├── base.py             shared per-patient chart-document repository
│   ├── counter_repository.py
│   ├── patient_repository.py
│   ├── dental_chart_repository.py
│   ├── surface_chart_repository.py
│   └── gingival_chart_repository.py
├── schemas/                Pydantic v2 request/response models
├── validators/             reusable field + dental validation
│   ├── patient_validator.py
│   └── chart_validator.py
├── constants/dental.py     single source of truth: FDI teeth, surfaces,
│                           finding vocab, perio sites, measurement ranges, CAL
├── middleware/
│   ├── exception_handler.py   AppError / RequestValidationError / DuplicateKeyError → envelope
│   └── request_logging.py     logs "METHOD path -> status (ms)"
├── core/                   config (pydantic-settings), error hierarchy,
│                           response-envelope helpers, logging
└── db/
    ├── mongodb.py          single shared async AsyncMongoClient
    └── indexes.py          indexes created on startup
```

Storage model: **one document per patient per chart**, with `teeth` stored as an
object keyed by FDI number (`{"teeth": {"16": {...}}}`). A chart is read whole in
one query; per-tooth writes use `{"$set": {"teeth.16.…": …}}` so they do not
rewrite the document or clobber sibling teeth.

### Frontend — Next.js (Pages Router), feature-based

> **Deviation from a plain React + Vite setup:** a typical brief for this kind of
> app expects **React + Vite + React Router**. This frontend is built on
> **Next.js 14 with the Pages Router** instead. The reason is a direct
> instruction during development to use Next.js with page-based routing. The
> parts of the conventional design that matter are preserved: a **feature-based**
> folder structure, a **centralized API client**, and **TanStack Query** for all
> server state. What actually differs is only the routing/build layer —
> file-based routing under `src/pages/` instead of a React Router route config,
> and `next dev` / `next build` instead of the Vite dev server and bundler. There
> is **no Vite config anywhere in the repo**.

```
frontend/src/
├── pages/                          ROUTING ONLY (thin shells)
│   ├── _app.tsx                    Mantine + TanStack Query providers + AppLayout
│   ├── _document.tsx               Mantine ColorSchemeScript
│   ├── index.tsx                   "/"                    → patient list
│   └── patients/[patientId].tsx    "/patients/:patientId" → profile + chart tabs
├── app/
│   ├── providers/AppProviders.tsx  QueryClientProvider + MantineProvider + Notifications
│   ├── config/env.ts               reads NEXT_PUBLIC_API_BASE_URL once
│   └── router/routes.ts            typed path builders + tab list
├── components/
│   ├── common/                     PageHeader, EmptyState, LoadingState, ErrorState,
│   │                               ConfirmDialog, SearchInput
│   ├── layout/                     AppLayout, Header
│   ├── feedback/notify.ts          toast helpers
│   └── dental/ArchRow.tsx          shared FDI arch layout primitive (used by
│                                   the dental + surface charts)
├── constants/dental/               teeth.ts, surfaces.ts, findings.ts,
│                                   periodontal.ts — mirror of backend enums
├── features/
│   ├── patients/                   components/ hooks/ services/ types/ utils/
│   ├── dental-chart/               components/ hooks/ services/ types/
│   ├── surface-chart/              components/ hooks/ services/ types/
│   └── gingival-chart/             components/ hooks/ services/ types/
│                                   (hooks/useGingivalDraft.ts = useReducer draft)
├── services/
│   ├── api-client.ts               axios instance; unwraps { success, data, message };
│   │                               throws a normalized ApiError on any failure
│   ├── endpoints.ts                URL templates (relative to API_BASE_URL)
│   └── query-client.ts             QueryClient factory + query-key registry
└── hooks/useUnsavedChangesPrompt.ts   route + beforeunload guard for the perio grid
```

**State management:** server data lives in **TanStack Query** (one query key per
resource; chart mutations return the whole updated chart and patch the cache with
`setQueryData`). Local UI uses `useState`. The periodontal grid — hundreds of
cells edited before one save — uses a **`useReducer` draft** (`useGingivalDraft`)
with dirty-tracking, a single bulk `PUT`, and a navigation guard. There is **no
global client store** (no Redux/Zustand).

---

## 3. Technology Stack

### Backend (`backend/requirements.txt`, exact versions)

| Package | Version | Role |
|---------|---------|------|
| `fastapi` | 0.141.1 | web framework |
| `starlette` | 1.6.0 | ASGI toolkit (FastAPI dependency; also used for middleware) |
| `uvicorn` | 0.52.4 | ASGI server |
| `pydantic` | 2.13.5 | schemas / validation |
| `pydantic-settings` | 2.7.1 | typed environment configuration |
| `pydantic_core` | 2.46.5 | Pydantic core (pinned) |
| `pymongo` | 4.18.0 | MongoDB driver — uses the **async** `AsyncMongoClient` |
| `dnspython` | 2.8.0 | required for `mongodb+srv://` (Atlas) URIs |
| `python-dotenv` | 1.2.3 | `.env` loading |
| `email-validator` | 2.2.0 | `EmailStr` validation |
| `anyio` | 4.15.1 | async support |
| `annotated-types`, `h11`, `idna`, `click`, `typing_extensions`, `typing-inspection` | pinned | transitive |
| **dev:** `pytest` | 8.3.4 | tests |
| **dev:** `pytest-asyncio` | 0.25.2 | async tests |
| **dev:** `httpx` | 0.28.1 | test client dependency |

### Frontend (`frontend/package.json`, exact versions)

| Package | Version | Role |
|---------|---------|------|
| `next` | 14.2.35 | React framework (Pages Router) |
| `react` / `react-dom` | 18.3.1 | UI runtime |
| `@mantine/core` / `hooks` / `form` / `dates` / `notifications` | 7.13.4 | UI component library |
| `@tanstack/react-query` | 5.59.16 | server-state management |
| `axios` | 1.7.7 | HTTP client |
| `dayjs` | 1.11.13 | date formatting (also a Mantine `dates` peer) |
| `@tabler/icons-react` | 3.19.0 | icons |
| **dev:** `typescript` | 5.6.3 | types |
| **dev:** `@types/node` | 20.16.11 | Node types |
| **dev:** `@types/react` / `@types/react-dom` | 18.3.11 / 18.3.1 | React types |

### Database

MongoDB (works with **MongoDB Atlas** or a **local `mongod`**). The repository
uses the following collections, all created/indexed automatically on first start:
`patients`, `counters`, `dental_investigations`, `surface_findings`,
`gingival_examinations`.

---

## 4. Prerequisites

| Tool | Version used in development | Minimum |
|------|----------------------------|---------|
| **Python** | 3.14.7 | 3.11+ |
| **Node.js** | 24.19.0 | 18.17+ (required by Next.js 14.2) |
| **npm** | 12.0.2 | any version bundled with a supported Node |
| **MongoDB** | Atlas M0 free cluster (a local `mongod` on `:27017` also works) | 6.0+ recommended |

You also need `git` to clone, and a browser.

---

## 5. Backend Setup

From the repository root:

```powershell
cd backend

# 1. Create and activate a virtual environment
python -m venv venv
venv\Scripts\Activate.ps1            # PowerShell
#  - Git Bash / WSL:   source venv/Scripts/activate
#  - macOS / Linux:    source venv/bin/activate
#  - if PowerShell blocks the script:  Set-ExecutionPolicy -Scope Process -Bypass  then re-run

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create your local env file (does NOT overwrite an existing one)
Copy-Item -Path .env.example -Destination .env      # PowerShell
#  - bash:   cp -n .env.example .env
#  Then edit .env and set MONGODB_URI (see "Environment Variables" below).

# 4. Run the API (auto-reload)
uvicorn app.main:app --reload --port 8000
#  - if `uvicorn` is "not recognized", the venv isn't active; use:
#    venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

- API base URL: `http://localhost:8000/api/v1`
- Interactive API docs (Swagger): `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

On startup you should see log lines confirming
`Connected to MongoDB database 'dental_charting'` and `MongoDB indexes ensured`.

### Run the backend tests

```powershell
cd backend
venv\Scripts\Activate.ps1
pytest -q
```

Covers Patient ID generation (format, sequential increment, concurrency with a
fake counter repository), the patient / chart validators, and the patient
input/output schemas. **36 tests.**

---

## 6. Frontend Setup

From the repository root:

```powershell
cd frontend

# 1. Install dependencies
npm install

# 2. (Optional) create the local env file
Copy-Item -Path .env.local.example -Destination .env.local     # PowerShell
#  - bash:   cp .env.local.example .env.local
#  Only needed if the backend is NOT on http://localhost:8000/api/v1.
#  The app falls back to that URL when NEXT_PUBLIC_API_BASE_URL is unset.

# 3. Run the dev server
npm run dev
```

- App: `http://localhost:3000`
- If port 3000 is taken, Next.js will offer the next free port (e.g. 3001). The
  backend's `.env.example` already allows both `3000` and `3001` in
  `CORS_ORIGINS`.

Other scripts: `npm run build` (production build), `npm run start` (serve the
build), `npm run typecheck` (`tsc --noEmit`).

---

## 7. MongoDB Setup

The app connects with whatever `MONGODB_URI` you put in `backend/.env`. Both
options below work; **this project was developed against MongoDB Atlas**, and the
committed `.env.example` ships a **local** placeholder.

### Option A — MongoDB Atlas (recommended, matches how this was built)

1. Create a free account at <https://www.mongodb.com/cloud/atlas> and create a
   **free M0 cluster**.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → add your current IP address (or `0.0.0.0/0` for local
   development only).
4. **Clusters → Connect → Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@<cluster>.xxxxx.mongodb.net/?appName=<name>
   ```
5. Put it in `backend/.env` as `MONGODB_URI` and set `DATABASE_NAME=dental_charting`.
6. Start the backend. It creates the collections and indexes on first run; no
   manual schema setup is required.

To browse the data: Atlas → your cluster → **Browse Collections** → database
`dental_charting`.

### Option B — Local MongoDB

1. Install **MongoDB Community Server** and ensure `mongod` is running on
   `localhost:27017` (the default).
2. In `backend/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017
   DATABASE_NAME=dental_charting
   ```
3. Start the backend. Collections and indexes are created automatically.

### What gets created

| Collection | Contents |
|------------|----------|
| `patients` | one document per patient; `patient_id` unique index, name + phone indexes |
| `counters` | sequence documents, `_id` like `patient:2026`, field `seq` |
| `dental_investigations` | one document per patient; `patient_id` unique index |
| `surface_findings` | one document per patient; `patient_id` unique index |
| `gingival_examinations` | one document per patient; `patient_id` unique index |

A helper script is included to inspect the database:

```powershell
cd backend
venv\Scripts\Activate.ps1
python -m scripts.inspect_db                 # counts + patient list
python -m scripts.inspect_db PAT-2026-00001  # full dump: patient + all 3 charts
```

---

## 8. Environment Variables

**Never commit real secrets.** `backend/.env` and `frontend/.env.local` are
git-ignored (see [.gitignore verification](#gitignore-verification)); only the
`*.example` files are committed, with placeholder values.

### Backend — every variable read by `app/core/config.py`

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `MONGODB_URI` | **Yes** (no default; app fails to start without it) | — | MongoDB connection string (`mongodb://…` local or `mongodb+srv://…` Atlas). **Secret.** |
| `DATABASE_NAME` | No | `dental_charting` | Database name used for all collections. |
| `APP_ENV` | No | `development` | `development` or `production` (only affects an `is_production` helper / the `/` response). |
| `LOG_LEVEL` | No | `INFO` | `DEBUG` \| `INFO` \| `WARNING` \| `ERROR`. |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated list of allowed browser origins. A JSON array is also accepted. |

`backend/.env.example` (placeholders only — safe to commit):

```dotenv
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=dental_charting
APP_ENV=development
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend — every variable read by the client

| Variable | Required | Default (in `app/config/env.ts`) | Purpose |
|----------|----------|----------------------------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | No | `http://localhost:8000/api/v1` | Base URL of the FastAPI API, **including** the `/api/v1` prefix. A trailing slash is stripped. |

`frontend/.env.local.example` (safe to commit):

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

There are no other frontend environment variables and no frontend secrets.

<a id="gitignore-verification"></a>
### .gitignore verification

Confirmed with `git check-ignore` and `git ls-files`:

| Path | Ignored by | Tracked in git? |
|------|-----------|-----------------|
| `backend/.env` | root `.gitignore` (`.env`) | No |
| `frontend/.env.local` | `frontend/.gitignore` (`.env*.local`) | No |
| `backend/venv/` | root `.gitignore` (`venv/`) | No |
| `frontend/node_modules/` | `frontend/.gitignore` (`node_modules/`) | No |
| `frontend/.next/` | `frontend/.gitignore` (`.next/`) | No |
| `backend/.env.example`, `frontend/.env.local.example` | — | **Yes** (placeholders only) |

The only `.env*` file tracked by git is `backend/.env.example`.

---

## 9. Running Locally

Two terminals, from the repository root.

**Terminal 1 — backend (PowerShell):**

```powershell
cd backend
python -m venv venv                       # first time only
venv\Scripts\Activate.ps1
pip install -r requirements.txt           # first time only
Copy-Item -Path .env.example -Destination .env    # first time only, then edit MONGODB_URI
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — frontend (PowerShell):**

```powershell
cd frontend
npm install                               # first time only
npm run dev
```

**Equivalent on macOS / Linux / Git Bash:**

```bash
# backend
cd backend
python -m venv venv && source venv/bin/activate      # or venv/Scripts/activate on Git Bash
pip install -r requirements.txt
cp -n .env.example .env                               # then edit MONGODB_URI
uvicorn app.main:app --reload --port 8000

# frontend (new terminal)
cd frontend
npm install
npm run dev
```

Then open **`http://localhost:3000`**, click **Add Patient**, open the profile,
switch between the **Dental Investigation / Surface / Gingival** tabs, record some
findings, and **refresh the browser** — everything persists.

Quick backend check without the UI:

```bash
curl http://localhost:8000/health
curl "http://localhost:8000/api/v1/patients?limit=5"
```

> **Port already in use?** If `uvicorn` reports the address is unavailable and
> nothing of yours is running, a previous dev server's socket may still be held
> by the OS for a short time. Wait a minute, or run on another port
> (`--port 8001`) and set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8001/api/v1`
> in `frontend/.env.local`.

---

## 10. Dental Domain Assumptions

All of the following are implemented in `backend/app/constants/dental.py` and
mirrored in `frontend/src/constants/dental/`.

### Tooth numbering system — FDI (ISO 3950)

The **FDI World Dental Federation two-digit notation** is used everywhere (chart
layout, storage keys, validation).

- **Permanent:** quadrants `1`=upper-right, `2`=upper-left, `3`=lower-left,
  `4`=lower-right; tooth position `1`–`8` counted from the midline. →
  `11–18, 21–28, 31–38, 41–48` (32 teeth).
- **Primary:** quadrants `5`=UR, `6`=UL, `7`=LL, `8`=LR; position `1`–`5`. →
  `51–55, 61–65, 71–75, 81–85` (20 teeth).

**Why FDI:** each tooth is two digits that encode quadrant + position, it is
unambiguous across both dentitions, and it maps directly onto a quadrant-based
chart UI without a lookup table. (The Universal Numbering System, 1–32 for
adults, does not carry quadrant information in the number and needs separate
handling for primary teeth.)

### Adult vs primary dentition representation

- **Dental Investigation Chart** and **Tooth Surface Chart**: a Permanent /
  Primary toggle; findings are stored against the exact FDI number, so both
  dentitions coexist for the same patient.
- **Gingival / Periodontal Chart**: **permanent dentition only** in the UI (the
  grid renders `PERMANENT_UPPER` / `PERMANENT_LOWER`). The data model and the API
  accept any valid FDI tooth, but the periodontal grid does not render primary
  teeth.
- Anterior teeth = positions `1`–`3` (incisors, canine); posterior = `4`–`8`.

### Tooth surface terminology

| Tooth type | Surfaces recorded |
|------------|-------------------|
| **Posterior** (premolars, molars) | Mesial, Distal, **Buccal**, Lingual, **Occlusal** |
| **Anterior** (incisors, canines) | Mesial, Distal, **Labial**, Lingual, **Incisal** |

- The server validates the surface against the tooth: `occlusal` is rejected on
  an anterior tooth, `incisal` / `labial` on a posterior tooth
  (`is_valid_surface`).
- The oral surface is stored as `lingual` for every tooth; the frontend **labels
  it "Palatal" for maxillary teeth** (display only, no separate value).
- Surface-level finding vocabulary: `caries`, `restoration`, `sealant`, `wear`,
  `fracture`, `healthy`, `other`.

### Dental Investigation finding vocabulary

`caries`, `missing`, `filled`, `crown`, `root_canal_treated`, `fractured`,
`implant`, `extraction_required`, `healthy`, `other`.

Each finding also carries a **status**: `current` (an existing condition) or
`planned` (treatment required). This is what drives the chart's two panels
("Current Condition" vs "Treatment Required").

### Gingival / periodontal chart assumptions

- **6 measurement sites per tooth** = two aspects (`buccal`, `lingual`) × three
  positions (`mesial`, `mid`, `distal`). This is a simplification of full
  periodontal charting.
- **Per site:** Probing Depth (`pd`), Gingival Margin (`gm`), Bleeding on Probing
  (`bop`, boolean), Plaque (`plaque`, boolean), Suppuration (`suppuration`,
  boolean).
- **Per tooth:** Mobility (`0`–`3`, Miller-style), Furcation (`0`–`3`,
  Glickman-style), free-text notes. Furcation is only offered for **multi-rooted
  teeth** — all molars plus the maxillary first premolars (`has_furcation`).
- **Measurement ranges (inclusive), enforced by the schema and validators:**
  `pd` `0`–`15` mm, `gm` `-5`–`10` mm, `mobility` `0`–`3`, `furcation` `0`–`3`.
- Editing is done inline into a client-side draft; a single **Save** writes the
  entire chart in one request (there is no per-keystroke or per-cell save from
  the UI).

### CAL calculation — exact formula implemented

```
CAL = PD + GM        (only when both PD and GM are present; otherwise CAL is null)
```

Implemented in `calculate_cal(probing_depth, gingival_margin)` in
`backend/app/constants/dental.py` and `calcCal(pd, gm)` in
`frontend/src/constants/dental/periodontal.ts`.

**Assumption about GM:** the Gingival Margin value is recorded as **recession** —
the position of the gingival margin relative to the CEJ, **positive when the
margin is apical to the CEJ** (true recession, root surface exposed) and
**negative when the margin is coronal to the CEJ** (no recession / gingival
overgrowth).

- Example: PD `4` mm, GM `1` mm (1 mm recession) → **CAL `5` mm**.
- Example: PD `3` mm, GM `-2` mm (margin 2 mm coronal to the CEJ) → **CAL `1` mm**.

CAL is **computed on read** (backend response field `cal`; frontend cell) and is
**never stored and never accepted as input**.

---

## 11. Known Limitations

Stated plainly — these are real gaps, not polish items:

- **No authentication / authorization / users / audit trail.** Anyone who can
  reach the API can read and write all data. This is intentional for the
  assignment (single organization) but makes it unsuitable for real use.
- **The gingival/periodontal chart UI is permanent-dentition only.** Primary
  teeth are not rendered in that grid even though the storage and API accept
  them.
- **One finding per tooth surface.** You cannot record, say, `caries` *and*
  `restoration` as distinct findings on the same surface; the workaround is
  `other` + a note.
- **Chart writes are last-write-wins at tooth granularity.** There is no
  optimistic locking, no per-field merge, and no conflict detection. Two people
  editing the same tooth at the same time will overwrite each other.
- **Gingival save is a full-chart bulk `PUT`.** The backend also exposes
  `PATCH /gingival-chart/teeth/{tooth_number}` for single-tooth updates, but the
  frontend never calls it — it always sends the whole chart.
- **No charting history / versioning.** Only the current state of each chart is
  stored; there is no "compare recordings across dates" for periodontal data.
- **Test coverage is narrow.** There are **36 backend unit tests** covering
  Patient ID generation, the patient/chart validators, and the patient
  input/output schemas. There are **no frontend tests**, **no
  service/repository/route tests**, and **no integration tests** against a real
  MongoDB.
- **Read schemas are tolerant of legacy data.** Response models do not re-run
  input validation, so a patient whose stored phone number predates the current
  10–15 digit rule still lists and opens normally — but saving an **edit** to
  that patient requires correcting the phone number first (the update goes
  through the input validator). There is no data-migration step.
- **Simplified periodontal model.** 6 sites per tooth (not the full clinical
  site set), single-formula CAL, no mucogingival junction / attached gingiva, no
  radiographic bone levels.
- **Response timestamps are UTC without an explicit offset suffix.**
- **Minimal API hardening.** No rate limiting, no request-body size limits;
  pagination `limit` is capped at 100 but there is no other abuse protection.
- **CORS is credential-enabled against an explicit origin list** from
  `CORS_ORIGINS` (no wildcard); origins not listed are rejected by the browser.

---

## 12. Future Improvements

Confirmed **not** implemented in the current codebase:

- **Authentication & authorization** — user accounts, roles/permissions,
  per-organization data isolation (multi-tenant).
- **Automated tests** — a frontend test suite (component + interaction), backend
  service/repository/route tests, and integration tests against an ephemeral
  MongoDB.
- **Periodontal charting history** — store dated recordings and add the
  "compare recordings" view.
- **Primary-dentition support in the gingival chart UI.**
- **Multiple findings per tooth surface.**
- **Concurrency handling** — optimistic locking / version fields / conflict
  resolution on chart edits.
- **Debounced autosave** for the periodontal grid, in addition to explicit Save.
- **Richer clinical data** — tooth image / radiograph uploads, treatment
  planning, notes history.
- **Export** — PDF / printable chart export.
- **Observability** — structured request/response logging with correlation IDs
  and metrics (only a lightweight `METHOD path -> status (ms)` logger exists).
- **Data protection** — encryption at rest, PII handling policy, consent
  tracking.
- **A formal accessibility audit.** ARIA labels, keyboard-operable chart
  controls, focus/selected states, and non-colour-only tooth encoding are
  implemented, but not independently audited.

---

## API Summary

- **Base path:** `/api/v1` (mounted by `APIRouter(prefix="/api/v1")`).
- **Meta routes (not under `/api/v1`):** `GET /` and `GET /health`.
- **Interactive docs:** `GET /docs` (Swagger UI), `GET /openapi.json`.

### Routes

| Method | Path | Body | Notes |
|--------|------|------|-------|
| `GET` | `/api/v1/patients` | — | query params `search`, `page` (≥1), `limit` (1–100); `search` matches first/last name, phone, or patient ID (case-insensitive) |
| `POST` | `/api/v1/patients` | `PatientCreate` | returns **201**; `patient_id` is generated server-side |
| `GET` | `/api/v1/patients/{patient_id}` | — | 404 → `error_code: PATIENT_NOT_FOUND` |
| `PUT` | `/api/v1/patients/{patient_id}` | `PatientUpdate` (all fields optional) | partial update |
| `DELETE` | `/api/v1/patients/{patient_id}` | — | also deletes this patient's 3 chart documents |
| `GET` | `/api/v1/patients/{patient_id}/dental-chart` | — | returns the full chart (empty `teeth: {}` if none yet) |
| `PUT` | `/api/v1/patients/{patient_id}/dental-chart/teeth/{tooth_number}` | `{ dentition?, findings[], notes }` | create-or-replace the whole tooth entry |
| `DELETE` | `/api/v1/patients/{patient_id}/dental-chart/teeth/{tooth_number}` | — | clear one tooth |
| `GET` | `/api/v1/patients/{patient_id}/surface-chart` | — | full chart |
| `PUT` | `/api/v1/patients/{patient_id}/surface-chart/teeth/{tooth_number}` | `{ surfaces: { <surface>: { finding, notes } \| null } }` | **partial**: only listed surfaces change; `null` clears a surface |
| `GET` | `/api/v1/patients/{patient_id}/gingival-chart` | — | full chart; every site includes a computed `cal` |
| `PUT` | `/api/v1/patients/{patient_id}/gingival-chart` | `{ teeth: { <tooth_number>: { buccal, lingual, mobility, furcation, notes } } }` | **bulk** save of the whole chart (the path the UI uses) |
| `PATCH` | `/api/v1/patients/{patient_id}/gingival-chart/teeth/{tooth_number}` | `ToothPerioInput` | single-tooth update (exposed by the API; **not used by the frontend**) |

Invalid tooth numbers, invalid surface/tooth combinations, and out-of-range
measurements are rejected with **422** and a specific `error_code`
(`INVALID_TOOTH_NUMBER`, `INVALID_SURFACE`, `MEASUREMENT_OUT_OF_RANGE`, …).

### Response shape

**Success** — every endpoint returns this envelope:

```json
{
  "success": true,
  "data": { "...": "endpoint-specific payload" },
  "message": "Human-readable summary"
}
```

The list endpoint's `data` is `{ "items": [...], "meta": { "page", "limit", "total", "total_pages" } }`.

**Error** — produced by the global exception handlers:

```json
{
  "success": false,
  "message": "Patient 'PAT-2026-00099' was not found",
  "error_code": "PATIENT_NOT_FOUND",
  "details": []
}
```

Status codes: `400` generic client error, `404` not found, `409`
`PATIENT_ID_CONFLICT` (duplicate key), `422` validation
(`VALIDATION_ERROR` or a domain-specific code; `details` carries the field
errors), `500` `INTERNAL_ERROR` for anything unhandled.

### Patient ID generation

`PAT-<year>-<5-digit sequence>` (e.g. `PAT-2026-00001`). Generated **only on the
backend** by `PatientIdService`: a single atomic
`counters.find_one_and_update({_id: "patient:<year>"}, {$inc: {seq: 1}}, upsert=True)`
gives each concurrent request a distinct number; the **unique index on
`patients.patient_id`** is the backstop, with a bounded retry (max 3) if a
collision ever occurs. The frontend never generates or sends an ID.

---

## Further reading

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — the up-front design (schemas, component tree, state plan, domain decisions).
- [`docs/EXPLANATION.md`](docs/EXPLANATION.md) — how it works and why, per chart.
- [`docs/WALKTHROUGH.md`](docs/WALKTHROUGH.md) — every layer and call traced end to end.
