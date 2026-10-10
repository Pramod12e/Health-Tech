# Health Tech


A telehealth platform for underserved rural areas. It connects patients with doctors and pharmacies, and is designed for weak-connectivity conditions.

**Stack:** MongoDB, Express, React, Node.js (MERN)

---

## 1. Problem

- Rural hospitals often run at less than half their required doctor strength.
- Patients travel far and often find the specialist or medicine unavailable.
- Rural internet is limited, so most digital health tools do not work for them.

## 2. What the platform does

| Role | What they can do |
|---|---|
| **Patient** | Sign up, search doctors and pharmacies (name, specialty, medicine, location), use the symptom checker, book consultations, join video calls, view prescriptions and history |
| **Doctor** | Manage profile and availability, confirm or cancel bookings, start and end video calls, write prescriptions |
| **Pharmacy** | Manage profile and live medicine stock, appear in patient search and "Near Me" results |

## 3. Features built

- Role-based auth (patient, doctor, pharmacy) with Passport.js sessions
- Profile create, view, edit and delete for all 3 roles, with GPS location capture
- Doctor and pharmacy listings with:
  - Search by name, specialty, hospital, area and medicine
  - Fuzzy search fallback for spelling mistakes (Fuse.js)
  - "Near Me" filter using MongoDB geospatial queries (GPS or saved profile location)
- Consultation lifecycle: `pending → confirmed → ongoing → completed / cancelled`
- Doctor availability flips to false during a call and back to true after it
- Prescription writing by doctor, visible to patient
- WebRTC video call (Zoom-style layout, mute, camera toggle, fullscreen)
- Real-time incoming-call ring for the patient (Socket.io)
- Symptom checker with a rule-based emergency override
- Multilingual UI with i18next (English and Hindi)
- Offline queue with IndexedDB and auto-sync when the connection returns
- Sync status indicator in the navbar

## 4. Tech stack

**Frontend:** React (Vite), Material UI, React Router, Axios, i18next, idb (IndexedDB), socket.io-client, react-toastify

**Backend:** Node.js, Express, Mongoose, Passport (local) with passport-local-mongoose, express-session, Socket.io, Fuse.js, cors

**Database:** MongoDB with 2dsphere geospatial indexes

**Real-time:** WebRTC (peer-to-peer media) and Socket.io (signaling and call notifications)

## 5. Project structure

```
Health Tech/
├── backend/
│   ├── app.js              # server, routes, socket setup
│   ├── middleware.js       # isLoggedIn
│   ├── models/
│   │   ├── user.js
│   │   ├── patient.js
│   │   ├── doctor.js
│   │   ├── pharmacy.js
│   │   └── consultation.js
│   └── .env                # SECRET=...
└── frontend/
    └── src/
        ├── api/            # axiosClient, profileApi, consultationApi, symptomApi
        ├── components/     # Navbar, Footer, DoctorCard, PharmacyCard,
        │                   # BookingModal, ProtectedRoute,
        │                   # LanguageSwitcher, SyncIndicator
        ├── context/        # AuthContext, CallContext
        ├── i18n/           # index.js, locales/en.json, locales/hi.json
        ├── offline/        # db.js (IndexedDB), syncManager.js
        └── pages/          # Home, Login, Signup, CreateProfile, ProfileView,
                            # ProfileEdit, DoctorListing, DoctorDetail,
                            # PharmacyListing, PharmacyDetail, ManageMedicine,
                            # SymptomChecker, MyConsultations,
                            # MyAppointments, VideoCall
```

## 6. Setup

**Requirements:** Node.js, MongoDB running locally

**Backend**
```bash
cd backend
npm install
# create .env with:  SECRET=anylongrandomstring
node app.js          # runs on http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev          # runs on http://localhost:5173
```

The database URL is `mongodb://127.0.0.1:27017/Health-Tech` (set in `app.js`). CORS expects the frontend at `http://localhost:5173`.

## 7. API routes

**Auth**
- `POST /signup`, `POST /login`, `GET /logout`, `GET /current-user`

**Doctors and pharmacies (public)**
- `GET /doctors?search=`, `GET /doctors/nearby?lng=&lat=&maxDistance=&search=`, `GET /doctors/:id`
- `GET /pharmacies?search=`, `GET /pharmacies/nearby?...`, `GET /pharmacies/:id`
- `/nearby` routes must stay above `/:id` routes in `app.js`.

**Profile (per role: `doctor`, `patient`, `pharmacy`)**
- `GET | POST | PUT | DELETE /<role>/profile`
- DELETE also removes the User account.

**Consultations**
- `POST /consultations` (patient books)
- `GET /patient/consultations`, `GET /doctor/consultations`
- `PUT /consultations/:id/status` (confirm, cancel, complete)
- `POST /consultations/:id/start-call`, `POST /consultations/:id/end-call`
- `PUT /consultations/:id/prescription`

**Symptom checker**
- `POST /symptom-check`

**Socket events**
- `register-user`, `join-room`, `offer`, `answer`, `ice-candidate`, `leave-room`
- `incoming-call` (server to patient)

## 8. Key flows

**Booking and call**
1. Patient runs the symptom checker, then picks a doctor. Symptoms are pre-filled in the booking form.
2. The doctor confirms the booking.
3. The doctor clicks Start Call. The backend creates a `roomId`, sets the status to `ongoing`, and sets `isAvailableNow = false`.
4. The patient's phone rings (Socket.io `incoming-call`). On accept, both join the same room over WebRTC.
5. The doctor ends the call. The status becomes `completed` and the doctor becomes available again.

**Offline queue**
1. A request fails while `navigator.onLine` is false.
2. It is saved in IndexedDB (`pendingRequests`).
3. When the browser fires `online`, queued requests are sent. Each one is deleted only after the server confirms it.

## 9. Known limitations (honest status)

- **Symptom checker:** rule-based mock. The emergency keyword override works, but the real AI model is not connected.
- **Offline sync:** implemented for symptom check and booking only. It uses the `online` event, not a Service Worker, so it does not sync with the tab closed.
- **Multilingual:** only the navbar and home page are translated, in English and Hindi.
- **Video call:** STUN only, no TURN server, so it can fail on strict networks. Limited to 2 people per room.
- **Double booking:** the same slot is not blocked yet.
- **Sessions:** stored in memory (default store), so they reset when the server restarts. `connect-mongo` is imported but not wired in.
- **Hard-coded URLs:** `localhost:5000` and `localhost:5173` should move to environment variables before deployment.
- **Pharmacy and doctor "Near Me":** profiles without saved coordinates do not appear in nearby results.

## 10. Future work

- Connect the real AI symptom model and keep the emergency rule override after it
- Service Worker with the Background Sync API; extend the offline queue to profile and stock updates
- Translate every page and add more languages (Odia, Bengali, Telugu, Tamil)
- TURN server or a managed video service for production
- Slot locking to prevent double booking
- MongoDB session store, input validation, and rate limiting
- Impact dashboard (completed vs cancelled consultations, trips saved)
- Deployment: MongoDB Atlas, Render or Railway for backend, Vercel or Netlify for frontend

## 11. Team

- **Pramod:** backend, database, auth, search, consultations, WebRTC, offline sync, i18n
- **Tusar:** AI symptom checker model
- **Pratik and Rohan:** frontend (history and symptom checker UI)
