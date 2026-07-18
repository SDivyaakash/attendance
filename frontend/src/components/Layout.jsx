import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line bg-panel">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-full bg-ink flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-amber live-pulse" />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">RollCall</span>
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right leading-tight hidden sm:block">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-ink-soft font-mono uppercase tracking-wide">
                  {user.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-md border border-line hover:border-ink transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
