# Patient Management & Dental Charting Application

It's a patient-management tool for a dental clinic. You can add a patient, open their profile, and record clinical findings using three charts instead of paper: a tooth-by-tooth condition chart, a tooth-surface chart for recording findings on specific areas of a tooth, and a complete gum-health examination chart.

Everything is saved to MongoDB through a FastAPI backend, so the data is still available even after refreshing or reopening the application.

The application includes three main dental charts:

* Dental Investigation Chart
* Tooth Surface Chart
* Gingival / Periodontal Examination Chart

The main focus of the implementation was the dental charting functionality, particularly making the charts simple to understand and easy to interact with while ensuring that all the recorded information is properly saved.

---

## 1. Project Overview

The application has two main parts:

* **Frontend:** React / Next.js
* **Backend:** FastAPI (Python)
* **Database:** MongoDB

### Main features

* View a list of patients
* Search and paginate patients
* Add a new patient
* Automatically generate a unique Patient ID
* View and edit patient information
* View a patient's dental charts
* Record and edit dental investigation findings
* Record findings for individual tooth surfaces
* Record gingival / periodontal measurements
* Save chart information to MongoDB
* Continue working with the same data after refreshing or reopening the application
* Responsive UI with reusable components
* Basic loading, validation and error handling

Authentication was not implemented because the assignment specifies that the application can be treated as operating under a single organization.

---

## 2. Technology Stack

### Frontend

* Next.js 14
* React 18
* TypeScript
* Mantine UI
* TanStack Query
* Axios
* Day.js

### Backend

* Python
* FastAPI
* Pydantic
* PyMongo (async MongoDB client)
* Uvicorn

### Database

* MongoDB
* MongoDB Atlas can be used, or MongoDB can be run locally

---

## 3. Project Structure

The project is divided into separate frontend and backend applications.

```text
dental-charting-system/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── validators/
│   │   ├── constants/
│   │   ├── middleware/
│   │   ├── core/
│   │   └── db/
│   ├── scripts/
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── features/
│   │   ├── services/
│   │   ├── constants/
│   │   └── hooks/
│   ├── package.json
│   └── .env.local.example
│
└── README.md
```

The backend is separated into routes, services and repositories so that the API layer does not contain all of the business logic.

On the frontend, the code is organized mainly by feature, with separate areas for patients, dental charts, surface charts and gingival charts.

---

## 4. Patient Management

### Patient List

The home page displays the patients belonging to the organization.

It includes:

* Patient name
* Patient ID
* Basic patient information
* Search
* Pagination
* Option to open the patient's profile
* Add Patient button

### Add Patient

A patient can be created using the Add Patient form.

The form includes basic information such as:

* First Name
* Last Name
* Date of Birth
* Gender
* Phone Number
* Email
* Address

The Patient ID is generated automatically by the backend, so the user does not need to enter it.

The generated format is:

```text
PAT-2026-00001
PAT-2026-00002
PAT-2026-00003
```

The ID generation is handled on the backend to avoid duplicate IDs when multiple requests happen at the same time.

### Patient Profile

Each patient has an individual profile page.

The profile contains:

* Patient information
* Edit patient details
* Dental Investigation Chart
* Tooth Surface Chart
* Gingival / Periodontal Chart

Patient information and chart information are stored in MongoDB.

---

# 5. Dental Investigation Chart

The dental investigation chart uses the **FDI tooth numbering system**.

Both permanent and primary teeth are supported.

The user can:

1. Select a tooth from the chart.
2. Open the finding panel.
3. Add or edit findings for that tooth.
4. Remove findings when required.
5. View the current state of the tooth directly on the chart.

Some of the supported findings include:

* Caries
* Missing
* Filled
* Crown
* Root Canal Treated
* Fractured
* Implant
* Extraction Required
* Healthy
* Other

Findings can also be marked as either:

* **Current Condition**
* **Treatment Required**

This makes it possible to distinguish between an existing condition and something that needs treatment.

The chart also provides a Permanent / Primary dentition switch.

---

# 6. Tooth Surface Chart

The surface chart allows findings to be recorded against individual surfaces of a tooth.

The user first selects a tooth and then selects the required surface or surfaces.

The supported surfaces are:

### Posterior teeth

* Mesial
* Distal
* Buccal
* Lingual
* Occlusal

### Anterior teeth

* Mesial
* Distal
* Labial
* Lingual
* Incisal

The application also validates the surface based on the type of tooth. For example, an anterior tooth cannot have an Occlusal surface selected.

Surface findings currently include:

* Caries
* Restoration
* Sealant
* Wear
* Fracture
* Healthy
* Other

The selected findings are saved in MongoDB and are loaded again when the patient is reopened.

For maxillary teeth, the Lingual surface is displayed as **Palatal** in the UI, while the backend stores it using the common `lingual` value.

---

# 7. Gingival / Periodontal Examination Chart

The gingival chart was the most domain-specific part of the assignment.

I used a spreadsheet-style chart so that measurements can be entered directly against the teeth.

For each tooth, the chart contains six measurement sites:

* Buccal - Mesial
* Buccal - Mid
* Buccal - Distal
* Lingual - Mesial
* Lingual - Mid
* Lingual - Distal

For each site, the following information can be recorded:

* Pocket Depth
* Gingival Margin
* Bleeding on Probing
* Plaque
* Suppuration

Additional information can be recorded at the tooth level:

* Mobility
* Furcation
* Notes

The chart currently focuses on permanent dentition.

### CAL calculation

Clinical Attachment Loss (CAL) is calculated automatically from Pocket Depth and Gingival Margin.

The formula used in the application is:

```text
CAL = Pocket Depth + Gingival Margin
```

CAL is calculated by the application and is not entered manually.

For example:

```text
Pocket Depth = 4 mm
Gingival Margin = 1 mm

CAL = 5 mm
```

The Gingival Margin value is treated as recession in this implementation. A positive value represents recession, while a negative value represents the gingival margin being coronal to the CEJ.

### Saving the chart

The periodontal chart uses a local draft while the user is editing multiple cells.

The user can make several changes and then click **Save** to save the chart.

If there are unsaved changes, the application also warns the user before leaving the page.

---

# 8. Data Persistence

All patient and chart information is stored through the FastAPI backend.

MongoDB contains separate collections for:

```text
patients
counters
dental_investigations
surface_findings
gingival_examinations
```

Each chart is associated with a patient using the Patient ID.

The application does not rely only on frontend state. After saving information, refreshing the browser or reopening the patient loads the saved information from the backend.

---

# 9. Prerequisites

The following are required to run the application locally:

* Python 3.11 or newer
* Node.js 18.17 or newer
* npm
* MongoDB 6.0+ or MongoDB Atlas
* Git
* A modern web browser

---

# 10. MongoDB Setup

The application can use either MongoDB Atlas or a local MongoDB installation.

### Option 1: MongoDB Atlas

Create a MongoDB Atlas cluster and obtain the connection string.

Then add it to:

```text
backend/.env
```

Example:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
DATABASE_NAME=dental_charting
```

No manual collection creation is required. The application creates the required collections and indexes when the backend starts.

### Option 2: Local MongoDB

If MongoDB is installed locally, the default configuration can be:

```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=dental_charting
```

Make sure MongoDB is running before starting the backend.

---

# 11. Backend Setup

From the project root:

```powershell
cd backend
```

Create a virtual environment:

```powershell
python -m venv venv
```

Activate it:

```powershell
venv\Scripts\Activate.ps1
```

Install the required packages:

```powershell
pip install -r requirements.txt
```

Create the environment file:

```powershell
Copy-Item .env.example .env
```

Update the MongoDB connection string in `.env`.

Then start the FastAPI server:

```powershell
uvicorn app.main:app --reload --port 8000
```

The backend will be available at:

```text
http://localhost:8000
```

FastAPI also provides Swagger API documentation at:

```text
http://localhost:8000/docs
```

Health check:

```text
http://localhost:8000/health
```

---

# 12. Frontend Setup

Open another terminal from the project root:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

If required, create the environment file:

```powershell
Copy-Item .env.local.example .env.local
```

The default API URL is:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

Start the frontend:

```powershell
npm run dev
```

The application will normally be available at:

```text
http://localhost:3000
```

---

# 13. Running the Application

After starting both the backend and frontend:

### Terminal 1

```powershell
cd backend
venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

### Terminal 2

```powershell
cd frontend
npm run dev
```

Then open:

```text
http://localhost:3000
```

A simple flow to test the application is:

1. Add a patient.
2. Open the patient profile.
3. Add a finding in the Dental Investigation Chart.
4. Add a finding in the Surface Chart.
5. Enter some measurements in the Gingival Chart.
6. Save the changes.
7. Refresh the browser.
8. Reopen the patient and verify that the information is still available.

---

# 14. API

The backend exposes REST APIs under:

```text
/api/v1
```

The main API areas are:

```text
/api/v1/patients
/api/v1/patients/{patient_id}/dental-chart
/api/v1/patients/{patient_id}/surface-chart
/api/v1/patients/{patient_id}/gingival-chart
```

FastAPI's Swagger UI can be used to view and test all available endpoints:

```text
http://localhost:8000/docs
```

---

# 15. Dental Domain Assumptions

Since I did not have previous dental-domain experience, I researched the terminology and charting approach and made a few practical assumptions for this assignment.

### Tooth numbering

The application uses the **FDI two-digit numbering system**.

Permanent teeth:

```text
11 - 18
21 - 28
31 - 38
41 - 48
```

Primary teeth:

```text
51 - 55
61 - 65
71 - 75
81 - 85
```

This provides a consistent way of identifying teeth in both the UI and database.

### Surface terminology

Anterior and posterior teeth do not use exactly the same terminology for all surfaces.

Therefore:

* Posterior teeth use Occlusal
* Anterior teeth use Incisal
* Posterior teeth use Buccal
* Anterior teeth use Labial
* Lingual is used as the stored value, with Palatal displayed where appropriate for upper teeth

### Periodontal chart

For the periodontal chart, I used six sites per tooth:

```text
Buccal:  Mesial / Mid / Distal
Lingual: Mesial / Mid / Distal
```

This is a simplified representation intended for this assignment rather than a complete clinical periodontal system.

---

# 16. Known Limitations

There are a few areas that could be improved if this were developed further.

* Authentication and authorization are not implemented.
* The application currently assumes a single organization.
* The gingival chart supports permanent teeth in the UI only.
* Only one finding can currently be stored per tooth surface.
* There is no chart history or comparison between different examination dates.
* The periodontal chart currently uses a simplified six-site model.
* There is no conflict handling if two users edit the same chart at the same time.
* Automated frontend and integration tests could be added.
* The application is not intended for real clinical use.

These limitations were kept within the scope of the assignment so that more attention could be given to the main dental chart interactions.

---

# 17. Future Improvements

If I had more time to continue developing the application, I would consider adding:

* User authentication and role-based access
* Support for multiple dental organizations
* Examination history and comparison between visits
* Primary dentition support in the periodontal chart
* Multiple findings on the same tooth surface
* Autosave for periodontal chart changes
* Better conflict handling for simultaneous editing
* PDF / printable dental chart export
* Image and radiograph attachments
* More comprehensive automated tests
* Accessibility testing and improvements
* More detailed treatment planning functionality

---

## 18. Notes

This project was developed as a technical assignment to demonstrate frontend, backend, database and domain-understanding skills.

The dental models and chart interactions are simplified representations created for the purpose of the assignment and should not be considered a clinical system.
