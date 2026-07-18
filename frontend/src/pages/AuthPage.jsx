import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../api";
import { useAuth } from "../AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "", roll_no: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/signup";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { ...form, role };
      const { data } = await api.post(path, payload);
      login(data.token, data.user);
      const pendingAttendUrl = localStorage.getItem("pendingAttendUrl");
      if (pendingAttendUrl && data.user.role === "student") {
        localStorage.removeItem("pendingAttendUrl");
        navigate(pendingAttendUrl);
      } else {
        navigate(data.user.role === "teacher" ? "/teacher" : "/student");
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-ink text-paper p-10">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-paper/10 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber live-pulse" />
          </span>
          <span className="font-display text-xl font-semibold">RollCall</span>
        </div>
        <div>
          <h1 className="font-display text-4xl leading-tight mb-4">
            Present means<br />present in the room.
          </h1>
          <p className="text-paper/70 max-w-sm leading-relaxed">
            Each class runs a QR code that rotates every few seconds and checks
            the scanner's location against the classroom. No proxy attendance,
            no shared screenshots — just a register that verifies itself.
          </p>
        </div>
        <div className="text-xs text-paper/40 font-mono">Built for college classrooms</div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex gap-1 mb-8 border border-line rounded-lg p-1 bg-panel">
            <button
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "login" ? "bg-ink text-paper" : "text-ink-soft"
              }`}
              onClick={() => setMode("login")}
            >
              Log in
            </button>
            <button
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "signup" ? "bg-ink text-paper" : "text-ink-soft"
              }`}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>

          <h2 className="font-display text-2xl font-semibold mb-6">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>

          {mode === "signup" && (
            <div className="flex gap-1 mb-5 border border-line rounded-lg p-1 bg-panel w-fit">
              {["student", "teacher"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-4 py-1.5 rounded-md text-sm capitalize transition-colors ${
                    role === r ? "bg-verified text-paper" : "text-ink-soft"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <Field label="Full name">
                <input
                  required
                  value={form.name}
                  onChange={update("name")}
                  className="input"
                  placeholder="Asha Rao"
                />
              </Field>
            )}
            {mode === "signup" && role === "student" && (
              <Field label="Roll number">
                <input
                  required
                  value={form.roll_no}
                  onChange={update("roll_no")}
                  className="input font-mono"
                  placeholder="CS2024031"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                required
                type="email"
                value={form.email}
                onChange={update("email")}
                className="input"
                placeholder="you@college.edu"
              />
            </Field>
            <Field label="Password">
              <input
                required
                type="password"
                minLength={6}
                value={form.password}
                onChange={update("password")}
                className="input"
                placeholder="••••••••"
              />
            </Field>

            {error && (
              <div className="text-sm text-alert bg-alert-soft rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-verified text-paper rounded-md py-2.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-soft mb-1.5">{label}</span>
      {children}
    </label>
  );
}
