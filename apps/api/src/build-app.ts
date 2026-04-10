import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { createAuth } from "./auth.js";
import { matchCorsOrigin, mergeCredentialsCorsHeaders } from "./cors-helpers.js";
import { env } from "./env.js";
import { connectMongo } from "./mongo.js";
import { registerChatStreamRoute } from "./routes/chat-stream.js";
import { createContextFactory } from "./trpc/context.js";
import { appRouter } from "./trpc/root.js";

export async function buildApp(): Promise<Hono> {
  const e = env();
  const { client, db } = await connectMongo();
  const auth = createAuth(db, client);
  const createContext = createContextFactory(auth);

  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: (origin) => {
        const ok = matchCorsOrigin(origin, e.CORS_ORIGINS);
        if (!ok && origin) {
          console.warn(
            "[cors] origin no permitido:",
            JSON.stringify(origin),
            "→ permitidos:",
            JSON.stringify(e.CORS_ORIGINS),
          );
        }
        return ok;
      },
      // Reflejá los headers del preflight (Better Auth puede pedir más que esta lista fija).
      allowMethods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    }),
  );

  app.use("/trpc/*", trpcServer({ router: appRouter, createContext }));

  app.on(["GET", "POST"], "/api/auth/*", async (c) => {
    const req = c.req.raw;
    const allow = matchCorsOrigin(c.req.header("Origin"), e.CORS_ORIGINS);
    try {
      const res = await auth.handler(req);
      if (!res.ok && e.NODE_ENV === "development") {
        const text = await res.clone().text();
        const path = new URL(req.url).pathname;
        console.error(`[better-auth] ${req.method} ${path} → ${res.status}`, text.slice(0, 800));
      }
      if (allow) return mergeCredentialsCorsHeaders(res, allow);
      return res;
    } catch (err) {
      console.error("[better-auth] handler threw:", err);
      throw err;
    }
  });

  registerChatStreamRoute(app, auth);

  app.get("/health", (c) => c.json({ ok: true }));

  return app;
}
