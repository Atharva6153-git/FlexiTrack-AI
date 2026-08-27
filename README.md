<div align="center">

# 💪🩺 FlexiTrack AI 🎥✨

**AI-Powered Rehab, One Rep at a Time.** *Track it. Fix it. Recover better.* 🚀

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/>
  <img src="https://img.shields.io/badge/MediaPipe-0097A7?style=for-the-badge&logo=google&logoColor=white" alt="MediaPipe"/>
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render"/>
</p>

</div>

---

**AI-powered rehabilitation and physical therapy companion** — tracks joint angles and exercise repetitions in real time using computer vision, connects patients with a supervising therapist, and turns raw webcam movement into structured recovery data.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Roles: Patient vs Therapist](#roles-patient-vs-therapist)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)

---

## Overview

FlexiTrack AI is a full-stack MERN-style application built for physical rehabilitation tracking. A patient performs a prescribed exercise (e.g. Bicep Curl, Squat, Knee Extension) in front of their webcam. The app uses **MediaPipe Pose** to detect 33 body landmarks per frame, calculates joint angles in real time, counts repetitions, scores form accuracy, and saves the session. A supervising therapist reviews every patient's sessions in a dedicated portal and can leave feedback on mistakes and improvements — closing the loop between exercise and clinical guidance.

The app follows a **single-therapist model**: every patient who signs up is automatically visible to the one default therapist account, with no manual patient-adding step required.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                              BROWSER (Client)                        │
│                                                                        │
│   ┌─────────────┐   ┌──────────────┐   ┌───────────────────────┐    │
│   │  React SPA  │──▶│ Firebase Auth │  │   MediaPipe Pose (CDN) │    │
│   │  (Vite)     │   │  (Google +    │  │   loaded via <script>  │    │
│   │             │◀──│  Email/Pass)  │  │   window.Pose / Camera │    │
│   └──────┬──────┘   └──────────────┘   └───────────┬───────────┘    │
│          │                                          │                │
│          │              ┌───────────────────────────┘                │
│          │              │  getUserMedia() → video frames             │
│          │              ▼                                            │
│          │      ┌───────────────┐                                    │
│          │      │  PoseEngine   │  33 landmarks → joint angle math   │
│          │      │  .jsx         │  → rep counting → form scoring     │
│          │      └───────────────┘                                    │
└──────────┼─────────────────────────────────────────────────────────┘
           │  HTTPS (Axios)
           │  fetch(VITE_API_BASE_URL)
           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Node / Express)                    │
│                                                                        │
│   ┌─────────────┐     ┌──────────────┐     ┌────────────────────┐   │
│   │ patientRoutes│    │ sessionRoutes │    │  server.js (CORS,   │   │
│   │  /api/patients│   │ /api/sessions │    │  port 5000, entry)  │   │
│   └──────┬───────┘    └──────┬───────┘     └─────────────────────┘   │
│          │                    │                                       │
│          └──────────┬─────────┘                                       │
│                      ▼                                                │
│              ┌───────────────┐                                       │
│              │   Mongoose     │                                       │
│              │   Models       │                                       │
│              └───────┬───────┘                                       │
└──────────────────────┼────────────────────────────────────────────────┘
                        │
                        ▼
              ┌───────────────────┐
              │   MongoDB Atlas    │
              │   (flexitrack DB)  │
              │  - Patients        │
              │  - Sessions        │
              └────────────────────┘
```

**Auth flow:** Firebase issues the identity (`user.uid`), which becomes the app-level `patientId`. On first sign-in, a matching `Patient` document is created in MongoDB with the role picked at signup (`patient` or `therapist`). All app data (sessions, prescriptions, feedback) hangs off that same `patientId`.

---

## Tech Stack

**Frontend**
- React 18 + Vite 6
- Tailwind CSS v4 (`@tailwindcss/vite`)
- React Router v6
- Firebase Authentication (Google OAuth + Email/Password)
- MediaPipe Pose (via CDN globals — `window.Pose`, `window.Camera`, `window.drawConnectors`, `window.drawLandmarks`)
- Chart.js — analytics visualizations
- lucide-react — icons
- Axios — API calls

**Backend**
- Node.js + Express.js
- Mongoose (MongoDB ODM)
- MongoDB Atlas
- dotenv, cors

**Design System**
- Theme: *Modern Clinical Minimalist*
- Palette: porcelain background `#F8FAFC`, clinical white cards `#FFFFFF`, medical navy text `#0F172A`, teal accent `#0D9488`, emerald success `#10B981`
- Fonts: `Plus Jakarta Sans` (UI/headings), `JetBrains Mono` (live numerical HUD telemetry)

---

## Features

- 🎥 **Real-time pose tracking** — webcam feed analyzed live via MediaPipe, with skeleton overlay (landmarks + connectors) drawn on canvas
- 📐 **Joint angle calculation** — computed per-frame from 3-point landmark geometry (e.g. shoulder–elbow–wrist for bicep curl, hip–knee–ankle for squat/knee extension)
- 🔢 **Automatic rep counting** — tracks angle thresholds to detect completed repetitions
- ✅ **Form accuracy scoring** — calculated from how closely a patient's joint angle stays within the ideal range per rep, not hardcoded
- 🧪 **Demo/simulation mode** — camera-free rep simulation for testing without hardware access
- 📊 **Patient dashboard** — total sessions, current streak, average form accuracy, peak range of motion, 7-day trend chart
- 📈 **Progress history** — filterable by exercise type, with full session logs
- 🩺 **Therapist portal** — dropdown of all assigned patients, per-patient session reports, and a feedback form (mistakes / improvements) tied to each session
- 🔐 **Role-based access** — patients get full workout access; therapists get zero camera/workout access and see only clinical/review screens
- 🔑 **Firebase Authentication** — Google OAuth + email/password, with 24-hour auto-logout via a stored login timestamp
- 🛡️ **Protected routes** — unauthenticated users are redirected to `/login`; role-mismatched access is blocked and redirected

---

## How It Works

1. **Sign up** — patient or therapist selects their role during account creation. A Firebase user is created, and a matching `Patient` document is created in MongoDB (`patientId = user.uid`, `role`, `therapistId: "therapist_default"`).
2. **Patient logs in** → lands on `/dashboard` → sees assigned prescriptions and past-week analytics.
3. **Patient starts a session** (`/track`) → camera initializes → MediaPipe detects pose landmarks every frame → `PoseEngine.jsx` calculates the relevant joint angle → reps are counted as the angle crosses set thresholds → form accuracy is scored against the ideal range for that exercise.
4. **Session ends** → results (`totalReps`, `avgAngle`, `maxFlexionAngle`, `formAccuracyScore`, `durationSeconds`) are POSTed to `/api/sessions` and saved against the patient's ID.
5. **Therapist logs in** → lands on `/therapist` → sees every patient assigned to them in a dropdown (no manual adding needed — new signups appear automatically) → selects a patient → sees their session logs and can submit feedback (mistakes, improvements) on any session.
6. **Patient revisits `/history`** → sees their own analytics, session logs, and any feedback the therapist has left.

---

## Project Structure

```
FlexiTrack-AI/
├── backend/
│   ├── config/
│   │   └── db.js                # Mongoose connection handler
│   ├── models/
│   │   ├── Patient.js            # patientId, name, role, therapistId, prescriptions[]
│   │   └── Session.js            # patientId, exerciseType, reps, angles, formAccuracyScore, feedback
│   ├── routes/
│   │   ├── patientRoutes.js      # CRUD, prescriptions, compliance, therapist queries
│   │   └── sessionRoutes.js      # session create/fetch, stats aggregation, feedback
│   ├── server.js                 # Express entry point (port 5000)
│   └── .env                      # not committed — see .env.example
│
├── src/
│   ├── config/
│   │   └── firebase.js           # Firebase app init, auth + googleProvider export
│   ├── context/
│   │   └── AuthContext.jsx       # auth state, login/register/logout, role handling
│   ├── components/
│   │   ├── PoseEngine.jsx        # camera + MediaPipe + angle math + canvas overlay
│   │   └── ProtectedRoute.jsx / RoleProtectedRoute.jsx
│   ├── layouts/
│   │   └── RootLayout.jsx        # nav, role-aware links, user avatar/dropdown
│   ├── pages/
│   │   ├── Home.jsx              # public landing page
│   │   ├── Login.jsx             # sign in / sign up (with role selector)
│   │   ├── Dashboard.jsx         # patient overview
│   │   ├── TrackSession.jsx      # live tracking screen
│   │   ├── History.jsx           # progress analytics (role-split render)
│   │   └── TherapistPortal.jsx   # therapist clinical view
│   ├── App.jsx                   # route definitions
│   └── main.jsx                  # app entry, AuthProvider wrap
│
├── index.html                    # fonts + MediaPipe CDN scripts
├── vite.config.js
└── tailwind.config.js
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas cluster
- A Firebase project with Authentication enabled (Google + Email/Password providers)

### 1. Clone the repo
```bash
git clone https://github.com/Atharva6153-git/FlexiTrack-AI.git
cd FlexiTrack-AI
```

### 2. Install dependencies
```bash
# Frontend (project root)
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Set up environment variables
Create `backend/.env` (see [Environment Variables](#environment-variables) below).

### 4. Run the app
```bash
# Terminal 1 — backend
cd backend
npm start          # runs on http://localhost:5000

# Terminal 2 — frontend
npm run dev         # runs on http://localhost:5173
```

Visit `http://localhost:5173` and sign up as either a **Patient** or a **Therapist**.

---

## Environment Variables

**`backend/.env`**
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
CLIENT_URL=http://localhost:5173,https://flexi-track-ai.vercel.app
```

**Frontend (`.env` at project root)**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> Neither `.env` file is committed to the repo. Use `.env.example` as a template.

---

## API Reference

All endpoints are prefixed with the backend base URL (`http://localhost:5000` locally).

### Patients — `/api/patients`

| Method | Endpoint                              | Description                                              |
|--------|----------------------------------------|------------------------------------------------------------|
| POST   | `/api/patients`                        | Create a new patient/therapist record (called on signup)  |
| GET    | `/api/patients/therapist/:therapistId` | List all patients assigned to a therapist                 |
| GET    | `/api/patients/:patientId`             | Get a single patient's record                              |
| PATCH  | `/api/patients/:patientId/prescription`| Upsert an exercise prescription (type, target reps/sets)  |
| GET    | `/api/patients/:patientId/compliance`  | Weekly compliance status per prescribed exercise           |

### Sessions — `/api/sessions`

| Method | Endpoint                                        | Description                                             |
|--------|---------------------------------------------------|-----------------------------------------------------------|
| POST   | `/api/sessions`                                  | Save a completed workout session                          |
| GET    | `/api/sessions/patient/:patientId`               | Get all raw sessions for a patient                         |
| GET    | `/api/sessions/patient/:patientId/stats`         | Aggregated daily stats (avg angle, form score, reps, count)|
| PATCH  | `/api/sessions/:sessionId/feedback`              | Therapist submits mistakes/improvements on a session       |

**Example — save a session**
```http
POST /api/sessions
Content-Type: application/json

{
  "patientId": "ZEfyU1UhjkVdXrtwt6psYC5VM8L2",
  "exerciseType": "BICEP_CURL",
  "totalReps": 10,
  "targetReps": 10,
  "avgAngle": 78,
  "maxFlexionAngle": 142,
  "formAccuracyScore": 87,
  "durationSeconds": 94
}
```

---

## Roles: Patient vs Therapist

| Capability                          | Patient | Therapist |
|--------------------------------------|:-------:|:---------:|
| Dashboard (own analytics)            |   ✅    |     —     |
| Live Workout / camera access         |   ✅    |     ❌     |
| Progress History (own data)          |   ✅    |     —     |
| Therapist Portal                     |   ❌    |     ✅     |
| View all assigned patients           |   ❌    |     ✅     |
| Leave feedback on a session          |   ❌    |     ✅     |
| View feedback received               |   ✅    |     —     |

Every patient is auto-assigned to a single default therapist account on signup — no manual patient management step is required.

---

## Screenshots

*(Add screenshots here — Dashboard, Live Tracker with pose overlay, Progress History, Therapist Portal)*

---

## Roadmap

- [ ] Multi-therapist support (therapist assignment instead of a single default)
- [ ] Push/email notifications for missed prescriptions
- [ ] Exportable PDF progress reports
- [ ] Mobile-responsive camera tracking improvements
- [ ] Expanded exercise library beyond Bicep Curl / Squat / Knee Extension

---

## License

This project was built as a personal/academic portfolio project.