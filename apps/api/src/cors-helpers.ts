/**
 * Better Auth devuelve `Response` nativo; Hono a veces no fusiona esos headers
 * con los que el middleware `cors` escribió en el contexto → el navegador ve sin CORS.
 */
export function mergeCredentialsCorsHeaders(
  upstream: Response,
  allowOrigin: string,
): Response {
  const headers = new Headers(upstream.headers);
  headers.set("Access-Control-Allow-Origin", allowOrigin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.append("Vary", "Origin");
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

export function matchCorsOrigin(
  originHeader: string | undefined,
  allowed: readonly string[],
): string | null {
  if (!originHeader?.trim()) return null;
  const o = originHeader.trim();
  return allowed.includes(o) ? o : null;
}
