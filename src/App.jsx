import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  LayoutDashboard,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Search,
  Settings,
  ShieldCheck,
  User,
  UserPlus,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginUser, registerUser } from "./api";

const storageKey = "auth_dashboard_token";

const metrics = [
  { label: "Active sessions", value: "1,284", change: "+12.6%", icon: Activity, tone: "green" },
  { label: "Verified users", value: "842", change: "+8.2%", icon: ShieldCheck, tone: "blue" },
  { label: "Team members", value: "36", change: "+4.1%", icon: Users, tone: "amber" }
];

const activityRows = [
  { name: "Account verification", owner: "Security", status: "Complete", time: "2 min ago" },
  { name: "Profile sync", owner: "Workspace", status: "In review", time: "18 min ago" },
  { name: "Dashboard access", owner: "Auth API", status: "Healthy", time: "1 hr ago" }
];

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(storageKey));
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(token));
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    if (!token) {
      setIsCheckingSession(false);
      return;
    }

    let isMounted = true;

    getCurrentUser(token)
      .then((data) => {
        if (isMounted) {
          setUser(data.user);
          setSessionError("");
        }
      })
      .catch(() => {
        localStorage.removeItem(storageKey);
        if (isMounted) {
          setToken(null);
          setUser(null);
          setSessionError("Your session expired. Please sign in again.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  function handleAuthenticated(data) {
    localStorage.setItem(storageKey, data.token);
    setToken(data.token);
    setUser(data.user);
    setSessionError("");
  }

  function handleLogout() {
    localStorage.removeItem(storageKey);
    setToken(null);
    setUser(null);
  }

  if (isCheckingSession) {
    return (
      <main className="loading-screen">
        <div className="brand-mark">
          <ShieldCheck size={28} />
        </div>
        <p>Loading secure workspace...</p>
      </main>
    );
  }

  if (!token || !user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} sessionError={sessionError} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

function AuthScreen({ onAuthenticated, sessionError }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(sessionError);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistering = mode === "register";

  useEffect(() => {
    setError(sessionError);
  }, [sessionError]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const action = isRegistering ? registerUser : loginUser;
      const payload = isRegistering
        ? form
        : {
            email: form.email,
            password: form.password
          };
      const data = await action(payload);
      onAuthenticated(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Security overview">
        <div className="brand-row">
          <span className="brand-mark">
            <ShieldCheck size={25} />
          </span>
          <span>SecureDesk</span>
        </div>

        <div className="visual-panel">
          <div className="chart-header">
            <div>
              <span className="eyebrow">Workspace score</span>
              <strong>94%</strong>
            </div>
            <CheckCircle2 size={26} />
          </div>
          <div className="bar-stack" aria-hidden="true">
            <span style={{ height: "72%" }} />
            <span style={{ height: "48%" }} />
            <span style={{ height: "86%" }} />
            <span style={{ height: "62%" }} />
            <span style={{ height: "78%" }} />
          </div>
        </div>

        <div className="status-strip">
          <span>
            <Activity size={18} />
            Live API
          </span>
          <span>
            <ShieldCheck size={18} />
            JWT Auth
          </span>
          <span>
            <BarChart3 size={18} />
            Dashboard
          </span>
        </div>
      </section>

      <section className="auth-card" aria-label={isRegistering ? "Register form" : "Login form"}>
        <div className="mode-tabs" role="tablist" aria-label="Authentication mode">
          <button className={!isRegistering ? "active" : ""} type="button" onClick={() => setMode("login")}>
            <LogIn size={17} />
            Login
          </button>
          <button className={isRegistering ? "active" : ""} type="button" onClick={() => setMode("register")}>
            <UserPlus size={17} />
            Register
          </button>
        </div>

        <div className="form-heading">
          <span className="eyebrow">{isRegistering ? "Create access" : "Welcome back"}</span>
          <h1>{isRegistering ? "Register your account" : "Login to dashboard"}</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <label className="field">
              <span>Name</span>
              <div className="input-wrap">
                <User size={18} />
                <input name="name" type="text" value={form.name} onChange={updateField} placeholder="Karan Sharma" required />
              </div>
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <div className="input-wrap">
              <Mail size={18} />
              <input name="email" type="email" value={form.email} onChange={updateField} placeholder="karan@example.com" required />
            </div>
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input-wrap">
              <Lock size={18} />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={updateField}
                placeholder="Minimum 6 characters"
                minLength={6}
                required
              />
            </div>
          </label>

          {error && <p className="error-message">{error}</p>}

          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait" : isRegistering ? "Create account" : "Login"}
            <ArrowRight size={18} />
          </button>
        </form>
      </section>
    </main>
  );
}

function Dashboard({ user, onLogout }) {
  const joinedDate = useMemo(() => {
    if (!user.createdAt) {
      return "Today";
    }

    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(user.createdAt));
  }, [user.createdAt]);

  return (
    <main className="dashboard-shell">
      <aside className="sidebar" aria-label="Dashboard navigation">
        <div className="brand-row">
          <span className="brand-mark">
            <ShieldCheck size={24} />
          </span>
          <span>SecureDesk</span>
        </div>

        <nav className="nav-list" aria-label="Primary">
          <a className="active" href="#overview">
            <LayoutDashboard size={18} />
            Overview
          </a>
          <a href="#team">
            <Users size={18} />
            Users
          </a>
          <a href="#security">
            <ShieldCheck size={18} />
            Security
          </a>
          <a href="#settings">
            <Settings size={18} />
            Settings
          </a>
        </nav>

        <button className="logout-button" type="button" onClick={onLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <section className="dashboard-main">
        <header className="topbar">
          <div>
            <span className="eyebrow">Dashboard</span>
            <h1>Good to see you, {user.name.split(" ")[0]}</h1>
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <Search size={17} />
              <input type="search" placeholder="Search" />
            </label>
            <button className="icon-button" type="button" aria-label="Notifications" title="Notifications">
              <Bell size={19} />
            </button>
          </div>
        </header>

        <section className="profile-band">
          <div>
            <span className="eyebrow">Signed in as</span>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
          <div className="profile-meta">
            <span>Member since</span>
            <strong>{joinedDate}</strong>
          </div>
        </section>

        <section className="metrics-grid" aria-label="Key metrics">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article className="metric-card" data-tone={metric.tone} key={metric.label}>
                <span className="metric-icon">
                  <Icon size={22} />
                </span>
                <div>
                  <p>{metric.label}</p>
                  <strong>{metric.value}</strong>
                  <span>{metric.change}</span>
                </div>
              </article>
            );
          })}
        </section>

        <section className="work-grid">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Operations</span>
                <h2>Recent activity</h2>
              </div>
              <button className="text-button" type="button">
                View all
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="activity-list">
              {activityRows.map((row) => (
                <div className="activity-row" key={row.name}>
                  <div>
                    <strong>{row.name}</strong>
                    <span>{row.owner}</span>
                  </div>
                  <span className="status-pill">{row.status}</span>
                  <span>{row.time}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel performance-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Security</span>
                <h2>Access health</h2>
              </div>
              <CheckCircle2 size={24} />
            </div>
            <div className="radial-chart" aria-label="Access health score 94 percent">
              <span>94%</span>
            </div>
            <p>Authentication, database connectivity, and protected routes are ready for your workspace flow.</p>
          </article>
        </section>
      </section>
    </main>
  );
}
