import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, TrendingUp, LockKeyhole, AlertTriangle, ArrowRight, LogOut, History, Cpu, X, Check } from "lucide-react";

const API = "https://loan-radar-v1.onrender.com";
const T = { ink: "#0B0F14", panel: "#121820", panel2: "#1A222C", border: "#232C38", text: "#E8EDF2", muted: "#8593A3", gold: "#E8A33D", danger: "#E5484D", safe: "#3DD68C" };

// ---- animated arc gauge (signature element) ----
function Gauge({ value, size = 220, label, sub }) {
  const r = size / 2 - 18, c = Math.PI * r; // half-circumference for semicircle
  const [dash, setDash] = useState(c);
  useEffect(() => { const t = setTimeout(() => setDash(c - (value / 100) * c), 80); return () => clearTimeout(t); }, [value, c]);
  const color = value < 30 ? T.safe : value < 60 ? T.gold : T.danger;
  return (
    <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
      <path d={`M18,${size / 2} A${r},${r} 0 0 1 ${size - 18},${size / 2}`} fill="none" stroke={T.border} strokeWidth="14" strokeLinecap="round" />
      <path d={`M18,${size / 2} A${r},${r} 0 0 1 ${size - 18},${size / 2}`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={dash} style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1), stroke 1.1s" }} />
      <text x={size / 2} y={size / 2 - 6} textAnchor="middle" fontSize="30" fontWeight="700" fill={T.text} fontFamily="ui-monospace,monospace">{value}%</text>
      <text x={size / 2} y={size / 2 + 16} textAnchor="middle" fontSize="11" fill={T.muted} letterSpacing="1">{label}</text>
      {sub && <text x={size / 2} y={size / 2 + 32} textAnchor="middle" fontSize="10" fill={T.muted}>{sub}</text>}
    </svg>
  );
}

function DemoGauge() {
  const [v, setV] = useState(18);
  useEffect(() => { const iv = setInterval(() => setV((x) => (x >= 62 ? 12 : x + 5)), 1400); return () => clearInterval(iv); }, []);
  return <Gauge value={v} label="SAMPLE DEFAULT RISK" sub="live model demo · synthetic data" />;
}

// ---- reusable field ----
function Field({ label, hint, error, children }) {
  return (
    <label className="block mb-4">
      <span className="text-xs tracking-wide" style={{ color: T.muted }}>{label}</span>
      {children}
      {hint && !error && <span className="block text-[11px] mt-1" style={{ color: T.muted }}>{hint}</span>}
      {error && <span className="block text-[11px] mt-1" style={{ color: T.danger }}>{error}</span>}
    </label>
  );
}
const inputCls = "mt-1 w-full rounded-md px-3 py-2 text-sm outline-none border transition-colors";
const inputStyle = { background: T.panel2, borderColor: T.border, color: T.text };

const FIELDS = [
  { k: "RevolvingUtilizationOfUnsecuredLines", label: "Credit line utilization", hint: "Balance ÷ credit limit, as a ratio (0–1)", min: 0, max: 1, step: 0.01 },
  { k: "age", label: "Age", hint: "18–100", min: 18, max: 100, step: 1 },
  { k: "NumberOfTime30_59DaysPastDueNotWorse", label: "Late payments, 30–59 days", hint: "Count in the last 2 years", min: 0, step: 1 },
  { k: "DebtRatio", label: "Debt ratio", hint: "Monthly debt payments ÷ income", min: 0, step: 0.01 },
  { k: "MonthlyIncome", label: "Monthly income", hint: "Optional — leave blank if unknown", min: 0, step: 1, optional: true },
  { k: "NumberOfOpenCreditLinesAndLoans", label: "Open credit lines & loans", min: 0, step: 1 },
  { k: "NumberOfTimes90DaysLate", label: "Late payments, 90+ days", min: 0, step: 1 },
  { k: "NumberRealEstateLoansOrLines", label: "Real-estate loans / lines", min: 0, step: 1 },
  { k: "NumberOfTime60_89DaysPastDueNotWorse", label: "Late payments, 60–89 days", min: 0, step: 1 },
  { k: "NumberOfDependents", label: "Dependents", hint: "Optional — leave blank if unknown", min: 0, step: 1, optional: true },
];

export default function App() {
  const [view, setView] = useState("home"); // home | login | register | predict | history
  const [auth, setAuth] = useState(null); // {token, email}
  const [pendingIntent, setPendingIntent] = useState(null); // where to go after auth
  const [toast, setToast] = useState(null);

  function notify(msg, kind = "info") { setToast({ msg, kind }); setTimeout(() => setToast(null), 3200); }

  function requireAuth(dest) {
    if (auth) setView(dest);
    else { setPendingIntent(dest); setView("login"); }
  }

  function onAuthed(token, email) {
    setAuth({ token, email });
    notify(`Welcome, ${email}`, "success");
    setView(pendingIntent || "predict");
    setPendingIntent(null);
  }

  function logout() { setAuth(null); setView("home"); notify("Signed out"); }

  return (
    <div className="min-h-screen w-full" style={{ background: T.ink, color: T.text, fontFamily: "Inter,system-ui,sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px);} to {opacity:1; transform:translateY(0);} }
        .fade-up { animation: fadeUp .5s ease both; }
        input:focus, select:focus { border-color: ${T.gold} !important; }
        ::selection { background: ${T.gold}; color: #0B0F14; }
      `}</style>

      {/* nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: T.border }}>
        <button onClick={() => setView("home")} className="flex items-center gap-2">
          <Cpu size={18} color={T.gold} />
          <span className="font-mono font-bold tracking-[0.15em] text-sm">LOAN RADAR</span>
        </button>
        <div className="flex items-center gap-3 text-sm">
          {auth ? (
            <>
              <button onClick={() => setView("predict")} className="px-3 py-1.5 rounded-md hover:bg-white/5" style={{ color: T.muted }}>Assess</button>
              <button onClick={() => setView("history")} className="px-3 py-1.5 rounded-md hover:bg-white/5 flex items-center gap-1" style={{ color: T.muted }}><History size={14} />History</button>
              <button onClick={logout} className="px-3 py-1.5 rounded-md flex items-center gap-1" style={{ color: T.danger }}><LogOut size={14} />{auth.email}</button>
            </>
          ) : (
            <>
              <button onClick={() => setView("login")} className="px-3 py-1.5" style={{ color: T.muted }}>Log in</button>
              <button onClick={() => setView("register")} className="px-3 py-1.5 rounded-md font-medium" style={{ background: T.gold, color: T.ink }}>Sign up</button>
            </>
          )}
        </div>
      </nav>

      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-md text-sm fade-up flex items-center gap-2 border"
          style={{ background: T.panel, borderColor: toast.kind === "error" ? T.danger : T.border, color: T.text }}>
          {toast.kind === "success" ? <Check size={14} color={T.safe} /> : toast.kind === "error" ? <X size={14} color={T.danger} /> : null}
          {toast.msg}
        </div>
      )}

      {view === "home" && <Home onAssess={() => requireAuth("predict")} />}
      {view === "login" && <AuthForm mode="login" onDone={onAuthed} switchTo={() => setView("register")} notify={notify} />}
      {view === "register" && <AuthForm mode="register" onDone={onAuthed} switchTo={() => setView("login")} notify={notify} />}
      {view === "predict" && (auth ? <Predict token={auth.token} notify={notify} /> : <AuthForm mode="login" onDone={onAuthed} switchTo={() => setView("register")} notify={notify} />)}
      {view === "history" && (auth ? <HistoryView token={auth.token} notify={notify} /> : <AuthForm mode="login" onDone={onAuthed} switchTo={() => setView("register")} notify={notify} />)}
    </div>
  );
}

function Home({ onAssess }) {
  return (
    <div>
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="fade-up">
          <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wide px-2.5 py-1 rounded-full border" style={{ borderColor: T.border, color: T.gold }}>
            <TrendingUp size={12} /> GRADIENT-BOOSTED CREDIT MODEL
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-5 leading-tight">Know the risk<br />before you sign.</h1>
          <p className="mt-4 text-base leading-relaxed" style={{ color: T.muted }}>
            Loan Radar scores loan-default probability from applicant financials using a model trained on historical lending outcomes. Get an evidence-based estimate in seconds.
          </p>
          <button onClick={onAssess} className="mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-md font-medium" style={{ background: T.gold, color: T.ink }}>
            Assess a loan <ArrowRight size={16} />
          </button>
          <div className="mt-5 flex items-start gap-2 text-xs p-3 rounded-md border" style={{ borderColor: T.border, color: T.muted }}>
            <AlertTriangle size={14} className="shrink-0 mt-0.5" color={T.gold} />
            This tool produces a statistical estimate, not a lending decision or financial advice. Accuracy depends entirely on entering real, accurate applicant figures — invented values return meaningless results.
          </div>
        </div>
        <div className="flex justify-center fade-up">
          <div className="rounded-xl border p-8" style={{ background: T.panel, borderColor: T.border }}>
            <DemoGauge />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20 grid sm:grid-cols-3 gap-5">
        {[
          { n: "01", t: "Enter applicant data", d: "Ten financial fields — utilization, income, delinquency history.", i: <ShieldCheck size={18} color={T.gold} /> },
          { n: "02", t: "Model scores the case", d: "A classifier trained on historical defaults returns a probability.", i: <Cpu size={18} color={T.gold} /> },
          { n: "03", t: "Read the estimate", d: "See the predicted outcome and confidence, saved to your history.", i: <TrendingUp size={18} color={T.gold} /> },
        ].map((s) => (
          <div key={s.n} className="rounded-lg border p-5" style={{ background: T.panel, borderColor: T.border }}>
            <div className="flex items-center justify-between mb-3">{s.i}<span className="font-mono text-xs" style={{ color: T.muted }}>{s.n}</span></div>
            <h3 className="font-semibold text-sm">{s.t}</h3>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: T.muted }}>{s.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function AuthForm({ mode, onDone, switchTo, notify }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true);
    try {
      let res;
      if (mode === "register") {
        res = await fetch(`${API}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      } else {
        const form = new URLSearchParams(); form.set("username", email); form.set("password", password);
        res = await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Something went wrong");
      onDone(data.access_token, email);
    } catch (err) { notify(err.message, "error"); } finally { setBusy(false); }
  }
  return (
    <div className="max-w-sm mx-auto px-6 py-20 fade-up">
      <div className="flex items-center gap-2 mb-1"><LockKeyhole size={16} color={T.gold} /><h2 className="text-lg font-semibold">{mode === "login" ? "Log in" : "Create account"}</h2></div>
      <p className="text-xs mb-6" style={{ color: T.muted }}>{mode === "login" ? "Sign in to run an assessment." : "Sign up to start assessing loans."}</p>
      <form onSubmit={submit}>
        <Field label="Email"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} style={inputStyle} /></Field>
        <Field label="Password" hint={mode === "register" ? "At least 8 characters" : undefined}>
          <input required minLength={mode === "register" ? 8 : undefined} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} style={inputStyle} />
        </Field>
        <button disabled={busy} className="w-full mt-2 py-2.5 rounded-md font-medium disabled:opacity-50" style={{ background: T.gold, color: T.ink }}>
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>
      <button onClick={switchTo} className="text-xs mt-4" style={{ color: T.muted }}>
        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
        <span style={{ color: T.gold }}>{mode === "login" ? "Sign up" : "Log in"}</span>
      </button>
    </div>
  );
}

function Predict({ token, notify }) {
  const initial = Object.fromEntries(FIELDS.map((f) => [f.k, ""]));
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function validate() {
    const errs = {};
    for (const f of FIELDS) {
      const raw = form[f.k];
      if (raw === "" || raw === null) { if (!f.optional) errs[f.k] = "Required"; continue; }
      const num = Number(raw);
      if (Number.isNaN(num)) errs[f.k] = "Must be a number";
      else if (f.min !== undefined && num < f.min) errs[f.k] = `Must be ≥ ${f.min}`;
      else if (f.max !== undefined && num > f.max) errs[f.k] = `Must be ≤ ${f.max}`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate()) { notify("Check the highlighted fields", "error"); return; }
    setBusy(true); setResult(null);
    const payload = Object.fromEntries(FIELDS.map((f) => [f.k, form[f.k] === "" ? null : Number(form[f.k])]));
    try {
      const res = await fetch(`${API}/predict`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Prediction failed");
      setResult(data);
    } catch (err) { notify(err.message, "error"); } finally { setBusy(false); }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 grid md:grid-cols-[1.3fr_1fr] gap-10">
      <div className="fade-up">
        <h2 className="text-xl font-semibold mb-1">Applicant details</h2>
        <p className="text-xs mb-5" style={{ color: T.muted }}>Use real figures — the model can't distinguish accurate input from guesses, and inaccurate values produce a meaningless score.</p>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-x-4">
          {FIELDS.map((f) => (
            <Field key={f.k} label={f.label} hint={f.hint} error={errors[f.k]}>
              <input type="number" step={f.step} value={form[f.k]} onChange={(e) => update(f.k, e.target.value)}
                className={inputCls} style={{ ...inputStyle, borderColor: errors[f.k] ? T.danger : T.border }} placeholder={f.optional ? "optional" : ""} />
            </Field>
          ))}
          <button disabled={busy} className="sm:col-span-2 mt-2 py-2.5 rounded-md font-medium disabled:opacity-50" style={{ background: T.gold, color: T.ink }}>
            {busy ? "Scoring…" : "Run assessment"}
          </button>
        </form>
      </div>
      <div className="fade-up">
        <div className="rounded-xl border p-6 sticky top-6" style={{ background: T.panel, borderColor: T.border }}>
          <h3 className="text-sm font-semibold mb-4">Result</h3>
          {result ? (
            <div className="flex flex-col items-center">
              <Gauge value={Math.round(result.probability * 100)} label="DEFAULT PROBABILITY" />
              <div className="mt-3 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: result.prediction ? "rgba(229,72,77,.15)" : "rgba(61,214,140,.15)", color: result.prediction ? T.danger : T.safe }}>
                {result.prediction ? "Likely to default" : "Likely to repay"}
              </div>
              <p className="text-[11px] mt-4 text-center" style={{ color: T.muted }}>Model estimate only. Not a credit decision.</p>
            </div>
          ) : (
            <p className="text-xs" style={{ color: T.muted }}>Submit the form to see the model's probability estimate here.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryView({ token, notify }) {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    fetch(`${API}/predict/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then(setRows)
      .catch(() => notify("Couldn't load history", "error"));
  }, []);
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 fade-up">
      <h2 className="text-xl font-semibold mb-5">Assessment history</h2>
      {!rows ? <p className="text-xs" style={{ color: T.muted }}>Loading…</p> : rows.length === 0 ? (
        <p className="text-xs" style={{ color: T.muted }}>No assessments yet — run one from the Assess tab.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: T.border }}>
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3 border-b last:border-0 text-sm" style={{ borderColor: T.border }}>
              <div>
                <div style={{ color: T.text }}>Age {r.age} · {(r.probability * 100).toFixed(1)}% risk</div>
                <div className="text-[11px]" style={{ color: T.muted }}>{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: r.prediction ? "rgba(229,72,77,.15)" : "rgba(61,214,140,.15)", color: r.prediction ? T.danger : T.safe }}>
                {r.prediction ? "Default" : "Repay"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
