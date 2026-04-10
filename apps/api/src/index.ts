import "./load-env.js";

import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { createAuth } from "./auth.js";
import { env } from "./env.js";
import { connectMongo } from "./mongo.js";
import { registerChatStreamRoute } from "./routes/chat-stream.js";
import { createContextFactory } from "./trpc/context.js";
import { appRouter } from "./trpc/root.js";

env();

const { client, db } = await connectMongo();
const auth = createAuth(db, client);
const createContext = createContextFactory(auth);

const app = new Hono();

const e = env();
app.use(
  "*",
  cors({
    origin: e.CORS_ORIGIN,
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true,
  }),
);

app.use("/trpc/*", trpcServer({ router: appRouter, createContext }));

app.on(["GET", "POST", "OPTIONS"], "/api/auth/*", async (c) => {
  const req = c.req.raw;
  try {
    const res = await auth.handler(req);
    if (!res.ok && e.NODE_ENV === "development") {
      const text = await res.clone().text();
      const path = new URL(req.url).pathname;
      console.error(`[better-auth] ${req.method} ${path} → ${res.status}`, text.slice(0, 800));
    }
    return res;
  } catch (err) {
    console.error("[better-auth] handler threw:", err);
    throw err;
  }
});

registerChatStreamRoute(app, auth);

app.get("/health", (c) => c.json({ ok: true }));

const port = e.PORT;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`API listening on http://localhost:${info.port}`);
  },
);
