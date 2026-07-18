import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import api, { apiErrorMessage } from "../api";

export default function TeacherSubject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [radius, setRadius] = useState(40);
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState("");
  const [locating, setLocating] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const [subjRes, studentsRes, sessionsRes] = await Promise.all([
      api.get("/teacher/subjects"),
      api.get(`/teacher/subjects/${id}/students`),
      api.get(`/teacher/subjects/${id}/sessions`),
    ]);
    setSubject(subjRes.data.find((s) => String(s.id) === id));
    setStudents(studentsRes.data);
    setSessions(sessionsRes.data);
  }

  useEffect(() => {
    load();
  }, [id]);

  function useCurrentLocation() {
    setLocError("");
    setLocating(true);
    if (!navigator.geolocation) {
      setLocError("Geolocation isn't supported on this device/browser.");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocError(err.message || "Couldn't get your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function startSession(e) {
    e.preventDefault();
    setError("");
    if (!location) {
      setError("Set the classroom location first — tap 'Use my current location' while you're in the room.");
      return;
    }
    setStarting(true);
    try {
      const { data } = await api.post("/teacher/sessions", {
        subject_id: Number(id),
        latitude: location.latitude,
        longitude: location.longitude,
        radius_meters: Number(radius),
      });
      navigate(`/teacher/sessions/${data.id}`);
    } catch (err) {
      setError(apiErrorMessage(err));
      setStarting(false);
    }
  }

  const activeSession = sessions.find((s) => s.status === "active");

  if (!subject) return <Layout><div className="text-ink-soft text-sm">Loading…</div></Layout>;

  return (
    <Layout>
      <Link to="/teacher" className="text-sm text-ink-soft hover:text-ink">← All subjects</Link>
      <div className="mt-3 mb-8 flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="font-display text-3xl font-semibold">{subject.name}</h1>
        <div className="text-sm text-ink-soft font-mono">
          Join code <span className="text-ink font-semibold">{subject.code}</span>
        </div>
      </div>

      {activeSession ? (
        <div className="card p-5 mb-8 flex items-center justify-between bg-amber-soft border-amber/30">
          <div>
            <div className="flex items-center gap-2 text-amber font-medium text-sm mb-1">
              <span className="w-2 h-2 rounded-full bg-amber live-pulse" /> SESSION LIVE
            </div>
            <div className="text-ink-soft text-sm">A class session is currently running.</div>
          </div>
          <Link
            to={`/teacher/sessions/${activeSession.id}`}
            className="bg-ink text-paper rounded-md px-4 py-2 text-sm font-medium"
          >
            Open live QR →
          </Link>
        </div>
      ) : (
        <div className="card p-5 mb-8">
          <h2 className="font-medium mb-4">Start a class session</h2>
          <form onSubmit={startSession} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={useCurrentLocation}
                className="border border-line rounded-md px-3 py-2 text-sm hover:border-ink transition-colors"
              >
                {locating ? "Locating…" : "📍 Use my current location"}
              </button>
              {location && (
                <span className="text-xs text-verified font-mono">
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} captured
                </span>
              )}
            </div>
            {locError && <div className="text-sm text-alert">{locError}</div>}

            <label className="block max-w-xs">
              <span className="block text-sm font-medium text-ink-soft mb-1.5">
                Allowed radius (meters)
              </span>
              <input
                type="number"
                min="10"
                max="500"
                className="input"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              />
            </label>

            {error && <div className="text-sm text-alert">{error}</div>}

            <button
              disabled={starting}
              className="bg-verified text-paper rounded-md px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              {starting ? "Starting…" : "Start session & show QR"}
            </button>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-medium text-ink-soft mb-3 uppercase tracking-wide">
            Enrolled students ({students.length})
          </h2>
          {students.length === 0 ? (
            <div className="card p-4 text-sm text-ink-soft">
              No students yet. Share the join code <span className="font-mono text-ink">{subject.code}</span> for them to enroll.
            </div>
          ) : (
            <div className="card divide-y divide-line">
              {students.map((s) => (
                <div key={s.id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <span>{s.name}</span>
                  <span className="font-mono text-ink-soft">{s.roll_no}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-medium text-ink-soft mb-3 uppercase tracking-wide">
            Past sessions
          </h2>
          {sessions.filter((s) => s.status === "ended").length === 0 ? (
            <div className="card p-4 text-sm text-ink-soft">No sessions run yet.</div>
          ) : (
            <div className="space-y-2">
              {sessions
                .filter((s) => s.status === "ended")
                .map((s) => (
                  <Link
                    to={`/teacher/sessions/${s.id}/report`}
                    key={s.id}
                    className="card p-3 flex items-center justify-between text-sm hover:border-ink transition-colors block"
                  >
                    <span className="text-ink-soft">{new Date(s.started_at + "Z").toLocaleString()}</span>
                    <span className="font-mono">
                      <span className="text-verified">{s.present_count} in</span>
                      {" · "}
                      <span className="text-alert">{s.absent_count} out</span>
                    </span>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
