import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

import { env } from "./env.js";

import type { Db } from "mongodb";
import type { MongoClient } from "mongodb";

export function createAuth(mongoDb: Db, mongoClient: MongoClient) {
  const e = env();
  const isDev = e.NODE_ENV === "development";
  return betterAuth({
    // Standalone local (sin replica set) no soporta transacciones → 500 en sign-up si quedan en true.
    database: mongodbAdapter(mongoDb, {
      client: mongoClient,
      transaction: false,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    secret: e.BETTER_AUTH_SECRET,
    baseURL: e.BETTER_AUTH_URL,
    trustedOrigins: Array.from(
      new Set([
        ...e.CORS_ORIGINS,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ]),
    ),
    advanced: isDev
      ? {
          // Vite proxy / primer request sin cookie: evita fallos de validación de origen en local.
          disableCSRFCheck: true,
        }
      : undefined,
  });
}

export type AuthInstance = ReturnType<typeof createAuth>;
