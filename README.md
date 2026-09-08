# Patient Management & Dental Charting Application

It's a patient-management tool for a dental clinic. You can add a patient, open their profile, and record clinical findings using three charts instead of paper: a tooth-by-tooth condition chart, a tooth-surface chart for recording findings on specific areas of a tooth, and a complete gum-health examination chart.

Everything is saved to MongoDB through a FastAPI backend, so the data is still available even after refreshing or reopening the application.

The application includes three main dental charts:

* Dental Investigation Chart
* Tooth Surface Chart
* Gingival / Periodontal Examination Chart

The main focus of the implementation was the dental charting functionality, particularly making the charts simple to understand and easy to interact with while ensuring that all the recorded information is properly saved.

---

## Features

### Patient Management

* View all patients from the home page
* Add a new patient
* Automatically generate a unique Patient ID
* View patient details
* Edit patient information
* Open an individual patient profile
* Patient information is persisted in MongoDB

### Dental Investigation Chart

The Dental Investigation Chart provides a graphical view of the patient's teeth.

It supports:

* Adult dentition
* Primary dentition
* Individual tooth selection
* Recording tooth-level findings
* Visual indication of selected teeth
* Viewing and editing existing findings
* Saving findings to the backend

### Tooth Surface Chart

The Surface Chart is used when a finding needs to be recorded against a specific surface of a tooth.

Supported surfaces include:

* Mesial
* Distal
* Buccal / Facial
* Lingual / Palatal
* Occlusal / Incisal

The chart allows the user to:

* Select a tooth
* Select one or more surfaces
* Enter a finding
* Save the finding
* View existing findings
* Edit previously saved findings

This was implemented separately from the general tooth condition chart so that tooth-level and surface-level information can be maintained independently.

### Gingival / Periodontal Examination Chart

The Gingival Examination Chart is used to record gum and periodontal findings.

The chart provides a structured examination grid for recording findings around individual teeth.

The implementation includes:

* Periodontal probing measurements
* Multiple examination sites around a tooth
* Plaque information
* Bleeding on probing
* Gingival margin measurements
* Clinical attachment level
* Mobility
* Furcation
* Suppuration
* Saving examination results
* Editing existing results

The main goal was to provide a structured way to enter periodontal findings while keeping the interface manageable for the user.

---

## Tech Stack

### Frontend

* React
* Next.js
* TypeScript
* Mantine UI
* TanStack Query

### Backend

* Python
* FastAPI
* Pydantic
* Uvicorn

### Database

* MongoDB
* PyMongo

### Development

* Git / GitHub
* npm
* Python virtual environment

---

## Project Structure

The project is divided into frontend and backend applications.

```text
dental-charting-system/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   └── package.json
│
└── README.md
```

The frontend is organized around reusable components and feature-specific logic, while the backend separates API routes, business logic, database access, and data models.

---

# Prerequisites

Before running the application, make sure the following are installed:

* Python 3.10+
* Node.js 18+
* npm
* MongoDB or a MongoDB Atlas account
* Git

You can check the installed versions using:

```bash
python --version
node --version
npm --version
```

---

# Database Setup

The application uses MongoDB for persistent storage.

You can either run MongoDB locally or use MongoDB Atlas.

## Option 1: MongoDB Atlas

1. Create a MongoDB Atlas account.
2. Create a cluster.
3. Create a database user.
4. Allow your IP address in the network access settings.
5. Copy the MongoDB connection string.

The backend uses the connection string through an environment variable.

Example:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/
DATABASE_NAME=dental_charting
```

## Option 2: Local MongoDB

If MongoDB is installed locally, the connection can be configured as:

```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=dental_charting
```

The required collections are created/used by the application when data is stored.

---

# Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

## Create a virtual environment

### Windows

```powershell
python -m venv venv
```

Activate it:

```powershell
.\venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

## Install dependencies

```bash
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=dental_charting
```

If using MongoDB Atlas, replace `MONGODB_URI` with the Atlas connection string.

## Start the backend

Run:

```bash
uvicorn app.main:app --reload
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

FastAPI also provides interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

The `/docs` page can be used to test the REST APIs directly from the browser.

---

# Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

Make sure the FastAPI backend is running before using the application.

---

# Running the Application

Once both applications are running:

### Backend

```bash
cd backend
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:3000
```

The basic flow is:

```text
Patient List
     ↓
Add / Select Patient
     ↓
Patient Profile
     ↓
Dental Charts
 ┌───────────────┐
 │ Investigation │
 │ Surface       │
 │ Gingival      │
 └───────────────┘
     ↓
Save Findings
     ↓
MongoDB
```

---

# API Overview

The frontend communicates with the backend using REST APIs.

The APIs cover:

### Patients

* Create patient
* Get patients
* Get patient by ID
* Update patient

### Dental Findings

* Get dental findings for a patient
* Create/update tooth-level findings

### Surface Findings

* Get surface findings
* Create/update surface findings
* Update findings for selected tooth surfaces

### Gingival Findings

* Get gingival examination data
* Save/update periodontal findings

The backend validates incoming data using Pydantic models before storing it in MongoDB.

---

# Data Persistence

Patient and chart information is stored in MongoDB.

This includes:

* Patient information
* Generated Patient ID
* Tooth-level findings
* Surface-level findings
* Gingival / periodontal findings

The application loads the saved information again when the patient profile is reopened.

This means chart information is not dependent only on React state or browser refreshes.

---

# Dental Domain Assumptions

Since this is a technical assignment rather than a production clinical system, a few assumptions were made while implementing the dental charts.

## Tooth Numbering

The application uses the **FDI two-digit tooth numbering system** for identifying teeth.

For example:

```text
11 - Upper right central incisor
16 - Upper right first molar
21 - Upper left central incisor
36 - Lower left first molar
46 - Lower right first molar
```

Primary teeth are handled separately from adult teeth.

## Tooth Surfaces

The surface chart uses the following terminology:

| Surface           | Meaning                            |
| ----------------- | ---------------------------------- |
| Mesial            | Surface toward the midline         |
| Distal            | Surface away from the midline      |
| Buccal / Facial   | Surface toward the cheek/lips      |
| Lingual / Palatal | Surface toward the tongue/palate   |
| Occlusal          | Chewing surface of posterior teeth |
| Incisal           | Cutting edge of anterior teeth     |

A tooth can have more than one affected surface, so the interface allows multiple surface selections where appropriate.

## Gingival / Periodontal Examination

The periodontal chart is represented as a structured grid around each tooth.

The implementation uses multiple sites per tooth for recording measurements such as:

* Probing depth
* Gingival margin
* Bleeding on probing
* Plaque
* Suppuration
* Mobility
* Furcation
* Clinical attachment level

Clinical attachment level is derived from the probing depth and gingival margin relationship.

These fields are intended to represent the examination data required for this assignment and are not intended to replace a complete clinical periodontal charting system.

---

# UI / UX Decisions

A major focus of the application was making the dental charts usable rather than treating them as simple data-entry forms.

Some of the decisions include:

* Clear visual separation between patient information and charting
* Selected and unselected tooth states
* Easy identification of teeth that already contain findings
* Separate interaction for tooth-level and surface-level findings
* Structured periodontal examination grid
* Editable existing findings
* Responsive layout for different screen sizes
* Reusable UI components
* Consistent buttons, forms, dialogs, and feedback states

The charts were designed so that the user can move between teeth and findings without having to leave the patient profile.

---

# State Management

The frontend uses React state for local UI interactions and TanStack Query for server-side data.

This separates:

* Temporary UI state
* Selected tooth/surface state
* Form state
* Data fetched from the backend
* Saved patient and chart information

This also helps avoid keeping the complete application state inside a single large React component.

---

# Error Handling and Validation

Basic validation is handled on both the frontend and backend.

Examples include:

* Required patient fields
* Valid patient information
* Valid chart data
* Required tooth selection
* Valid surface selection
* Valid periodontal measurements

API errors are handled on the frontend and displayed to the user where appropriate.

---

# Known Limitations

This application was built as a technical assignment, so there are some limitations.

### Authentication

Authentication and authorization are not implemented because the assignment assumes a single dental organization.

### Clinical Scope

The dental and periodontal terminology has been simplified to keep the implementation focused on the requested functionality.

It should not be considered a production-ready clinical system.

### Tooth Diagram

The graphical tooth representation is designed for interaction and charting rather than being a detailed anatomical tooth model.

### Advanced Clinical Features

The application does not currently cover advanced features such as:

* Treatment planning
* Dental procedures history
* X-ray/image management
* Prescription management
* Clinical notes
* Multi-clinic support
* User roles and permissions
* Audit history

---

# Possible Future Improvements

If this application were extended beyond the assignment, I would consider adding:

* Authentication and role-based access
* Dentist and staff accounts
* Treatment planning
* Appointment management
* Clinical notes
* Dental image / X-ray uploads
* More detailed tooth anatomy
* More advanced periodontal charting
* Audit history for chart changes
* Search and filtering for patients
* Pagination for large patient lists
* Frontend automated tests
* Docker-based local setup
* Deployment configuration
* Better accessibility support

---

# Testing

The application can be tested manually using the following flow:

1. Open the patient list.
2. Create a new patient.
3. Verify that a Patient ID is generated.
4. Open the patient profile.
5. Add findings to the Dental Investigation Chart.
6. Select a tooth and add surface findings.
7. Enter periodontal/gingival findings.
8. Save the changes.
9. Refresh the page.
10. Reopen the patient.
11. Verify that the previously saved information is still available.
12. Edit an existing finding and verify the updated value.

The FastAPI Swagger documentation can also be used to test individual backend endpoints.

---

# Notes

This project was developed as a technical assignment for evaluating:

* React / frontend architecture
* REST API development
* FastAPI / Python
* MongoDB data persistence
* Dental domain understanding
* Interactive chart design
* Reusable components
* Data modeling
* UI/UX implementation

The application assumes a single dental organization and does not implement authentication because it was not required as part of the assignment.

---

# License

This project was created for technical evaluation purposes.