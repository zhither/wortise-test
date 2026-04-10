/**
 * URL base del API sin barra final.
 * Si `VITE_API_URL` termina en `/`, rutas como `${base}/trpc` quedaban `//trpc` → 308 en Vercel y fallo de CORS.
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
