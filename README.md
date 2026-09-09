# Patient Management & Dental Charting Application

A patient-management tool for a single dental clinic. You can add a patient, open
their profile, and record clinical findings using three charts instead of paper:
a tooth-by-tooth condition chart, a tooth-surface chart, and a gum-health
(periodontal) examination chart.

Everything is saved to MongoDB through a FastAPI backend, so the data survives a
refresh or reopening the application. The main focus was the charting
functionality — making the charts easy to read and interact with, and making
sure everything recorded is persisted.

> **This is a technical assignment, not a clinical tool.** The dental and
> periodontal models are deliberately simplified (see
> [Dental Domain Assumptions](#dental-domain-assumptions)). It assumes a single
> dental organization and does not implement authentication, because that was not
> required.

---

## Setup

Platform-specific instructions live in the two sub-READMEs — start there:

| | |
|---|---|
| **[backend/README.md](backend/README.md)** | Python venv, dependencies, `.env`, MongoDB connection, running FastAPI, Swagger, full API details, backend architecture |
| **[frontend/README.md](frontend/README.md)** | Node/npm setup, install, environment variables, dev server, frontend structure, commands |

The one-screen version:

```bash
# backend
cd backend
python -m venv venv
# Windows: venv\Scripts\Activate.ps1   |   macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp -n .env.example .env          # then set MONGODB_URI
uvicorn app.main:app --reload --port 8000

# frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** (backend must be running first).
API docs: **http://localhost:8000/docs**.

---

## Understanding the Dental Charts

The application uses three different charts because each one records a different level of dental information.

### 1. Dental Investigation Chart

This gives an overall view of the condition of each tooth. A dentist can select a tooth and record its current condition or whether treatment may be required.

For example, a tooth can be marked as having **caries, a crown, root canal treatment, or being missing**.

Both permanent and primary teeth are supported.

### 2. Tooth Surface Chart

A tooth has multiple surfaces, and a finding may apply only to one specific part of the tooth.

This chart allows the user to select a tooth, choose one or more surfaces, and record a finding for those surfaces.

The main surfaces are:

* **Mesial** — toward the center of the dental arch
* **Distal** — away from the center
* **Buccal / Labial** — toward the cheek or lips
* **Lingual / Palatal** — toward the tongue or palate
* **Occlusal** — chewing surface of posterior teeth
* **Incisal** — biting edge of anterior teeth

This keeps tooth-level findings and surface-level findings independent.

### 3. Gingival / Periodontal Examination Chart

This chart focuses on the health of the gums and the tissues supporting the teeth.

Instead of recording one value for the whole tooth, the examination is recorded at **six sites around each tooth**:

* Buccal: Mesial, Mid, Distal
* Lingual: Mesial, Mid, Distal

The chart records measurements and observations such as:

* Probing depth
* Gingival margin
* Bleeding on probing
* Plaque
* Suppuration
* Mobility
* Furcation

The application also calculates **Clinical Attachment Level (CAL)** from the recorded probing depth and gingival margin.

Together, the three charts provide three different views of the patient's dental condition:

**Overall tooth condition → Individual tooth surfaces → Gum and periodontal health**

### How the three charts relate

Every chart is keyed by the **same FDI tooth number**, so the three views compose
per tooth:

* **Dental Investigation** — is this tooth healthy, decayed, crowned, missing…?
* **Surface Chart** — *which surface* of that tooth is affected (mesial, occlusal…)?
* **Gingival Chart** — what do the gum / probing measurements around it look like?

The **patient profile → Overview tab** ties them together: an *Examination
Summary* (how many findings on each chart), an *Existing Concerns* list that
merges the non-healthy findings from all three charts by tooth, and *Quick
Access* buttons that jump straight to a chart.

---

## Features

### Patient Management

* Home page lists all patients, with search and pagination
* Add a patient through a reusable form; the **Patient ID is generated on the
  backend** (`PAT-<year>-<5 digits>`, e.g. `PAT-2026-00001`)
* Open a patient profile; the **Overview tab** rolls up all three charts —
  finding counts, a merged list of existing concerns by tooth, and quick-access
  links into each chart
* Edit patient information
* **Edit and delete a patient directly from the list** (per-row actions);
  deleting also removes that patient's three charts (backend cascade), behind a
  confirmation dialog
* All patient data is persisted in MongoDB

### Dental Investigation Chart

Graphical view of the patient's teeth with "Current Condition" and "Treatment
Required" layers and a permanent / primary dentition toggle (**Primary is only
enabled for patients aged 13 and under**, derived from the patient's age). Click
a tooth to record, edit or remove tooth-level findings (caries, crown, root canal
treated, missing, …) in a panel that opens **inline below the chart** and scrolls
into view. Teeth with findings and the selected tooth are shown visually; each
change is saved to the backend per tooth.

### Tooth Surface Chart

For findings specific to one surface of a tooth. Surfaces: Mesial, Distal,
Buccal / Labial, Lingual / Palatal, Occlusal (posterior) / Incisal (anterior).
Select a tooth, pick one or more surfaces on a 5-zone diagram, record a finding,
save it, and edit or clear it later. Same age-gated permanent / primary toggle
as above. Kept separate from the tooth-condition chart so tooth-level and
surface-level data stay independent.

### Gingival / Periodontal Examination Chart

A spreadsheet-style grid around each tooth (permanent dentition), with six sites
per tooth — {buccal, lingual} × {mesial, mid, distal}:

* Probing depth and gingival margin per site (0–15 mm / −5–10 mm)
* Bleeding on probing, plaque, suppuration per site; mobility and furcation per
  tooth (fixed 0–3 selectors)
* Clinical Attachment Level, **computed** from probing depth + gingival margin

Upper and Lower arches are shown **one at a time via a toggle** to keep the grid
compact (the whole chart is still saved and exported). Measurement cells accept
**numbers only** — digits, plus a leading `−` for the gingival margin — and are
clamped to their range. Editing is inline; a single **Save** writes the whole
chart, and the app warns before navigating away with unsaved changes.

### Together, the three charts provide three different views of the patient's dental condition:

Overall tooth condition → Individual tooth surfaces → Gum and periodontal health

### Download as image

Each of the three charts has a **Download image** button that exports the current
chart view as a PNG (`<chart>-<patient-id>-<date>.png`), rendered client-side
with `html-to-image`. Horizontally-scrolling grids are expanded to their full
width for the capture, and the editing panels are omitted from the image.

---

## Application Flow

```text
Patient List
     ↓
Add / Select Patient
     ↓
Patient Profile  ──►  Overview
     ↓
Chart tabs
 ┌───────────────────────┐
 │ Dental Investigation  │
 │ Surface               │
 │ Gingival              │
 └───────────────────────┘
     ↓
Save findings  ──►  FastAPI  ──►  MongoDB
     ↓
Reopen / refresh  ──►  data reloaded from MongoDB
```

---

## Tech Stack

| Layer | Choices |
|---|---|
| **Frontend** | React 18, **Next.js 14 (Pages Router)**, TypeScript, Mantine UI v7, TanStack Query v5, Axios, html-to-image (chart PNG export) |
| **Backend** | Python, FastAPI, Pydantic v2, `pydantic-settings`, Uvicorn |
| **Database** | MongoDB, PyMongo (async `AsyncMongoClient`) |
| **Tooling** | Git / GitHub, npm, Python virtual environment, pytest |

> **Framework note:** a typical brief for this kind of app expects React + Vite +
> React Router. This frontend uses **Next.js with the Pages Router** at the
> client's request. The conventional parts are kept — a feature-based folder
> structure, a centralized API client, and TanStack Query for all server state —
> only the routing/build layer differs (file-based routing under `src/pages/`,
> no Vite config in the repo). See [frontend/README.md](frontend/README.md).

---

## Project Structure

```text
dental-charting-system/
│
├── README.md                  ← this file
│
├── backend/                   FastAPI service  (see backend/README.md)
│   ├── app/
│   │   ├── api/routes/         thin HTTP handlers
│   │   ├── services/           business logic
│   │   ├── repositories/       MongoDB access
│   │   ├── schemas/            Pydantic request/response models
│   │   ├── validators/         reusable field + chart validation
│   │   ├── constants/dental.py FDI teeth, surfaces, findings, ranges, CAL
│   │   ├── middleware/         exception handler + request logging
│   │   ├── core/               config, errors, response envelope, logging
│   │   ├── db/                 Mongo client + index setup
│   │   └── main.py             app factory
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                  Next.js app  (see frontend/README.md)
    └── src/
        ├── pages/             routing only (index = list, patients/[id] = profile)
        ├── app/               providers, config, route helpers
        ├── components/        shared UI: common (ConfirmDialog, DownloadImageButton,
        │                      SearchInput, …), layout, feedback,
        │                      dental (ArchRow, DentitionToggle)
        ├── constants/dental/  mirror of backend dental enums
        ├── features/          patients, dental-chart, surface-chart, gingival-chart
        │                      (each: components / hooks / services / types)
        └── services/          api-client, endpoints, query-client
```

The frontend is organized around reusable components and per-feature logic; the
backend separates HTTP routing, business logic, database access, and data models.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Python | 3.11+ (developed on 3.14) | |
| Node.js | 18.17+ (developed on 24) | required by Next.js 14.2 |
| npm | bundled with Node | |
| MongoDB | Atlas cluster or local `mongod` | |
| Git | any | |

```bash
python --version
node --version
npm --version
```

---

## Database Setup

Set the connection in `backend/.env`:

```env
# Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/
DATABASE_NAME=dental_charting

# or local
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=dental_charting
```

Collections and indexes are created automatically on the first backend start —
no manual schema setup. The full variable list, Atlas walkthrough, and the
collections/indexes table are in [backend/README.md](backend/README.md).

---

## Dental Domain Assumptions

Since this is an assignment rather than a production clinical system, a few
assumptions were made. They are defined once in
`backend/app/constants/dental.py` and mirrored in
`frontend/src/constants/dental/`.

### Tooth Numbering

The **FDI two-digit system** is used everywhere (chart layout, storage keys,
validation).

```text
11 – upper-right central incisor      21 – upper-left central incisor
16 – upper-right first molar          36 – lower-left first molar
                                      46 – lower-right first molar
```

* Permanent: `11–18, 21–28, 31–38, 41–48`
* Primary:   `51–55, 61–65, 71–75, 81–85`
* Chosen because the two digits encode quadrant + position and work for both
  dentitions without a lookup table.

### Adult vs Primary Dentition

* The **Dental Investigation** and **Surface** charts have a Permanent / Primary
  toggle; findings are stored against the exact FDI number. The **Primary option
  is only enabled for patients aged 13 and under** (derived from the patient's
  age); above that it is disabled and the chart stays on Permanent.
* The **Gingival chart UI is permanent-dentition only** (the data model accepts
  any valid tooth, but the grid renders permanent teeth).

### Tooth Surfaces

| Surface | Meaning |
|---|---|
| Mesial | toward the midline |
| Distal | away from the midline |
| Buccal / Labial | toward the cheek / lips (facial aspect) |
| Lingual / Palatal | toward the tongue / palate (shown as "Palatal" for upper teeth) |
| Occlusal | chewing surface (posterior teeth) |
| Incisal | biting edge (anterior teeth) |

The backend rejects `occlusal` on an anterior tooth and `incisal` / `labial` on
a posterior tooth. A tooth can have findings on multiple surfaces; the diagram
allows multi-selection. One finding per surface is stored.

### Gingival / Periodontal Examination

* 6 sites per tooth = {buccal, lingual} × {mesial, mid, distal}.
* Per site: probing depth (0–15 mm), gingival margin (−5–10 mm), bleeding on
  probing, plaque, suppuration.
* Per tooth: mobility (0–3), furcation (0–3, only shown for multi-rooted teeth),
  notes.
* **Clinical Attachment Level formula (as implemented):**
  `CAL = probing_depth + gingival_margin`, where the gingival margin is recorded
  as **recession** — positive when the margin is apical to the CEJ, negative when
  coronal. CAL is computed on read and never stored.
* These fields represent the examination data needed for the assignment, not a
  complete clinical periodontal chart.

---

## Data Persistence

Patient and chart data is stored in MongoDB, one document per patient per chart:
the patient record + generated ID, tooth-level findings
(`dental_investigations`), surface-level findings (`surface_findings`), and
periodontal findings (`gingival_examinations`). When a profile is reopened the
data is loaded from MongoDB, so the charts do not depend on React state or
browser refreshes.

---

## UI / UX Decisions

The charts were built to be usable, not just data-entry forms:

* Clear separation between patient information and charting
* Distinct default / hover / selected / has-finding / missing tooth states,
  expressed with more than colour (glyphs, badges, borders, patterns, tooltips)
* Easy identification of teeth that already contain findings
* Separate interaction for tooth-level and surface-level findings
* **All three charts share one layout** — the chart on top, the details / finding
  panel **inline below it** (no slide-in drawers); selecting a tooth scrolls its
  panel into view
* Spreadsheet-style periodontal grid with inline editing and one explicit save
* **Download image** button on every chart (PNG export via `html-to-image`)
* Patient list rows and cards carry inline **Edit** / **Delete** actions, so a
  patient can be managed without opening the profile
* Existing findings editable in place; responsive layout; reusable components;
  consistent buttons, forms, dialogs, and loading / empty / error states

State is split so no single component owns everything: React state for local UI,
**TanStack Query** for all server data, a `useReducer` draft for the periodontal
grid. No global client store.

---

## Known Limitations

Built as an assignment, so:

* **No authentication / authorization / audit trail** — assumes a single
  organization.
* **Simplified clinical scope** — the dental and periodontal terminology is
  reduced to the requested functionality; not production-ready.
* **The tooth diagram is for interaction**, not a detailed anatomical model.
* **Gingival chart UI is permanent-dentition only.**
* **One finding per tooth surface** (use "Other" + a note for anything else).
* **Chart writes are last-write-wins at tooth granularity** — no optimistic
  locking or conflict detection.
* **No chart history** — only the current state of each chart is kept; a save
  overwrites the previous values for that tooth, so past work isn't visible.
  Planned — see *Chart history / versioning* under
  [Possible Future Improvements](#possible-future-improvements).
* **Response schemas are read-tolerant** — a patient whose stored data predates a
  stricter rule (e.g. a short phone number) still lists and opens, but editing
  that patient requires fixing the field first.
* **Tests:** 36 backend unit tests (Patient ID generation, validators, patient
  schemas). No frontend tests, no integration tests against a real MongoDB.
* No treatment planning, procedure history, imaging, prescriptions, clinical
  notes, multi-clinic support, or roles.

---

## Possible Future Improvements

* **Chart history / versioning** — today each chart stores only its *current*
  state; every save overwrites the previous values for that tooth. A future
  version would keep a full history so a clinician can see **what was done to
  each tooth over time** — a dated timeline of findings and periodontal
  recordings per chart, the ability to open any past version read-only, and a
  "compare recordings" view (e.g. this visit's probing depths vs. the last).
  Implementation sketch: append-only `*_history` collections (or embedded
  `revisions[]`), each write also recording a snapshot + `recorded_at` /
  `recorded_by`, with new `GET .../history` endpoints and a History tab in the
  patient profile.
* Authentication and role-based access; dentist / staff accounts
* Treatment planning and appointment management
* Clinical notes and dental image / X-ray uploads
* More detailed tooth anatomy and more advanced periodontal charting
* Primary-dentition support in the gingival chart
* Frontend automated tests and backend integration tests
* Docker-based local setup and deployment configuration
* A full accessibility audit

---

## Testing

**Backend:** `cd backend && pytest -q` — 36 unit tests.

**Manual end-to-end:** create a patient → confirm the ID is generated and the
profile opens → add Dental Investigation findings → add surface findings on a
tooth → enter periodontal measurements and Save → refresh the browser and reopen
the patient → confirm everything persisted → edit a finding and confirm the
update. The Swagger UI (`/docs`) can exercise individual endpoints.
