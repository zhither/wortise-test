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

/** Misma política que build-app (sin depender de env() validado si el init falla antes). */
function applyShellCors(c: Context): void {
  const raw = process.env.CORS_ORIGIN;
  if (!raw?.trim()) return;
  let allow: string;
  try {
    allow = new URL(raw.trim()).origin;
  } catch {
    return;
  }
  const origin = c.req.header("Origin");
  if (!origin || origin !== allow) return;
  c.header("Access-Control-Allow-Origin", allow);
  c.header("Access-Control-Allow-Credentials", "true");
  c.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie",
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
