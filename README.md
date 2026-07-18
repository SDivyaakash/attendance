# RollCall — QR + Location Attendance

A web app for taking classroom attendance by QR code. Each teacher runs a
session per class; the QR code **rotates every 12 seconds** and each scan is
**checked against the classroom's GPS location**, so a screenshot or a code
shared from outside the room won't mark anyone present. Anyone not scanned in
by the time the teacher ends the session is automatically marked absent.

## How it works

1. A teacher creates a **subject** and gets a join code to share with students.
2. Students enter the join code once to enroll.
3. When class starts, the teacher stands in the room, taps **"Use my current
   location"**, sets an allowed radius (e.g. 40m), and starts the session.
   This displays a QR code that automatically refreshes every 12 seconds.
4. Students open the app (or just scan with their phone's normal camera —
   the QR encodes a link) and tap **"Scan attendance QR"**. The app grabs
   their GPS location and sends it with the scanned code.
5. The server marks them **present** only if:
   - the QR token is still within its rotation window (not stale/replayed),
   - their device's location is within the allowed radius of the classroom,
   - they're enrolled in the subject, and
   - they haven't already been marked for that session.
6. When the teacher ends the session, everyone enrolled who didn't scan in
   is automatically marked **absent**.

## Tech stack

- **Backend**: Node.js + Express, SQLite (via `better-sqlite3`), JWT auth
- **Frontend**: React (Vite), Tailwind CSS, `qrcode.react` (QR generation),
  `html5-qrcode` (in-app camera scanning)

## Running it locally

You'll need [Node.js](https://nodejs.org) 18+ installed.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # optionally edit JWT_SECRET
npm start
```

This runs the API on `http://localhost:4000` and creates a local
`attendance.db` SQLite file (created automatically, no separate DB setup
needed).

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

This runs the app on `http://localhost:5173` and proxies API calls to the
backend automatically (see `vite.config.js`).

Open `http://localhost:5173` in your browser, sign up as a **teacher** in one
browser/tab and a **student** in another (or use incognito for the second),
and try the flow.

### Testing the location check locally

Since you'll likely be testing from one laptop, your browser's geolocation
for both the "teacher" tab and "student" tab will report roughly the same
real-world location — so attendance should mark as present. To test the
*rejection* path, you can spoof your browser's location in DevTools
(Chrome: DevTools → ⋮ → More tools → Sensors → Location) to a location far
from where you started the session.

## Deploying for real use

For actual classroom use you'll want to:

- Host the backend somewhere persistent (Render, Railway, Fly.io, a college
  server, etc.) and point the frontend's API calls at that URL instead of
  the local proxy.
- Serve the frontend as a static build (`npm run build` in `frontend/`,
  then deploy the `dist/` folder — e.g. Vercel, Netlify, or the same host
  as the backend).
- Use HTTPS in production — browsers require a secure origin for
  geolocation and camera access outside of `localhost`.
- Swap the SQLite file for a hosted Postgres/MySQL database if you expect
  concurrent writes at scale (SQLite is fine for a single class/department;
  for a whole college with many simultaneous sessions, a real DB server is
  safer).
- Set a strong, random `JWT_SECRET` in `backend/.env`.

## Project structure

```
attendance-app/
  backend/
    src/
      server.js          Express app entry point
      db.js               SQLite schema + connection
      middleware/auth.js  JWT auth + role guard
      utils/qr.js         Rotating token generation/verification
      utils/geo.js        Haversine distance calculation
      routes/auth.js      Signup / login
      routes/teacher.js   Subjects, sessions, QR token, live view, reports
      routes/student.js   Enroll, mark attendance, attendance history
  frontend/
    src/
      pages/              One file per screen (teacher + student flows)
      components/         Shared Layout, ProtectedRoute, QrScanner
      AuthContext.jsx      Logged-in user state
      api.js               Axios client with auth header
```

## Notes on the anti-cheating design

- **Rotating QR** defeats the classic "student photographs the QR and
  sends it to a friend at home" trick — by the time the photo is shared,
  the code is likely expired.
- **Geolocation radius check** defeats the "I have the current code but
  I'm not actually there" case — even a fresh, valid code is rejected if
  the scanning device isn't near the classroom's stored coordinates.
- Neither check is unbeatable on its own (GPS can be spoofed by a
  determined user, and radius must be set loosely enough to tolerate normal
  GPS drift indoors), but together they raise the effort required well
  beyond casual proxy attendance. If your college needs stronger
  guarantees, consider pairing this with instructor spot-checks.
