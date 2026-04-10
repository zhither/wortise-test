/**
 * Entrada para Vercel (Hono): default export.
 * Capa ligera que hace lazy init de la app: si Mongo/env fallan, no rompe el cold start
 * con 500 opaco; las rutas devuelven JSON con pistas (en dev) o mensaje genérico (prod).
 *
 * Local: `pnpm dev` → `src/server.ts` con @hono/node-server.
 */
import "./load-env.js";

import type { Context } from "hono";
import { Hono } from "hono";

import { buildApp } from "./build-app.js";

/** Orígenes permitidos leyendo `CORS_ORIGIN` crudo (puede ser lista separada por coma). */
function corsOriginsFromProcessEnv(): string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw?.trim()) return [];
  const out: string[] = [];
  for (const part of raw.split(/,/u).map((s) => s.trim()).filter(Boolean)) {
    try {
      out.push(new URL(part).origin);
    } catch {
      /* ignorar entrada inválida */
    }
  }
  return out;
}

/** Misma política que build-app cuando el init falla antes de `env()`. */
function applyShellCors(c: Context): void {
  const allows = corsOriginsFromProcessEnv();
  const origin = c.req.header("Origin");
  if (!origin || !allows.includes(origin)) return;
  c.header("Access-Control-Allow-Origin", origin);
  c.header("Access-Control-Allow-Credentials", "true");
  const requestHeaders = c.req.header("Access-Control-Request-Headers");
  c.header(
    "Access-Control-Allow-Headers",
    requestHeaders ||
      "Content-Type, Authorization, Cookie, X-Requested-With",
  );
  c.header(
    "Access-Control-Allow-Methods",
    "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS",
  );
}

let appPromise: Promise<Hono> | null = null;

function getApp(): Promise<Hono> {
  if (!appPromise) {
    appPromise = buildApp().catch((err) => {
      appPromise = null;
      throw err;
    });
  }
  return appPromise;
}

const shell = new Hono();

shell.get("/", (c) =>
  c.json({
    ok: true,
    service: "wortise-api",
    health: "/health",
  }),
);

shell.all("*", async (c) => {
  try {
    const app = await getApp();
    return app.fetch(c.req.raw);
  } catch (err) {
    console.error("[wortise-api] init or fetch failed:", err);
    applyShellCors(c);
    if (c.req.method === "OPTIONS") {
      return c.body(null, 204);
    }
    const isDev = process.env.NODE_ENV === "development";
    const message =
      isDev && err instanceof Error ? err.message : "Service initialization failed";
    return c.json({ ok: false, error: message }, 503);
  }
});

export default shell;

/** Vercel Hono preset: este archivo debe importar `hono`. */
export type App = Hono;
