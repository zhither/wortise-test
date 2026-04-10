/**
 * URL base del API sin barra final.
 * Si `VITE_API_URL` termina en `/`, rutas como `${base}/trpc` quedaban `//trpc` → 308 en Vercel y fallo de CORS.
 *
 * En Vercel, si **no** definís `VITE_API_URL`, el build usa mismo origen (`""`) y las rutas `/api` y `/trpc`
 * deben ir al backend vía **rewrites** en `vercel.json` (ver README). Así la cookie de sesión es first-party
 * y funciona en móvil / Safari / incógnito. Si definís `VITE_API_URL` a otro dominio, el login puede fallar
 * por bloqueo de cookies entre sitios.
 */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL?.trim() ?? "";
  if (!raw) return "";
  return raw.replace(/\/+$/u, "");
}

export function getAuthClientBaseUrl(): string {
  const b = getApiBaseUrl();
  if (b) return b;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:5173";
}
