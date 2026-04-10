import { useState, useRef, useEffect } from "react";

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg-base:       #0a0a0f;
      --bg-surface:    #111118;
      --bg-elevated:   #18181f;
      --bg-overlay:    #1f1f2a;
      --bg-hover:      #25252f;
      --border:        rgba(255,255,255,0.06);
      --border-strong: rgba(255,255,255,0.12);
      --text-primary:  #f0f0f5;
      --text-secondary:#9090a8;
      --text-muted:    #5a5a70;
      --accent:        #6366f1;
      --accent-muted:  rgba(99,102,241,0.12);
      --accent-border: rgba(99,102,241,0.3);
      --success:       #22c55e;
      --danger:        #ef4444;
      --tool-date:     #818cf8;
      --tool-time:     #34d399;
      --tool-weather:  #60a5fa;
      font-family: 'DM Sans', system-ui, sans-serif;
    }
    body { background: var(--bg-base); }
    button { cursor: pointer; border: none; background: none; font-family: inherit; }
    input, textarea { font-family: inherit; outline: none; border: none; background: none; }
    ::placeholder { color: var(--text-muted); }
    ::-webkit-scrollbar { width: 0; height: 0; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    .fade-up { animation: fadeUp .22s ease both; }
    .cursor::after { content:'▋'; font-size:.8em; color:var(--accent); animation: blink 1s step-end infinite; }
    .btn-tap { transition: all .12s; }
    .btn-tap:active { transform: scale(.96); opacity:.85; }
    .row-tap:active { background: var(--bg-overlay) !important; }
  `}</style>
);

// ── Icons ─────────────────────────────────────────────────────────────────────
const P = {
  mail:"<rect x='2' y='4' width='20' height='16' rx='2'/><path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/>",
  lock:"<rect width='18' height='11' x='3' y='11' rx='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/>",
  eye:"<path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z'/><circle cx='12' cy='12' r='3'/>",
  eyeOff:"<path d='M9.88 9.88a3 3 0 1 0 4.24 4.24'/><path d='M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68'/><path d='M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61'/><line x1='2' x2='22' y1='2' y2='22'/>",
  user:"<path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/>",
  send:"<path d='m22 2-7 20-4-9-9-4Z'/><path d='M22 2 11 13'/>",
  search:"<circle cx='11' cy='11' r='8'/><path d='m21 21-4.3-4.3'/>",
  plus:"<path d='M5 12h14'/><path d='M12 5v14'/>",
  trash:"<path d='M3 6h18'/><path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'/><path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'/>",
  pin:"<line x1='12' x2='12' y1='17' y2='22'/><path d='M5 17H19V13L21 6H3L5 13V17Z'/>",
  edit:"<path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/><path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'/>",
  calendar:"<rect width='18' height='18' x='3' y='4' rx='2'/><line x1='16' x2='16' y1='2' y2='6'/><line x1='8' x2='8' y1='2' y2='6'/><line x1='3' x2='21' y1='10' y2='10'/>",
  clock:"<circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/>",
  cloud:"<path d='M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z'/>",
  sparkle:"<path d='M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z'/>",
  x:"<path d='M18 6 6 18'/><path d='m6 6 12 12'/>",
  chevLeft:"<path d='m15 18-6-6 6-6'/>",
  check:"<path d='M20 6 9 17l-5-5'/>",
  alert:"<circle cx='12' cy='12' r='10'/><line x1='12' x2='12' y1='8' y2='12'/><line x1='12' x2='12.01' y1='16' y2='16'/>",
  wind:"<path d='M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2'/><path d='M9.6 4.6A2 2 0 1 1 11 8H2'/><path d='M12.6 19.4A2 2 0 1 0 14 16H2'/>",
  droplets:"<path d='M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z'/>",
  thermo:"<path d='M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z'/>",
  micro:"<path d='M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z'/><path d='M19 10v2a7 7 0 0 1-14 0v-2'/><line x1='12' x2='12' y1='19' y2='22'/>",
  more:"<circle cx='12' cy='5' r='1'/><circle cx='12' cy='12' r='1'/><circle cx='12' cy='19' r='1'/>",
};
const Ic = ({ n, s = 16, c = "currentColor", st = {} }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, ...st }}
    dangerouslySetInnerHTML={{ __html: P[n] || "" }} />
);

// ── Phone Shell ───────────────────────────────────────────────────────────────
const Phone = ({ children, label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
    {label && (
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
        {label}
      </span>
    )}
    <div style={{
      width: 375, height: 812,
      background: "var(--bg-base)",
      borderRadius: 50,
      border: "1px solid rgba(255,255,255,0.1)",
      overflow: "hidden",
      position: "relative",
      boxShadow: "0 40px 100px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.04)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Notch */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 126, height: 32, background: "var(--bg-base)",
        borderRadius: "0 0 22px 22px", zIndex: 100,
        display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 7,
      }}>
        <div style={{ width: 60, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.1)" }} />
      </div>
      {/* Status bar */}
      <div style={{ height: 44, display: "flex", alignItems: "flex-end", padding: "0 26px 8px", flexShrink: 0 }}>
        <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'DM Mono', monospace" }}>9:41</div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
            {[5,7,9,11].map((h,i) => (
              <div key={i} style={{ width: 3, height: h, borderRadius: 1.5, background: i < 3 ? "var(--text-primary)" : "var(--text-muted)" }} />
            ))}
          </div>
          <svg width="13" height="10" viewBox="0 0 24 18" fill="none" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M1 7c3-3.33 7-5 11-5s8 1.67 11 5"/><path d="M5 11c1.9-1.93 4.1-3 7-3s5.1 1.07 7 3"/>
            <path d="M9 15c.9-1 1.9-1.5 3-1.5s2.1.5 3 1.5"/><circle cx="12" cy="18" r="1" fill="var(--text-primary)" stroke="none"/>
          </svg>
          <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
            <div style={{ width: 22, height: 11, border: "1.5px solid var(--text-primary)", borderRadius: 3, padding: 1.5 }}>
              <div style={{ width: "80%", height: "100%", background: "var(--text-primary)", borderRadius: 1 }} />
            </div>
            <div style={{ width: 2, height: 5, background: "var(--text-primary)", borderRadius: "0 1px 1px 0" }} />
          </div>
        </div>
      </div>
      {/* Content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>{children}</div>
      {/* Home bar */}
      <div style={{ height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ width: 120, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
      </div>
    </div>
  </div>
);

// ── Auth ──────────────────────────────────────────────────────────────────────
const AuthMobile = () => {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [focused, setFocused] = useState(null);

  const Field = ({ id, label, type="text", icon, value, onChange, error, success, right }) => {
    const isFoc = focused === id;
    const floated = isFoc || (value?.length > 0);
    return (
      <div style={{ marginBottom: error ? 4 : 13 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, height: 56,
          background: isFoc ? "var(--bg-elevated)" : "var(--bg-surface)",
          border: `1.5px solid ${error ? "var(--danger)" : isFoc ? "var(--accent)" : success ? "var(--success)" : "var(--border-strong)"}`,
          borderRadius: 14, padding: "0 16px", transition: "all .15s",
          boxShadow: isFoc ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
        }}>
          <Ic n={icon} s={17} c={isFoc ? "var(--accent)" : "var(--text-muted)"} st={{ transition: "color .15s" }} />
          <div style={{ flex: 1, position: "relative" }}>
            <label style={{
              position: "absolute", left: 0,
              top: floated ? 2 : "50%",
              transform: floated ? "none" : "translateY(-50%)",
              fontSize: floated ? 10 : 15, fontWeight: floated ? 600 : 400,
              color: error ? "var(--danger)" : isFoc ? "var(--accent)" : "var(--text-muted)",
              transition: "all .15s", pointerEvents: "none",
              letterSpacing: floated ? ".05em" : 0,
              textTransform: floated ? "uppercase" : "none",
            }}>{label}</label>
            <input
              type={type} value={value} onChange={onChange}
              placeholder={floated ? (type==="email" ? "hola@ejemplo.com" : type==="password" ? "Mín. 8 caracteres" : "Juan Pérez") : ""}
              onFocus={() => setFocused(id)} onBlur={() => setFocused(null)}
              style={{ width: "100%", fontSize: 15, color: "var(--text-primary)", paddingTop: floated ? 16 : 0, paddingBottom: floated ? 2 : 0, transition: "padding .15s" }}
            />
          </div>
          {right}
          {success && !error && <Ic n="check" s={16} c="var(--success)" />}
        </div>
        {error && (
          <div style={{ display: "flex", gap: 5, alignItems: "center", marginTop: 5, paddingLeft: 2 }}>
            <Ic n="alert" s={12} c="var(--danger)" />
            <span style={{ fontSize: 12, color: "var(--danger)" }}>{error}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Brand header */}
      <div style={{ background: "linear-gradient(160deg, rgba(99,102,241,0.18) 0%, transparent 65%)", padding: "24px 24px 20px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.14), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 22 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
            <Ic n="sparkle" s={16} c="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>Helios</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".06em", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", color: "var(--accent)", padding: "2px 7px", borderRadius: 99, fontFamily: "'DM Mono', monospace" }}>BETA</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, color: "var(--text-primary)", whiteSpace: "pre-line" }}>
          {tab === "login" ? "Bienvenido\nde vuelta" : "Creá tu\ncuenta"}
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>
          {tab === "login" ? "Ingresá tus credenciales para continuar" : "Completá el formulario para empezar"}
        </p>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: 12, padding: 3, gap: 2, margin: "18px 0 22px" }}>
          {["login","register"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, height: 38, borderRadius: 10,
              fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
              background: tab===t ? "var(--bg-elevated)" : "none",
              color: tab===t ? "var(--text-primary)" : "var(--text-muted)",
              border: tab===t ? "1px solid var(--border-strong)" : "1px solid transparent",
              boxShadow: tab===t ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
              transition: "all .15s",
            }}>
              {t === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          ))}
        </div>

        <div className="fade-up">
          {tab === "register" && <Field id="name" label="Nombre completo" icon="user" value={name} onChange={e => setName(e.target.value)} />}
          <Field id="email" label="Email" type="email" icon="mail" value={email}
            onChange={e => { setEmail(e.target.value); setEmailErr(""); }}
            error={emailErr} success={!emailErr && email.includes("@") && email.length > 3}
          />
          <Field id="pass" label="Contraseña" type={showPass?"text":"password"} icon="lock"
            value={pass} onChange={e => setPass(e.target.value)}
            right={<button onClick={() => setShowPass(!showPass)} style={{ display:"flex", color:"var(--text-muted)" }}><Ic n={showPass?"eyeOff":"eye"} s={17} /></button>}
          />

          {tab === "login" && (
            <div style={{ textAlign:"right", marginTop:-4, marginBottom: 18 }}>
              <a href="#" style={{ fontSize: 13, color: "var(--accent)", textDecoration:"none", fontWeight:500 }}>¿Olvidaste tu contraseña?</a>
            </div>
          )}

          <button className="btn-tap" onClick={() => {
            if(!email.includes("@")){ setEmailErr("Email inválido"); return; }
            setLoading(true); setTimeout(() => setLoading(false), 2000);
          }} style={{
            width:"100%", height:52, background:"var(--accent)", color:"#fff",
            borderRadius:14, fontSize:15, fontWeight:600, fontFamily:"'DM Sans', sans-serif",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            boxShadow:"0 4px 20px rgba(99,102,241,0.35)", marginBottom:14,
          }}>
            {loading ? (
              <div style={{ display:"flex", gap:5 }}>
                {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"rgba(255,255,255,0.6)", animation:`pulse 1.2s ease ${i*.2}s infinite` }} />)}
              </div>
            ) : (tab === "login" ? "Iniciar sesión" : "Crear cuenta")}
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ flex:1, height:1, background:"var(--border)" }} />
            <span style={{ fontSize:12, color:"var(--text-muted)" }}>o</span>
            <div style={{ flex:1, height:1, background:"var(--border)" }} />
          </div>

          <button className="btn-tap" style={{
            width:"100%", height:50, background:"var(--bg-surface)",
            border:"1px solid var(--border-strong)", borderRadius:14,
            color:"var(--text-secondary)", fontSize:14, fontWeight:500,
            fontFamily:"'DM Sans', sans-serif",
            display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:22,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          <p style={{ fontSize:13, color:"var(--text-muted)", textAlign:"center" }}>
            {tab==="login" ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
            <button onClick={() => setTab(tab==="login"?"register":"login")} style={{ color:"var(--accent)", fontFamily:"'DM Sans', sans-serif", fontSize:13, fontWeight:500 }}>
              {tab==="login" ? "Registrate" : "Iniciá sesión"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Tool Cards ────────────────────────────────────────────────────────────────
const DateCard = () => (
  <div style={{ background:"rgba(129,140,248,0.07)", border:"1px solid rgba(129,140,248,0.22)", borderRadius:14, padding:"12px 14px", minWidth:158, flexShrink:0 }}>
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:9 }}>
      <div style={{ width:22, height:22, borderRadius:6, background:"rgba(129,140,248,0.14)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Ic n="calendar" s={11} c="var(--tool-date)" />
      </div>
      <span style={{ fontSize:10, color:"var(--tool-date)", fontWeight:500, fontFamily:"'DM Mono', monospace", letterSpacing:".05em" }}>current_date</span>
    </div>
    <div style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.03em", color:"var(--text-primary)", lineHeight:1.1 }}>Jueves</div>
    <div style={{ fontSize:12, color:"var(--text-secondary)", marginTop:2 }}>9 de Abril, 2026</div>
    <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:6 }}>Semana 15 · Día 99</div>
  </div>
);

const TimeCard = () => (
  <div style={{ background:"rgba(52,211,153,0.07)", border:"1px solid rgba(52,211,153,0.22)", borderRadius:14, padding:"12px 14px", minWidth:148, flexShrink:0 }}>
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:9 }}>
      <div style={{ width:22, height:22, borderRadius:6, background:"rgba(52,211,153,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Ic n="clock" s={11} c="var(--tool-time)" />
      </div>
      <span style={{ fontSize:10, color:"var(--tool-time)", fontWeight:500, fontFamily:"'DM Mono', monospace", letterSpacing:".05em" }}>current_time</span>
    </div>
    <div style={{ fontSize:26, fontWeight:700, letterSpacing:"-0.04em", color:"var(--text-primary)", fontFamily:"'DM Mono', monospace", lineHeight:1 }}>14:32</div>
    <div style={{ fontSize:12, color:"var(--text-secondary)", marginTop:3 }}>GMT-3 · Buenos Aires</div>
    <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:7 }}>
      <div style={{ width:5, height:5, borderRadius:"50%", background:"var(--tool-time)", animation:"pulse 2s infinite" }} />
      <span style={{ fontSize:10, color:"var(--tool-time)" }}>En vivo</span>
    </div>
  </div>
);

const WeatherCard = () => (
  <div style={{ background:"rgba(96,165,250,0.07)", border:"1px solid rgba(96,165,250,0.22)", borderRadius:14, padding:"12px 14px", minWidth:200, flexShrink:0 }}>
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:9 }}>
      <div style={{ width:22, height:22, borderRadius:6, background:"rgba(96,165,250,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Ic n="cloud" s={11} c="var(--tool-weather)" />
      </div>
      <span style={{ fontSize:10, color:"var(--tool-weather)", fontWeight:500, fontFamily:"'DM Mono', monospace", letterSpacing:".05em" }}>current_weather</span>
    </div>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div>
        <div style={{ fontSize:30, fontWeight:700, letterSpacing:"-0.04em", color:"var(--text-primary)", lineHeight:1 }}>19°</div>
        <div style={{ fontSize:12, color:"var(--text-secondary)", marginTop:3 }}>Parcialmente nublado</div>
        <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:1 }}>Buenos Aires, AR</div>
      </div>
      <div style={{ fontSize:34 }}>⛅</div>
    </div>
    <div style={{ display:"flex", marginTop:10, paddingTop:8, borderTop:"1px solid rgba(96,165,250,0.14)" }}>
      {[{l:"Sens.",v:"17°"},{l:"Hum.",v:"72%"},{l:"Viento",v:"14km/h"}].map((m,i) => (
        <div key={i} style={{ flex:1, textAlign:"center" }}>
          <div style={{ fontSize:10, color:"var(--text-muted)" }}>{m.l}</div>
          <div style={{ fontSize:12, fontWeight:600, color:"var(--text-secondary)", marginTop:1 }}>{m.v}</div>
        </div>
      ))}
    </div>
  </div>
);

// ── Chat List ────────────────────────────────────────────────────────────────
const CHATS_DATA = [
  { id:1, title:"¿Qué tiempo hace hoy?", preview:"Consultá el clima actual...", time:"14:31", pinned:true },
  { id:2, title:"Resumen ejecutivo Q1", preview:"Necesito un resumen de...", time:"11:20", pinned:true },
  { id:3, title:"Ideas para el README", preview:"Dame ideas para documentar...", time:"Ayer" },
  { id:4, title:"Plan de arquitectura", preview:"Turborepo + tRPC + Hono...", time:"Ayer" },
  { id:5, title:"Revisión de PRs", preview:"¿Podés revisar este código?", time:"Mar" },
  { id:6, title:"Deploy en Vercel", preview:"Cómo configurar edge...", time:"Mar" },
];

const MSGS = [
  { role:"user", content:"¿Qué tiempo hace hoy en Buenos Aires? También decime la hora y la fecha.", ts:"14:30" },
  { role:"assistant", tools:["date","time","weather"] },
  { role:"assistant", content:"¡Acá tenés todo! Hoy es nublado con 19°C en Buenos Aires. La sensación es de 17° con vientos del sur. Si salís, llevate algo liviano.", ts:"14:31" },
  { role:"user", content:"Perfecto, ¿y el pronóstico para mañana?", ts:"14:32" },
  { role:"assistant", content:"Para el pronóstico extendido necesitaría la tool de forecast que aún no está conectada.", streaming:true },
];

const ChatListItem = ({ c, active, onTap, onAction }) => {
  const [hov, setHov] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:"relative", marginBottom:2 }}>
      <div
        className="row-tap"
        onClick={onTap}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          padding:"10px 12px", borderRadius:12, cursor:"pointer",
          background: active ? "var(--bg-overlay)" : hov ? "var(--bg-hover)" : "transparent",
          border:`1px solid ${active ? "var(--border-strong)" : "transparent"}`,
          display:"flex", alignItems:"center", gap:10, transition:"all .12s", position:"relative",
        }}
      >
        {active && <div style={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)", width:2, height:"55%", background:"var(--accent)", borderRadius:"0 2px 2px 0" }} />}
        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background: active ? "var(--accent-muted)" : "var(--bg-elevated)", border:`1px solid ${active ? "var(--accent-border)" : "var(--border)"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Ic n="sparkle" s={15} c={active ? "var(--accent)" : "var(--text-muted)"} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
            {c.pinned && <Ic n="pin" s={10} c="var(--accent)" />}
            <span style={{ fontSize:13, fontWeight: active?600:500, color: active?"var(--text-primary)":"var(--text-secondary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{c.title}</span>
          </div>
          <span style={{ fontSize:12, color:"var(--text-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{c.preview}</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5, flexShrink:0 }}>
          <span style={{ fontSize:11, color:"var(--text-muted)" }}>{c.time}</span>
          {(hov || active) && (
            <div style={{ display:"flex", gap:2 }}>
              {[{n:"pin",title:"Anclar"},{n:"edit",title:"Renombrar"},{n:"trash",title:"Eliminar"}].map(a => (
                <button key={a.n} title={a.title} onClick={e => e.stopPropagation()} style={{ width:24, height:24, borderRadius:6, background:"var(--bg-surface)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", color: a.n==="trash" ? "var(--danger)" : "var(--text-muted)" }}>
                  <Ic n={a.n} s={11} c={a.n==="trash" ? "var(--danger)" : "var(--text-muted)"} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatListScreen = ({ onOpen }) => {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(1);
  const filtered = CHATS_DATA.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  const pinned = filtered.filter(c => c.pinned);
  const recent = filtered.filter(c => !c.pinned);
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }} className="fade-up">
      <div style={{ padding:"16px 20px 12px", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:9, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 10px rgba(99,102,241,0.4)" }}>
              <Ic n="sparkle" s={14} c="#fff" />
            </div>
            <span style={{ fontSize:16, fontWeight:700, letterSpacing:"-0.02em" }}>Helios</span>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff" }}>ER</div>
            <button className="btn-tap" style={{ width:30, height:30, borderRadius:9, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 10px rgba(99,102,241,0.3)" }}>
              <Ic n="plus" s={15} c="#fff" />
            </button>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"var(--bg-elevated)", border:"1px solid var(--border-strong)", borderRadius:12, padding:"9px 14px", height:42 }}>
          <Ic n="search" s={15} c="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar conversaciones…" style={{ flex:1, fontSize:14, color:"var(--text-primary)" }} />
          {search && <button onClick={() => setSearch("")} style={{ color:"var(--text-muted)", display:"flex" }}><Ic n="x" s={14} /></button>}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"8px 12px" }}>
        {pinned.length > 0 && <>
          <div style={{ padding:"6px 8px 5px", fontSize:10, fontWeight:700, color:"var(--text-muted)", letterSpacing:".08em", textTransform:"uppercase" }}>📌 Anclados</div>
          {pinned.map(c => <ChatListItem key={c.id} c={c} active={active===c.id} onTap={() => { setActive(c.id); onOpen && onOpen(); }} />)}
          <div style={{ height:1, background:"var(--border)", margin:"8px 4px" }} />
        </>}
        {recent.length > 0 && <>
          <div style={{ padding:"6px 8px 5px", fontSize:10, fontWeight:700, color:"var(--text-muted)", letterSpacing:".08em", textTransform:"uppercase" }}>Recientes</div>
          {recent.map(c => <ChatListItem key={c.id} c={c} active={active===c.id} onTap={() => { setActive(c.id); onOpen && onOpen(); }} />)}
        </>}
        {filtered.length === 0 && (
          <div style={{ padding:"40px 20px", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:14, fontWeight:600, color:"var(--text-secondary)", marginBottom:4 }}>Sin resultados</div>
            <div style={{ fontSize:13, color:"var(--text-muted)" }}>Probá con otro término</div>
          </div>
        )}
        {filtered.length > 0 && (
          <div style={{ display:"flex", justifyContent:"center", padding:"16px 0 4px", gap:4 }}>
            {[0,1,2].map(i => <div key={i} style={{ width:4, height:4, borderRadius:"50%", background:"var(--text-muted)", animation:`pulse 1.5s ease ${i*.25}s infinite` }} />)}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Chat Conversation ─────────────────────────────────────────────────────────
const ChatConvScreen = ({ onBack }) => {
  const [msg, setMsg] = useState("");
  const ref = useRef(null);
  useEffect(() => { if(ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, []);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }} className="fade-up">
      <div style={{ height:52, display:"flex", alignItems:"center", gap:10, padding:"0 16px", borderBottom:"1px solid var(--border)", background:"var(--bg-surface)", flexShrink:0 }}>
        <button className="btn-tap" onClick={onBack} style={{ width:34, height:34, borderRadius:10, background:"var(--bg-elevated)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-secondary)" }}>
          <Ic n="chevLeft" s={16} />
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>¿Qué tiempo hace hoy?</div>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:1 }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:"var(--success)", animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:11, color:"var(--text-muted)" }}>Helios · Conectado</span>
          </div>
        </div>
        <button style={{ width:34, height:34, borderRadius:10, background:"var(--bg-elevated)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-secondary)" }}>
          <Ic n="more" s={16} />
        </button>
      </div>

      <div ref={ref} style={{ flex:1, overflowY:"auto", padding:"16px 16px 8px", display:"flex", flexDirection:"column", gap:14 }}>
        {MSGS.map((m, i) => {
          if(m.tools) return (
            <div key={i} className="fade-up" style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ flex:1, height:1, background:"var(--border)" }} />
                <span style={{ fontSize:10, color:"var(--text-muted)", fontFamily:"'DM Mono', monospace", whiteSpace:"nowrap" }}>herramientas utilizadas</span>
                <div style={{ flex:1, height:1, background:"var(--border)" }} />
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {m.tools.map(t => (
                  <span key={t} style={{ fontSize:10, fontWeight:500, fontFamily:"'DM Mono', monospace", padding:"3px 8px", borderRadius:99, whiteSpace:"nowrap",
                    background: t==="date"?"rgba(129,140,248,0.1)":t==="time"?"rgba(52,211,153,0.1)":"rgba(96,165,250,0.1)",
                    color: t==="date"?"var(--tool-date)":t==="time"?"var(--tool-time)":"var(--tool-weather)",
                    border:`1px solid ${t==="date"?"rgba(129,140,248,0.25)":t==="time"?"rgba(52,211,153,0.25)":"rgba(96,165,250,0.25)"}` }}>
                    {t==="date"?"📅 current_date":t==="time"?"🕐 current_time":"⛅ current_weather"}
                  </span>
                ))}
              </div>
              <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:4, paddingRight:4 }}>
                {m.tools.includes("date") && <DateCard />}
                {m.tools.includes("time") && <TimeCard />}
                {m.tools.includes("weather") && <WeatherCard />}
              </div>
            </div>
          );
          const isUser = m.role === "user";
          return (
            <div key={i} className="fade-up" style={{ display:"flex", gap:8, flexDirection: isUser?"row-reverse":"row" }}>
              {!isUser && (
                <div style={{ width:26, height:26, borderRadius:8, background:"var(--accent)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", marginTop:2 }}>
                  <Ic n="sparkle" s={12} c="#fff" />
                </div>
              )}
              <div style={{ maxWidth:"78%", display:"flex", flexDirection:"column", gap:4, alignItems: isUser?"flex-end":"flex-start" }}>
                <div className={m.streaming?"cursor":""} style={{
                  padding: isUser?"10px 13px":"11px 14px",
                  background: isUser?"var(--accent)":"var(--bg-elevated)",
                  borderRadius: isUser?"16px 16px 4px 16px":"16px 16px 16px 4px",
                  border: isUser?"none":"1px solid var(--border)",
                  fontSize:14, lineHeight:1.6,
                  color: isUser?"#fff":"var(--text-primary)",
                  boxShadow: isUser?"0 2px 10px rgba(99,102,241,0.25)":"none",
                }}>{m.content}</div>
                {m.ts && <span style={{ fontSize:10, color:"var(--text-muted)", paddingLeft:3 }}>{m.ts}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div style={{ padding:"10px 12px 10px", borderTop:"1px solid var(--border)", background:"var(--bg-surface)", flexShrink:0 }}>
        <div style={{ display:"flex", gap:5, marginBottom:8, overflowX:"auto" }}>
          {[
            {l:"Fecha",c:"var(--tool-date)",bg:"rgba(129,140,248,0.1)",b:"rgba(129,140,248,0.25)",n:"calendar"},
            {l:"Hora",c:"var(--tool-time)",bg:"rgba(52,211,153,0.1)",b:"rgba(52,211,153,0.25)",n:"clock"},
            {l:"Clima",c:"var(--tool-weather)",bg:"rgba(96,165,250,0.1)",b:"rgba(96,165,250,0.25)",n:"cloud"},
          ].map(t => (
            <span key={t.l} style={{ fontSize:10, fontWeight:500, fontFamily:"'DM Mono', monospace", whiteSpace:"nowrap", padding:"3px 9px", borderRadius:99, background:t.bg, color:t.c, border:`1px solid ${t.b}`, display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
              <Ic n={t.n} s={10} c={t.c} />{t.l}
            </span>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"flex-end", background:"var(--bg-elevated)", border:"1px solid var(--border-strong)", borderRadius:16, padding:"10px 8px 10px 14px" }}>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Escribí tu mensaje…" rows={1}
            style={{ flex:1, fontSize:14, color:"var(--text-primary)", lineHeight:1.5, resize:"none", maxHeight:100, overflowY:"auto" }} />
          <div style={{ display:"flex", gap:4, flexShrink:0 }}>
            <button style={{ width:36, height:36, borderRadius:10, background:"var(--bg-overlay)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ic n="micro" s={16} c="var(--text-muted)" />
            </button>
            <button className="btn-tap" style={{ width:36, height:36, borderRadius:10, background: msg.trim()?"var(--accent)":"var(--bg-overlay)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow: msg.trim()?"0 2px 10px rgba(99,102,241,0.3)":"none", transition:"all .15s" }}>
              <Ic n="send" s={15} c={msg.trim()?"#fff":"var(--text-muted)"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("auth");

  const tabs = [
    { id:"auth", label:"/auth" },
    { id:"chat-list", label:"/chat · lista" },
    { id:"chat-conv", label:"/chat · conv." },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#050508", display:"flex", flexDirection:"column", alignItems:"center", paddingBottom:48, fontFamily:"'DM Sans', system-ui, sans-serif" }}>
      <G />
      {/* Nav */}
      <div style={{ position:"sticky", top:0, zIndex:200, width:"100%", display:"flex", justifyContent:"center", padding:"14px 0 12px", background:"rgba(5,5,8,0.88)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display:"flex", gap:2, background:"rgba(17,17,24,0.9)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:99, padding:4, boxShadow:"0 4px 24px rgba(0,0,0,0.5)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setScreen(t.id)} style={{
              padding:"7px 15px", borderRadius:99,
              background: screen===t.id ? "var(--accent)" : "transparent",
              color: screen===t.id ? "#fff" : "var(--text-muted)",
              fontSize:12, fontWeight:500, fontFamily:"'DM Sans', sans-serif",
              transition:"all .15s", whiteSpace:"nowrap",
              boxShadow: screen===t.id ? "0 2px 10px rgba(99,102,241,0.3)" : "none",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:"32px 20px 0", display:"flex", justifyContent:"center" }}>
        {screen === "auth" && (
          <Phone label="/auth · Autenticación">
            <AuthMobile />
          </Phone>
        )}
        {screen === "chat-list" && (
          <Phone label="/chat · Lista de conversaciones">
            <ChatListScreen onOpen={() => setScreen("chat-conv")} />
          </Phone>
        )}
        {screen === "chat-conv" && (
          <Phone label="/chat · Conversación activa">
            <ChatConvScreen onBack={() => setScreen("chat-list")} />
          </Phone>
        )}
      </div>
    </div>
  );
}
