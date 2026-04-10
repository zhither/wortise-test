import "./load-env.js";

import { serve } from "@hono/node-server";

import { buildApp } from "./build-app.js";
import { env } from "./env.js";

env();
const app = await buildApp();
const e = env();

serve(
  {
    fetch: app.fetch,
    port: e.PORT,
  },
  (info) => {
    console.log(`API listening on http://localhost:${info.port}`);
  },
);
