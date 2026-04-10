/**
 * Entrada para Vercel (Hono): default export.
 * Capa ligera que hace lazy init de la app: si Mongo/env fallan, no rompe el cold start
 * con 500 opaco; las rutas devuelven JSON con pistas (en dev) o mensaje genérico (prod).
 *
 * Local: `pnpm dev` → `src/server.ts` con @hono/node-server.
 */
import "./load-env.js";

import { Hono } from "hono";

import { buildApp } from "./build-app.js";

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
    const isDev = process.env.NODE_ENV === "development";
    const message =
      isDev && err instanceof Error ? err.message : "Service initialization failed";
    return c.json({ ok: false, error: message }, 503);
  }
});

export default shell;

/** Vercel Hono preset: este archivo debe importar `hono`. */
export type App = Hono;
