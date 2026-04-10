/**
 * Entrada para Vercel (Hono): default export del app.
 * Desarrollo local: `pnpm dev` → `src/server.ts` con @hono/node-server.
 *
 * Vercel exige que este archivo importe `hono` en texto plano (no solo vía build-app).
 */
import "./load-env.js";

import { Hono } from "hono";
import { buildApp } from "./build-app.js";
import { env } from "./env.js";

env();
const app = await buildApp();

export default app;

/** Satisfies Vercel static scan + TS “used” (Hono class exists at runtime). */
export type App = Hono;
