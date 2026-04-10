/**
 * Entrada para Vercel (Hono): default export del app.
 * Desarrollo local: `pnpm dev` → `src/server.ts` con @hono/node-server.
 */
import "./load-env.js";

import { buildApp } from "./build-app.js";
import { env } from "./env.js";

env();
const app = await buildApp();

export default app;
