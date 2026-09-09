# Frontend — Dental Charting System

Next.js 14 (**Pages Router**) + TypeScript client for the dental charting app.
UI with Mantine v7; server state with TanStack Query; a centralized Axios client;
chart PNG export with `html-to-image`.

For the product overview and dental domain assumptions see the
[root README](../README.md); for the API it talks to see
[backend/README.md](../backend/README.md).

> **Why Next.js and not Vite:** a typical brief expects React + Vite + React
> Router. This uses **Next.js with the Pages Router** at the client's request.
> The feature-based structure, centralized API client, and TanStack Query
> server-state approach are unchanged — only the routing/build layer differs
> (file routing under `src/pages/`, `next dev` / `next build` instead of Vite).
> There is no Vite config in the repo.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18.17+ (required by Next.js 14.2; developed on 24) |
| npm | bundled with Node |

```bash
node --version
npm --version
```

The backend should be running (default `http://localhost:8000`) for the app to
load data — see [backend/README.md](../backend/README.md).

---

## Setup

Same steps on every platform. Run from the `frontend/` directory.

**Windows (PowerShell)**

```powershell
cd frontend
npm install
```

**macOS / Linux**

```bash
cd frontend
npm install
```

---

## Environment Variables

Only one, and it is optional. `.env.local` is git-ignored; `.env.local.example`
is committed.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | No | `http://localhost:8000/api/v1` | Base URL of the FastAPI API, **including** the `/api/v1` prefix. A trailing slash is stripped. |

Only needed if the backend is not on the default URL:

```powershell
Copy-Item .env.local.example .env.local     # bash: cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

There are no frontend secrets.

---

## Development Server

```bash
npm run dev
```

App: **http://localhost:3000**. If 3000 is taken, Next.js offers the next free
port (e.g. 3001) — the backend's `.env.example` already allows both in
`CORS_ORIGINS`. If the backend is on a different port, the browser console will
show CORS / connection errors until `NEXT_PUBLIC_API_BASE_URL` (here) and
`CORS_ORIGINS` (backend `.env`) agree.

---

## Useful Commands

| Command | What it does |
|---|---|
| `npm run dev` | start the dev server (Fast Refresh) on port 3000 |
| `npm run build` | production build (`next build`) — also runs a full type-check |
| `npm run start` | serve the production build |
| `npm run typecheck` | `tsc --noEmit` — type-check only |

---

## Troubleshooting

* **`missing required error components, refreshing…` / every route 404s** — the
  `.next` dev cache is corrupt, usually from running `npm run build` while
  `npm run dev` is also running (they write incompatible artifacts to `.next`).
  Fix: stop the dev server, `Remove-Item -Recurse -Force .next` (bash:
  `rm -rf .next`), then `npm run dev`. Don't run `build` and `dev` together.
* **Stop the dev server with Ctrl+C in its terminal**, not by killing PIDs — on
  Windows the reloader can leave worker processes holding port 3000 and serving
  stale code.
* **CORS / connection errors in the console** — `NEXT_PUBLIC_API_BASE_URL` (here)
  and `CORS_ORIGINS` (backend `.env`) must agree; restart the backend after
  changing its `.env`.

---

## Frontend Structure

```
src/
├── pages/                          ROUTING ONLY (thin shells)
│   ├── _app.tsx                    providers + AppLayout wrap every page
│   ├── _document.tsx               Mantine ColorSchemeScript
│   ├── index.tsx                   "/"                    → patient list
│   └── patients/[patientId].tsx    "/patients/:patientId" → profile + chart tabs
│
├── app/
│   ├── providers/AppProviders.tsx  QueryClientProvider + MantineProvider + Notifications
│   ├── config/env.ts               reads NEXT_PUBLIC_API_BASE_URL once
│   └── router/routes.ts            typed path builders + profile tab list
│
├── components/
│   ├── common/                     PageHeader, EmptyState, LoadingState,
│   │                               ErrorState, ConfirmDialog, SearchInput,
│   │                               DownloadImageButton  (chart → PNG)
│   ├── layout/                     AppLayout, Header
│   ├── feedback/notify.ts          toast helpers
│   └── dental/                     ArchRow (shared FDI arch layout) +
│                                   DentitionToggle (age-gated permanent/primary)
│
├── constants/dental/               teeth.ts, surfaces.ts, findings.ts,
│                                   periodontal.ts — mirror of the backend enums
│
├── features/
│   ├── patients/                   components / hooks / services / types / utils
│   │                               (hooks/usePatientSummary.ts rolls up the 3
│   │                                charts for the Overview tab)
│   ├── dental-chart/               components / hooks / services / types
│   ├── surface-chart/              components / hooks / services / types
│   └── gingival-chart/             components / hooks / services / types
│                                   (hooks/useGingivalDraft.ts = useReducer draft)
│
├── hooks/useUnsavedChangesPrompt.ts   route + beforeunload guard for the perio grid
│
├── services/
│   ├── api-client.ts               Axios instance; unwraps { success, data, message };
│   │                               throws a normalized ApiError on any failure
│   ├── endpoints.ts                URL templates (relative to the API base URL)
│   └── query-client.ts             QueryClient factory + query-key registry
│
├── types/api.types.ts              ApiEnvelope, Paginated, ApiError
├── utils/format.ts                 date / name formatting
└── styles/globals.css              app resets + the colour-scheme icon rule +
                                    `[data-exporting]` helpers used during PNG export
```

### Chart & list behaviours

* **Consistent layout** — every chart renders the chart on top and its
  details / finding panel **inline below it** (no slide-in drawers). Selecting a
  tooth in the Dental Investigation chart scrolls the panel into view.
* **Overview tab** — `usePatientSummary` runs `useQueries` against the three
  chart query keys (shared cache with the chart tabs) and derives finding counts
  plus an *Existing Concerns* list — non-healthy dental + surface findings, and
  periodontal flags (PD ≥ 4 mm, suppuration, mobility ≥ 2) — merged and sorted by
  tooth. *Quick Access* buttons call the page's tab setter.
* **Gingival grid** — Upper / Lower arches switch via a `SegmentedControl` (one
  arch shown at a time; both stay mounted so the draft and the PNG export keep
  the full chart — the inactive arch is hidden with a `.gingival-arch-hidden`
  CSS rule). `MeasurementInput` is **numeric-only** — it strips anything that
  isn't a digit (or a leading `−` where the range allows) on type/paste, caps
  the length, and clamps to range on blur. Mobility / furcation are fixed 0–3
  `<select>`s.
* **Permanent / primary toggle** (`components/dental/DentitionToggle`) — the
  **Primary** option is disabled for patients over 13 (`primaryDentitionAllowed`
  in `constants/dental/teeth.ts`); the profile page passes `patientAge` down.
* **Download image** — `DownloadImageButton` captures a `ref`'d region with
  `html-to-image` (`toPng`, 2× pixel ratio, theme-aware background) and triggers a
  download. A `data-exporting` attribute + `globals.css` rules expand the
  horizontally-scrolling grids, hide the editing panels, and shrink the narrow
  dental arches to their content so the PNG isn't a small chart in a wide empty
  canvas. The tooth SVGs resolve their colours to concrete hex via
  `useMantineTheme()` (not `var(--mantine-color-*)`, which `html-to-image` leaves
  unresolved in SVG fill/stroke → black).
* **Patient list** — `PatientTable` / `PatientCard` rows have inline **Edit**
  (reuses `PatientFormModal`) and **Delete** (`ConfirmDialog` →
  `useDeletePatient`, which cascades the three chart documents on the backend).

### How a screen is wired

```
pages/*.tsx           thin — read route params, render a feature component
  └─ features/<x>/components/*    presentational + local UI state (useState)
       └─ features/<x>/hooks/*    TanStack Query useQuery / useMutation
            └─ features/<x>/services/*   one method per endpoint
                 └─ services/api-client.ts   Axios + envelope-unwrap + ApiError
```

### State management

* **Server data** → TanStack Query. One query key per resource
  (`['patient', id]`, `['dental-chart', id]`, …). Chart mutations return the
  whole updated chart and patch the cache with `setQueryData` (no refetch);
  patient-list mutations `invalidateQueries(['patients'])`.
* **Local UI** → `useState` (selected tooth/surface, active tab, modal open).
* **Periodontal grid** → a `useReducer` draft (`useGingivalDraft`) holds every
  edit until one explicit **Save**; `isDirty` diffing drives the save bar and the
  navigation guard.
* **No global client store** (no Redux/Zustand).

### API client

`services/api-client.ts` is the only place that knows about Axios and the
response envelope. It prepends the base URL, unwraps `data` on success, and on
any failure (transport or `success: false`) throws a normalized
`ApiError { message, errorCode, details, status }`, so every component's error
path is identical (`ErrorState`, mutation `onError`).
