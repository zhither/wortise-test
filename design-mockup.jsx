import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// Palette: Near-black base, zinc neutrals, indigo accent, emerald tool badges
// Typography: "DM Sans" (body) + "DM Mono" (code/labels)
// Injecting Google Fonts + resets
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

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
      --accent-hover:  #7577f3;
      --accent-muted:  rgba(99,102,241,0.12);
      --accent-border: rgba(99,102,241,0.3);

      --success:       #22c55e;
      --warning:       #f59e0b;
      --danger:        #ef4444;
      --danger-muted:  rgba(239,68,68,0.1);

      --tool-date:     #818cf8;
      --tool-time:     #34d399;
      --tool-weather:  #60a5fa;

      --radius-sm:     6px;
      --radius-md:     10px;
      --radius-lg:     14px;
      --radius-xl:     20px;
      --radius-full:   9999px;

      --shadow-sm:  0 1px 3px rgba(0,0,0,0.4);
      --shadow-md:  0 4px 16px rgba(0,0,0,0.5);
      --shadow-lg:  0 8px 32px rgba(0,0,0,0.6);

      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: var(--text-primary);
    }

    body { background: var(--bg-base); }

    button { cursor: pointer; border: none; background: none; font-family: inherit; }
    input, textarea { font-family: inherit; outline: none; }
    ::placeholder { color: var(--text-muted); }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--bg-overlay); border-radius: 4px; }

    .tab-active { color: var(--text-primary) !important; }
    .tab-inactive { color: var(--text-secondary); }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-8px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    .fade-in { animation: fadeIn 0.25s ease both; }
    .slide-in { animation: slideIn 0.2s ease both; }
    .cursor-blink::after {
      content: '▋';
      font-size: 0.85em;
      color: var(--accent);
      animation: blink 1s step-end infinite;
    }
  `}</style>
);

// ─── ICONS (inline SVG) ───────────────────────────────────────────────────────
const Icon = ({ name, size = 16, color = "currentColor", style = {} }) => {
  const paths = {
    mail: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,
    lock: <><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff: <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></>,
    user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
    plus: <><path d="M5 12h14"/><path d="M12 5v14"/></>,
    trash: <><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></>,
    pin: <><line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17H19V13L21 6H3L5 13V17Z"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    dots: <><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></>,
    calendar: <><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    cloud: <><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></>,
    chevronDown: <><path d="m6 9 6 6 6-6"/></>,
    x: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
    sparkle: <><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></>,
    wind: <><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></>,
    droplets: <><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></>,
    thermometer: <><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></>,
    arrowUp: <><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></>,
    bot: <><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></>,
    menu: <><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></>,
    check: <><path d="M20 6 9 17l-5-5"/></>,
    alertCircle: <><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths[name]}
    </svg>
  );
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

const Badge = ({ children, color = "accent", style = {} }) => {
  const colors = {
    accent: { bg: "var(--accent-muted)", text: "var(--accent)", border: "var(--accent-border)" },
    success: { bg: "rgba(34,197,94,0.1)", text: "var(--success)", border: "rgba(34,197,94,0.25)" },
    warning: { bg: "rgba(245,158,11,0.1)", text: "var(--warning)", border: "rgba(245,158,11,0.25)" },
    date: { bg: "rgba(129,140,248,0.1)", text: "var(--tool-date)", border: "rgba(129,140,248,0.25)" },
    time: { bg: "rgba(52,211,153,0.1)", text: "var(--tool-time)", border: "rgba(52,211,153,0.25)" },
    weather: { bg: "rgba(96,165,250,0.1)", text: "var(--tool-weather)", border: "rgba(96,165,250,0.25)" },
  };
  const c = colors[color] || colors.accent;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: "var(--radius-full)",
      fontSize: 11, fontWeight: 500, letterSpacing: "0.02em",
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      fontFamily: "'DM Mono', monospace",
      ...style
    }}>
      {children}
    </span>
  );
};

const Divider = ({ label, style = {} }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, ...style }}>
    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    {label && <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{label}</span>}
    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
  </div>
);

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
const InputField = ({ label, type = "text", icon, error, success, placeholder, value, onChange, rightAction }) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const isFloated = focused || hasValue;

  return (
    <div style={{ position: "relative", marginBottom: error ? 6 : 20 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: focused ? "var(--bg-elevated)" : "var(--bg-surface)",
        border: `1px solid ${error ? "var(--danger)" : focused ? "var(--accent)" : success ? "var(--success)" : "var(--border-strong)"}`,
        borderRadius: "var(--radius-md)", padding: "0 14px",
        transition: "all 0.15s ease",
        boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
        height: 52,
      }}>
        {icon && <Icon name={icon} size={16} color={focused ? "var(--accent)" : "var(--text-muted)"} style={{ flexShrink: 0, transition: "color 0.15s" }} />}
        <div style={{ flex: 1, position: "relative" }}>
          <label style={{
            position: "absolute",
            left: 0,
            top: isFloated ? 2 : "50%",
            transform: isFloated ? "none" : "translateY(-50%)",
            fontSize: isFloated ? 10 : 14,
            fontWeight: isFloated ? 500 : 400,
            color: error ? "var(--danger)" : focused ? "var(--accent)" : "var(--text-muted)",
            transition: "all 0.15s ease",
            pointerEvents: "none",
            letterSpacing: isFloated ? "0.05em" : 0,
            textTransform: isFloated ? "uppercase" : "none",
          }}>
            {label}
          </label>
          <input
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={isFloated ? placeholder : ""}
            style={{
              width: "100%", background: "none", border: "none",
              color: "var(--text-primary)", fontSize: 14,
              paddingTop: isFloated ? 14 : 0,
              paddingBottom: isFloated ? 2 : 0,
              transition: "padding 0.15s ease",
            }}
          />
        </div>
        {rightAction && rightAction}
        {success && !error && <Icon name="check" size={16} color="var(--success)" />}
      </div>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, marginLeft: 2 }}>
          <Icon name="alertCircle" size={12} color="var(--danger)" />
          <span style={{ fontSize: 12, color: "var(--danger)" }}>{error}</span>
        </div>
      )}
    </div>
  );
};

const PrimaryButton = ({ children, loading, disabled, onClick, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    style={{
      width: "100%", height: 48,
      background: disabled || loading ? "var(--bg-overlay)" : "var(--accent)",
      color: disabled || loading ? "var(--text-muted)" : "#fff",
      borderRadius: "var(--radius-md)", fontSize: 14, fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      transition: "all 0.15s ease", cursor: disabled || loading ? "not-allowed" : "pointer",
      boxShadow: disabled || loading ? "none" : "0 4px 16px rgba(99,102,241,0.3)",
      ...style
    }}
  >
    {loading ? (
      <div style={{ display: "flex", gap: 4 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--text-muted)",
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
          }} />
        ))}
      </div>
    ) : children}
  </button>
);

const AuthScreen = () => {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("edu@example.com");
  const [password, setPassword] = useState("••••••••");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleSubmit = () => {
    if (!email.includes("@")) {
      setEmailError("Ingresá un email válido");
      return;
    }
    setEmailError("");
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", background: "var(--bg-base)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Left panel — branding */}
      <div style={{
        width: "45%", background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        padding: "48px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", bottom: -120, left: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "auto" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "var(--radius-md)",
            background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="sparkle" size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Helios
          </span>
          <Badge color="accent" style={{ marginLeft: 4 }}>Beta</Badge>
        </div>

        {/* Tagline */}
        <div style={{ marginTop: "auto" }}>
          <h1 style={{
            fontSize: 36, fontWeight: 700, lineHeight: 1.15,
            letterSpacing: "-0.03em", color: "var(--text-primary)",
            marginBottom: 16,
          }}>
            Tu asistente.<br />
            <span style={{ color: "var(--accent)" }}>Siempre al día.</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 300 }}>
            IA conversacional con acceso a herramientas reales — clima, fecha, hora y más.
          </p>

          {/* Feature chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 28 }}>
            {[
              { icon: "calendar", label: "Fecha actual", color: "date" },
              { icon: "clock", label: "Hora actual", color: "time" },
              { icon: "cloud", label: "Clima en tiempo real", color: "weather" },
              { icon: "sparkle", label: "Streaming", color: "accent" },
            ].map(f => (
              <div key={f.label} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: "var(--radius-full)",
                background: "var(--bg-elevated)", border: "1px solid var(--border-strong)",
                fontSize: 12, color: "var(--text-secondary)",
              }}>
                <Icon name={f.icon} size={13} color="var(--text-muted)" />
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 40 }}>
          Prueba Técnica — Fullstack Senior
        </p>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px",
      }}>
        <div style={{ width: "100%", maxWidth: 380 }} className="fade-in">
          {/* Tabs */}
          <div style={{
            display: "flex", background: "var(--bg-surface)",
            borderRadius: "var(--radius-md)", padding: 4,
            border: "1px solid var(--border)", marginBottom: 32,
          }}>
            {["login", "register"].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, height: 36, borderRadius: "var(--radius-sm)",
                  fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s ease",
                  background: tab === t ? "var(--bg-elevated)" : "none",
                  color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
                  border: tab === t ? "1px solid var(--border-strong)" : "1px solid transparent",
                  boxShadow: tab === t ? "var(--shadow-sm)" : "none",
                }}
              >
                {t === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            ))}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>
            {tab === "login" ? "Bienvenido de vuelta" : "Creá tu cuenta"}
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 28 }}>
            {tab === "login"
              ? "Ingresá tus credenciales para continuar"
              : "Completá el formulario para empezar"}
          </p>

          {tab === "register" && (
            <InputField
              label="Nombre completo"
              icon="user"
              placeholder="Juan Pérez"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          )}

          <InputField
            label="Email"
            type="email"
            icon="mail"
            placeholder="hola@ejemplo.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailError(""); }}
            error={emailError}
            success={!emailError && email.includes("@")}
          />

          <InputField
            label="Contraseña"
            type={showPass ? "text" : "password"}
            icon="lock"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            rightAction={
              <button onClick={() => setShowPass(!showPass)} style={{ color: "var(--text-muted)", display: "flex" }}>
                <Icon name={showPass ? "eyeOff" : "eye"} size={16} />
              </button>
            }
          />

          {tab === "login" && (
            <div style={{ textAlign: "right", marginTop: -12, marginBottom: 20 }}>
              <a href="#" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          )}

          <PrimaryButton loading={loading} onClick={handleSubmit}>
            {tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </PrimaryButton>

          <Divider label="o continuá con" style={{ margin: "20px 0" }} />

          {/* OAuth placeholder */}
          <button style={{
            width: "100%", height: 44,
            background: "var(--bg-surface)", border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-md)", color: "var(--text-secondary)",
            fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background 0.15s",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
            {tab === "login" ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
            <button
              onClick={() => setTab(tab === "login" ? "register" : "login")}
              style={{ color: "var(--accent)", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}
            >
              {tab === "login" ? "Registrate" : "Iniciá sesión"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── TOOL CARDS ───────────────────────────────────────────────────────────────
const DateToolCard = () => (
  <div style={{
    display: "inline-flex", flexDirection: "column", gap: 10,
    background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.2)",
    borderRadius: "var(--radius-lg)", padding: "14px 16px",
    minWidth: 200, animation: "fadeIn 0.25s ease both",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div style={{
        width: 26, height: 26, borderRadius: "var(--radius-sm)",
        background: "rgba(129,140,248,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="calendar" size={13} color="var(--tool-date)" />
      </div>
      <span style={{ fontSize: 11, color: "var(--tool-date)", fontWeight: 500, fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>
        current_date
      </span>
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
        Jueves
      </div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
        9 de Abril, 2026
      </div>
    </div>
    <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 6 }}>
      <span>Semana 15</span>
      <span>·</span>
      <span>Día 99 del año</span>
    </div>
  </div>
);

const TimeToolCard = () => (
  <div style={{
    display: "inline-flex", flexDirection: "column", gap: 10,
    background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)",
    borderRadius: "var(--radius-lg)", padding: "14px 16px",
    minWidth: 180, animation: "fadeIn 0.25s ease both",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div style={{
        width: 26, height: 26, borderRadius: "var(--radius-sm)",
        background: "rgba(52,211,153,0.12)", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="clock" size={13} color="var(--tool-time)" />
      </div>
      <span style={{ fontSize: 11, color: "var(--tool-time)", fontWeight: 500, fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>
        current_time
      </span>
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--text-primary)", fontFamily: "'DM Mono', monospace" }}>
        14:32
      </div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
        GMT-3 · Buenos Aires
      </div>
    </div>
    <div style={{
      display: "flex", gap: 4, padding: "4px 8px",
      background: "rgba(52,211,153,0.08)", borderRadius: "var(--radius-sm)",
      width: "fit-content",
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--tool-time)", animation: "pulse 2s infinite", marginTop: 3 }} />
      <span style={{ fontSize: 11, color: "var(--tool-time)" }}>En vivo</span>
    </div>
  </div>
);

const WeatherToolCard = () => (
  <div style={{
    display: "inline-flex", flexDirection: "column", gap: 12,
    background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.2)",
    borderRadius: "var(--radius-lg)", padding: "14px 16px",
    minWidth: 240, animation: "fadeIn 0.25s ease both",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div style={{
        width: 26, height: 26, borderRadius: "var(--radius-sm)",
        background: "rgba(96,165,250,0.12)", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="cloud" size={13} color="var(--tool-weather)" />
      </div>
      <span style={{ fontSize: 11, color: "var(--tool-weather)", fontWeight: 500, fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>
        current_weather
      </span>
    </div>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--text-primary)", lineHeight: 1 }}>
          19°
        </div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
          Parcialmente nublado
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          Buenos Aires, AR
        </div>
      </div>
      <div style={{ fontSize: 40, lineHeight: 1 }}>⛅</div>
    </div>
    <div style={{ display: "flex", gap: 12, paddingTop: 8, borderTop: "1px solid rgba(96,165,250,0.12)" }}>
      {[
        { icon: "thermometer", label: "Sens.", val: "17°" },
        { icon: "droplets", label: "Hum.", val: "72%" },
        { icon: "wind", label: "Viento", val: "14km/h" },
      ].map(m => (
        <div key={m.label} style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{m.label}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{m.val}</div>
        </div>
      ))}
    </div>
  </div>
);

// ─── CHAT MESSAGE ─────────────────────────────────────────────────────────────
const Message = ({ role, content, toolInvocations = [], isStreaming = false, timestamp }) => {
  const isUser = role === "user";
  return (
    <div className="fade-in" style={{
      display: "flex", gap: 12,
      flexDirection: isUser ? "row-reverse" : "row",
      padding: "4px 0",
    }}>
      {/* Avatar */}
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: "var(--radius-md)",
          background: "var(--accent)", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginTop: 2,
        }}>
          <Icon name="sparkle" size={14} color="#fff" />
        </div>
      )}

      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 6, alignItems: isUser ? "flex-end" : "flex-start" }}>
        {/* Tool invocations */}
        {toolInvocations.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {toolInvocations.map((tool, i) => (
              <div key={i}>
                {tool === "date" && <DateToolCard />}
                {tool === "time" && <TimeToolCard />}
                {tool === "weather" && <WeatherToolCard />}
              </div>
            ))}
          </div>
        )}

        {/* Text bubble */}
        {content && (
          <div style={{
            padding: isUser ? "10px 14px" : "12px 16px",
            background: isUser ? "var(--accent)" : "var(--bg-elevated)",
            borderRadius: isUser
              ? "var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)"
              : "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)",
            border: isUser ? "none" : "1px solid var(--border)",
            fontSize: 14, lineHeight: 1.65,
            color: isUser ? "#fff" : "var(--text-primary)",
            boxShadow: isUser ? "0 2px 8px rgba(99,102,241,0.25)" : "none",
          }} className={isStreaming ? "cursor-blink" : ""}>
            {content}
          </div>
        )}

        {timestamp && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", paddingLeft: 4 }}>
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── SIDEBAR CHAT ITEM ────────────────────────────────────────────────────────
const ChatItem = ({ title, preview, time, isActive, isPinned, isSelected, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "10px 12px", borderRadius: "var(--radius-md)",
        background: isActive ? "var(--bg-overlay)" : hovered ? "var(--bg-hover)" : "transparent",
        border: `1px solid ${isActive ? "var(--border-strong)" : "transparent"}`,
        cursor: "pointer", transition: "all 0.12s ease",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            {isPinned && <Icon name="pin" size={11} color="var(--accent)" />}
            <span style={{
              fontSize: 13, fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              display: "block",
            }}>
              {title}
            </span>
          </div>
          <span style={{
            fontSize: 12, color: "var(--text-muted)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            display: "block",
          }}>
            {preview}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{time}</span>
          {(hovered || isActive) && (
            <div style={{ display: "flex", gap: 2 }}>
              {[
                { icon: "pin", title: "Anclar" },
                { icon: "edit", title: "Renombrar" },
                { icon: "trash", title: "Eliminar" },
              ].map(a => (
                <button
                  key={a.icon}
                  title={a.title}
                  onClick={e => e.stopPropagation()}
                  style={{
                    width: 24, height: 24, borderRadius: "var(--radius-sm)",
                    background: "var(--bg-surface)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: a.icon === "trash" ? "var(--danger)" : "var(--text-muted)",
                    transition: "all 0.1s",
                  }}
                >
                  <Icon name={a.icon} size={11} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {isActive && (
        <div style={{
          position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
          width: 2, height: "60%", background: "var(--accent)",
          borderRadius: "0 2px 2px 0",
        }} />
      )}
    </div>
  );
};

// ─── CHAT SCREEN ──────────────────────────────────────────────────────────────
const CHATS = [
  { id: 1, title: "¿Qué tiempo hace hoy?", preview: "Consultá el clima actual en...", time: "14:31", isPinned: true },
  { id: 2, title: "Resumen ejecutivo Q1", preview: "Necesito un resumen de...", time: "11:20", isPinned: true },
  { id: 3, title: "Ideas para el README", preview: "Dame ideas para documentar...", time: "Ayer" },
  { id: 4, title: "Plan de arquitectura", preview: "Turborepo + tRPC + Hono...", time: "Ayer" },
  { id: 5, title: "Revisión de PRs", preview: "¿Podés revisar este código?", time: "Mar" },
  { id: 6, title: "Deploy en Vercel", preview: "Cómo configurar edge...", time: "Mar" },
];

const MESSAGES = [
  { role: "user", content: "¿Qué tiempo hace hoy en Buenos Aires? También decime la hora y la fecha.", timestamp: "14:30" },
  { role: "assistant", content: null, toolInvocations: ["date", "time", "weather"], timestamp: null },
  { role: "assistant", content: "¡Acá tenés toda la info! Hoy es un día nublado con 19°C en Buenos Aires. La sensación térmica es de 17° con vientos del suroeste. Si salís, llevate algo liviano por si refresca más tarde.", timestamp: "14:31" },
  { role: "user", content: "Perfecto, ¿y mañana?", timestamp: "14:32" },
  { role: "assistant", content: "Para el pronóstico de mañana necesitaría una tool de forecast extendido que aún no está conectada.", isStreaming: true, timestamp: null },
];

const ChatScreen = () => {
  const [activeChat, setActiveChat] = useState(1);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const filteredChats = CHATS.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(c => c.isPinned);
  const recentChats = filteredChats.filter(c => !c.isPinned);

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-base)", overflow: "hidden" }}>

      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{
          width: 260, background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          flexShrink: 0,
        }} className="slide-in">

          {/* Sidebar header */}
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "var(--radius-md)",
                  background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name="sparkle" size={14} color="#fff" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em" }}>Helios</span>
              </div>
              <button
                onClick={() => {}}
                style={{
                  width: 32, height: 32, borderRadius: "var(--radius-md)",
                  background: "var(--accent)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                }}
                title="Nuevo chat"
              >
                <Icon name="plus" size={16} color="#fff" />
              </button>
            </div>

            {/* Search */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)", padding: "7px 12px",
            }}>
              <Icon name="search" size={14} color="var(--text-muted)" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar chats…"
                style={{
                  background: "none", border: "none", flex: 1,
                  color: "var(--text-primary)", fontSize: 13,
                }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ color: "var(--text-muted)", display: "flex" }}>
                  <Icon name="x" size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Chat list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
            {pinnedChats.length > 0 && (
              <>
                <div style={{ padding: "6px 8px 4px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Anclados
                </div>
                {pinnedChats.map(c => (
                  <ChatItem key={c.id} {...c} isActive={activeChat === c.id} onClick={() => setActiveChat(c.id)} />
                ))}
                <div style={{ height: 1, background: "var(--border)", margin: "8px 4px" }} />
              </>
            )}

            {recentChats.length > 0 && (
              <>
                <div style={{ padding: "6px 8px 4px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Recientes
                </div>
                {recentChats.map(c => (
                  <ChatItem key={c.id} {...c} isActive={activeChat === c.id} onClick={() => setActiveChat(c.id)} />
                ))}
              </>
            )}

            {filteredChats.length === 0 && (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <Icon name="search" size={24} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>Sin resultados</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Intentá con otro término</div>
              </div>
            )}

            {/* Infinite scroll loader */}
            <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 8px" }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: "var(--text-muted)",
                    animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Topbar */}
        <div style={{
          height: 56, padding: "0 20px",
          display: "flex", alignItems: "center", gap: 12,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-surface)", flexShrink: 0,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: 32, height: 32, borderRadius: "var(--radius-md)",
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-secondary)",
            }}
          >
            <Icon name="menu" size={15} />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {CHATS.find(c => c.id === activeChat)?.title || "Chat"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Badge color="success">
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)" }} />
              Conectado
            </Badge>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
              ER
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {MESSAGES.map((msg, i) => (
            <Message key={i} {...msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div style={{
          padding: "12px 20px 16px",
          borderTop: "1px solid var(--border)",
          background: "var(--bg-surface)",
          flexShrink: 0,
        }}>
          {/* Tool badges */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>Tools:</span>
            {[
              { label: "Fecha", color: "date", icon: "calendar" },
              { label: "Hora", color: "time", icon: "clock" },
              { label: "Clima", color: "weather", icon: "cloud" },
            ].map(t => (
              <Badge key={t.label} color={t.color}>
                <Icon name={t.icon} size={10} />
                {t.label}
              </Badge>
            ))}
          </div>

          <div style={{
            display: "flex", gap: 10, alignItems: "flex-end",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-lg)", padding: "10px 14px",
            transition: "border-color 0.15s",
          }}>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Escribí tu mensaje…"
              rows={1}
              style={{
                flex: 1, background: "none", border: "none",
                color: "var(--text-primary)", fontSize: 14, lineHeight: 1.6,
                resize: "none", maxHeight: 120, overflowY: "auto",
              }}
            />
            <button
              style={{
                width: 36, height: 36, borderRadius: "var(--radius-md)",
                background: message.trim() ? "var(--accent)" : "var(--bg-overlay)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.15s",
                boxShadow: message.trim() ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
              }}
            >
              <Icon name="send" size={15} color={message.trim() ? "#fff" : "var(--text-muted)"} />
            </button>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
            Helios puede cometer errores. Verificá la información importante.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── DESIGN SYSTEM REFERENCE ─────────────────────────────────────────────────
const DesignSystem = () => {
  const colors = [
    { name: "bg-base", val: "#0a0a0f", label: "Base" },
    { name: "bg-surface", val: "#111118", label: "Surface" },
    { name: "bg-elevated", val: "#18181f", label: "Elevated" },
    { name: "accent", val: "#6366f1", label: "Accent" },
    { name: "tool-date", val: "#818cf8", label: "Tool Date" },
    { name: "tool-time", val: "#34d399", label: "Tool Time" },
    { name: "tool-weather", val: "#60a5fa", label: "Tool Weather" },
    { name: "danger", val: "#ef4444", label: "Danger" },
    { name: "success", val: "#22c55e", label: "Success" },
  ];

  return (
    <div style={{ background: "var(--bg-base)", padding: 32, minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 6 }}>
          Design System — Helios
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 40, fontSize: 14 }}>
          Referencia visual para la implementación con HeroUI
        </p>

        {/* Colors */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
            Paleta de Colores
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {colors.map(c => (
              <div key={c.name} style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "var(--radius-md)",
                  background: c.val, border: "1px solid var(--border-strong)",
                  boxShadow: "var(--shadow-sm)",
                }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>{c.label}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{c.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
            Tipografía
          </h3>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "H1", size: 32, weight: 700, tracking: "-0.03em", text: "Título principal" },
              { label: "H2", size: 24, weight: 700, tracking: "-0.02em", text: "Título secundario" },
              { label: "Body", size: 14, weight: 400, tracking: "0", text: "Texto de cuerpo — DM Sans 14px/400" },
              { label: "Small", size: 12, weight: 400, tracking: "0", text: "Texto pequeño — DM Sans 12px" },
              { label: "Mono", size: 12, weight: 500, tracking: "0.05em", text: "current_date — DM Mono 12px", mono: true },
              { label: "Label", size: 11, weight: 600, tracking: "0.06em", text: "ETIQUETA", upper: true },
            ].map(t => (
              <div key={t.label} style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", width: 36, flexShrink: 0 }}>{t.label}</span>
                <span style={{
                  fontSize: t.size, fontWeight: t.weight, letterSpacing: t.tracking,
                  fontFamily: t.mono ? "'DM Mono', monospace" : "'DM Sans', sans-serif",
                  textTransform: t.upper ? "uppercase" : "none",
                  color: "var(--text-primary)",
                }}>
                  {t.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tool Cards */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
            Tool Cards
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <DateToolCard />
            <TimeToolCard />
            <WeatherToolCard />
          </div>
        </div>

        {/* Spacing scale */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
            Spacing Scale (4px base)
          </h3>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
            {[4, 8, 12, 16, 20, 24, 32, 40, 48].map(s => (
              <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 20, height: s, background: "var(--accent)", borderRadius: 2, opacity: 0.7 }} />
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Border radius */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
            Border Radius
          </h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "sm", val: 6 }, { label: "md", val: 10 }, { label: "lg", val: 14 },
              { label: "xl", val: 20 }, { label: "full", val: 9999 },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 48, height: 48, background: "var(--bg-elevated)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: r.val,
                }} />
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("chat");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <GlobalStyles />

      {/* Nav tabs */}
      <div style={{
        position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)",
        display: "flex", background: "rgba(17,17,24,0.9)", backdropFilter: "blur(12px)",
        border: "1px solid var(--border-strong)", borderRadius: "var(--radius-full)",
        padding: 4, gap: 2, zIndex: 1000,
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      }}>
        {[
          { id: "auth", label: "/auth" },
          { id: "chat", label: "/chat" },
          { id: "design", label: "Design System" },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setScreen(s.id)}
            style={{
              padding: "6px 16px", borderRadius: "var(--radius-full)",
              background: screen === s.id ? "var(--accent)" : "transparent",
              color: screen === s.id ? "#fff" : "var(--text-muted)",
              fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s ease",
              boxShadow: screen === s.id ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ paddingTop: screen === "auth" || screen === "design" ? 60 : 0 }}>
        {screen === "auth" && <AuthScreen />}
        {screen === "chat" && <ChatScreen />}
        {screen === "design" && <DesignSystem />}
      </div>
    </div>
  );
}
