import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
import { z } from "zod";

import { authClient } from "../lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Nombre requerido"),
});

/** Tokens alineados a design-mockup.jsx */
const t = {
  bgBase: "#0a0a0f",
  bgSurface: "#111118",
  bgElevated: "#18181f",
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.12)",
  textPrimary: "#f0f0f5",
  textSecondary: "#9090a8",
  textMuted: "#5a5a70",
  accent: "#6366f1",
  danger: "#ef4444",
  success: "#22c55e",
  radiusMd: "10px",
  radiusSm: "6px",
  radiusFull: "9999px",
};

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconEye({ off }: { off?: boolean }) {
  if (off) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconSparkle({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconCloud({ className }: { className?: string }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

function AuthInputField({
  label,
  type = "text",
  icon,
  error,
  success,
  placeholder,
  value,
  onChange,
  rightAction,
}: {
  label: string;
  type?: string;
  icon?: "mail" | "lock" | "user";
  error?: string;
  success?: boolean;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  rightAction?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const isFloated = focused || hasValue;
  const Icon = icon === "mail" ? IconMail : icon === "lock" ? IconLock : icon === "user" ? IconUser : null;

  return (
    <div className="relative mb-5 last:mb-0" style={{ marginBottom: error ? 6 : 20 }}>
      <div
        className="flex min-h-14 items-center gap-2.5 rounded-[14px] px-4 transition-all duration-150 lg:h-[52px] lg:min-h-0 lg:rounded-[10px] lg:px-3.5"
        style={{
          background: focused ? t.bgElevated : t.bgSurface,
          border: `1.5px solid ${
            error ? t.danger : focused ? t.accent : success ? t.success : t.borderStrong
          }`,
          boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
        }}
      >
        {Icon && (
          <span style={{ color: focused ? t.accent : t.textMuted }} className="shrink-0 transition-colors">
            <Icon />
          </span>
        )}
        <div className="relative min-w-0 flex-1">
          <label
            className={`pointer-events-none absolute left-0 transition-all duration-150 ${
              isFloated ? "text-[10px] font-semibold" : "text-[15px] font-normal lg:text-sm"
            }`}
            style={{
              top: isFloated ? 2 : "50%",
              transform: isFloated ? "none" : "translateY(-50%)",
              color: error ? t.danger : focused ? t.accent : t.textMuted,
              letterSpacing: isFloated ? "0.05em" : 0,
              textTransform: isFloated ? "uppercase" : "none",
            }}
          >
            {label}
          </label>
          <input
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={isFloated ? placeholder : ""}
            className="w-full border-0 bg-transparent text-[15px] outline-none lg:text-sm"
            style={{
              color: t.textPrimary,
              paddingTop: isFloated ? 16 : 0,
              paddingBottom: isFloated ? 2 : 0,
              transition: "padding 0.15s ease",
            }}
          />
        </div>
        {rightAction}
        {success && !error && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.success} strokeWidth="1.75">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </div>
      {error && (
        <div className="ml-0.5 mt-1.5 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.danger} strokeWidth="1.75">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <span className="text-xs" style={{ color: t.danger }}>
            {error}
          </span>
        </div>
      )}
    </div>
  );
}

export function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [formError, setFormError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const loginForm = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      setFormError(null);
      const parsed = loginSchema.safeParse(value);
      if (!parsed.success) {
        const msg = parsed.error.flatten().fieldErrors;
        setFormError(
          [msg.email?.[0], msg.password?.[0]].filter(Boolean).join(" · ") || "Datos inválidos",
        );
        return;
      }
      const res = await authClient.signIn.email({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (res.error) {
        setFormError(res.error.message ?? "Error al iniciar sesión");
        return;
      }
      // Sin esto, useSession() en /chat puede seguir sin usuario y el guard te devuelve a /auth.
      await authClient.getSession();
      await navigate({ to: "/chat", replace: true });
    },
  });

  const registerForm = useForm({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      setFormError(null);
      const parsed = registerSchema.safeParse(value);
      if (!parsed.success) {
        const f = parsed.error.flatten().fieldErrors;
        setFormError(
          [f.name?.[0], f.email?.[0], f.password?.[0]].filter(Boolean).join(" · ") ||
            "Datos inválidos",
        );
        return;
      }
      const res = await authClient.signUp.email({
        email: parsed.data.email,
        password: parsed.data.password,
        name: parsed.data.name,
      });
      if (res.error) {
        setFormError(res.error.message ?? "Error al registrarse");
        return;
      }
      await authClient.getSession();
      await navigate({ to: "/chat", replace: true });
    },
  });

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden lg:flex-row"
      style={{ background: t.bgBase, fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Cabecera móvil — design-mockup-mobile (gradiente + título) */}
      <div
        className="relative flex shrink-0 flex-col items-center overflow-hidden px-6 pb-5 pt-6 text-center lg:hidden"
        style={{
          background: "linear-gradient(160deg, rgba(99,102,241,0.18) 0%, transparent 65%)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-14 -top-14 h-[200px] w-[200px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.14), transparent 70%)",
          }}
        />
        <div className="relative z-[1] mb-5 flex flex-wrap items-center justify-center gap-2.5">
          <div
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] shadow-lg"
            style={{ background: t.accent, boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}
          >
            <IconSparkle className="h-4 w-4 text-white" />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: t.textPrimary, letterSpacing: "-0.03em" }}
          >
            Wortise
          </span>
          <span
            className="rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide"
            style={{
              background: "rgba(99,102,241,0.12)",
              color: t.accent,
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            BETA
          </span>
        </div>
        <h1
          className="relative z-[1] whitespace-pre-line text-center text-[26px] font-bold leading-[1.15] tracking-tight"
          style={{ color: t.textPrimary, letterSpacing: "-0.03em" }}
        >
          {tab === "login" ? "Bienvenido\nde vuelta" : "Creá tu\ncuenta"}
        </h1>
        <p
          className="relative z-[1] mt-1.5 max-w-[320px] text-[13px] leading-relaxed"
          style={{ color: t.textSecondary }}
        >
          {tab === "login"
            ? "Ingresá tus credenciales para continuar"
            : "Completá el formulario para empezar"}
        </p>
      </div>

      {/* Panel izquierdo — branding desktop */}
      <div
        className="relative hidden w-full flex-col border-b px-10 py-12 lg:flex lg:w-[45%] lg:border-b-0 lg:border-r lg:py-12"
        style={{ background: t.bgSurface, borderColor: t.border }}
      >
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 h-[400px] w-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-[1] mb-auto flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-[10px]"
            style={{ background: t.accent }}
          >
            <IconSparkle className="text-white" />
          </div>
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: t.textPrimary, letterSpacing: "-0.02em" }}
          >
            Wortise
          </span>
          <span
            className="rounded-full px-2 py-0.5 font-mono text-[11px] font-medium"
            style={{
              background: "rgba(99,102,241,0.12)",
              color: t.accent,
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            Beta
          </span>
        </div>

        <div className="relative z-[1] mt-10 lg:mt-auto">
          <h1
            className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
            style={{ color: t.textPrimary, letterSpacing: "-0.03em" }}
          >
            Tu asistente.
            <br />
            <span style={{ color: t.accent }}>Siempre al día.</span>
          </h1>
          <p className="max-w-[300px] text-[15px] leading-relaxed" style={{ color: t.textSecondary }}>
            IA conversacional con acceso a herramientas reales — clima, fecha, hora y más.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {[
              { Icon: IconCalendar, label: "Fecha actual" },
              { Icon: IconClock, label: "Hora actual" },
              { Icon: IconCloud, label: "Clima en tiempo real" },
              { Icon: IconSparkle, label: "Streaming" },
            ].map(({ Icon, label: chipLabel }) => (
              <div
                key={chipLabel}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
                style={{
                  background: t.bgElevated,
                  borderColor: t.borderStrong,
                  color: t.textSecondary,
                }}
              >
                <span style={{ color: t.textMuted }}>
                  <Icon />
                </span>
                {chipLabel}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-[1] mt-10 text-[11px]" style={{ color: t.textMuted }}>
          Prueba técnica — Fullstack
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-start lg:justify-center lg:px-12 lg:py-12">
        <div className="mx-auto w-full max-w-[380px] flex-1 overflow-y-auto px-5 pb-8 pt-2 lg:flex-none lg:overflow-visible lg:px-0 lg:pb-0 lg:pt-0">
          {/* Tabs segmentados */}
          <div
            className="mb-6 flex w-full max-w-[340px] gap-1 self-center rounded-[10px] border p-1 lg:mb-8 lg:max-w-none lg:rounded-[10px]"
            style={{ background: t.bgSurface, borderColor: t.border }}
          >
            {(["login", "register"] as const).map((tb) => (
              <button
                key={tb}
                type="button"
                onClick={() => {
                  setTab(tb);
                  setFormError(null);
                }}
                className="h-[38px] flex-1 rounded-[10px] text-[13px] font-medium transition-all duration-150 lg:h-9 lg:rounded-[6px]"
                style={{
                  background: tab === tb ? t.bgElevated : "transparent",
                  color: tab === tb ? t.textPrimary : t.textMuted,
                  border:
                    tab === tb ? `1px solid ${t.borderStrong}` : "1px solid transparent",
                  boxShadow: tab === tb ? "0 1px 3px rgba(0,0,0,0.4)" : "none",
                }}
              >
                {tb === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            ))}
          </div>

          <h2
            className="mb-1.5 hidden text-[22px] font-bold tracking-tight lg:block"
            style={{ color: t.textPrimary }}
          >
            {tab === "login" ? "Bienvenido de vuelta" : "Creá tu cuenta"}
          </h2>
          <p className="mb-7 hidden text-[13px] lg:block" style={{ color: t.textSecondary }}>
            {tab === "login"
              ? "Ingresá tus credenciales para continuar"
              : "Completá el formulario para empezar"}
          </p>

          {formError && (
            <div
              className="mb-5 rounded-[10px] border px-3 py-2 text-center text-sm lg:text-left"
              style={{
                borderColor: "rgba(239,68,68,0.3)",
                background: "rgba(239,68,68,0.1)",
                color: "#fca5a5",
              }}
            >
              {formError}
            </div>
          )}

          {tab === "login" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void loginForm.handleSubmit();
              }}
            >
              <loginForm.Field name="email">
                {(field) => (
                  <AuthInputField
                    label="Email"
                    type="email"
                    icon="mail"
                    placeholder="hola@ejemplo.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    success={!formError && field.state.value.includes("@")}
                  />
                )}
              </loginForm.Field>
              <loginForm.Field name="password">
                {(field) => (
                  <AuthInputField
                    label="Contraseña"
                    type={showPass ? "text" : "password"}
                    icon="lock"
                    placeholder="Mínimo 8 caracteres"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rightAction={
                      <button
                        type="button"
                        tabIndex={-1}
                        className="flex text-zinc-500 hover:text-zinc-400"
                        onClick={() => setShowPass((s) => !s)}
                        aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        <IconEye off={showPass} />
                      </button>
                    }
                  />
                )}
              </loginForm.Field>
              <div className="-mt-2 mb-5 text-center lg:text-right">
                <span className="cursor-not-allowed text-[13px] lg:text-xs" style={{ color: t.accent }}>
                  ¿Olvidaste tu contraseña?
                </span>
              </div>
              <button
                type="submit"
                disabled={loginForm.state.isSubmitting}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[14px] text-[15px] font-semibold text-white transition-all duration-150 active:scale-[0.96] active:opacity-[0.85] disabled:cursor-not-allowed lg:h-12 lg:min-h-0 lg:rounded-[10px] lg:text-sm"
                style={{
                  background: loginForm.state.isSubmitting ? t.bgElevated : t.accent,
                  color: loginForm.state.isSubmitting ? t.textMuted : "#fff",
                  boxShadow: loginForm.state.isSubmitting ? "none" : "0 4px 16px rgba(99,102,241,0.3)",
                }}
              >
                {loginForm.state.isSubmitting ? (
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </span>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void registerForm.handleSubmit();
              }}
            >
              <registerForm.Field name="name">
                {(field) => (
                  <AuthInputField
                    label="Nombre completo"
                    icon="user"
                    placeholder="Juan Pérez"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </registerForm.Field>
              <registerForm.Field name="email">
                {(field) => (
                  <AuthInputField
                    label="Email"
                    type="email"
                    icon="mail"
                    placeholder="hola@ejemplo.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    success={!formError && field.state.value.includes("@")}
                  />
                )}
              </registerForm.Field>
              <registerForm.Field name="password">
                {(field) => (
                  <AuthInputField
                    label="Contraseña"
                    type={showPass ? "text" : "password"}
                    icon="lock"
                    placeholder="Mínimo 8 caracteres"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rightAction={
                      <button
                        type="button"
                        tabIndex={-1}
                        className="flex text-zinc-500"
                        onClick={() => setShowPass((s) => !s)}
                        aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        <IconEye off={showPass} />
                      </button>
                    }
                  />
                )}
              </registerForm.Field>
              <button
                type="submit"
                disabled={registerForm.state.isSubmitting}
                className="mt-2 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[14px] text-[15px] font-semibold text-white transition-all duration-150 active:scale-[0.96] active:opacity-[0.85] disabled:cursor-not-allowed lg:h-12 lg:min-h-0 lg:rounded-[10px] lg:text-sm"
                style={{
                  background: registerForm.state.isSubmitting ? t.bgElevated : t.accent,
                  color: registerForm.state.isSubmitting ? t.textMuted : "#fff",
                  boxShadow: registerForm.state.isSubmitting
                    ? "none"
                    : "0 4px 16px rgba(99,102,241,0.3)",
                }}
              >
                {registerForm.state.isSubmitting ? (
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500" />
                    ))}
                  </span>
                ) : (
                  "Crear cuenta"
                )}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-[13px] leading-relaxed lg:text-xs" style={{ color: t.textMuted }}>
            {tab === "login" ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
            <button
              type="button"
              className="font-medium"
              style={{ color: t.accent }}
              onClick={() => {
                setTab(tab === "login" ? "register" : "login");
                setFormError(null);
              }}
            >
              {tab === "login" ? "Registrate" : "Iniciá sesión"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
