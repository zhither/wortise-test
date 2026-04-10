import { createVertex } from "@ai-sdk/google-vertex";
import type { LanguageModelV1 } from "ai";

import type { Env } from "../env.js";

/** Convierte private key multilínea pegada en Vercel con `\n` literales. */
function parseGooglePrivateKey(raw: string): string {
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

export function createVertexLanguageModel(e: Env): LanguageModelV1 {
  const project = e.GOOGLE_VERTEX_PROJECT?.trim();
  const clientEmail = e.GOOGLE_CLIENT_EMAIL?.trim();
  const privateKeyRaw = e.GOOGLE_PRIVATE_KEY?.trim();
  if (!project || !clientEmail || !privateKeyRaw) {
    throw new Error("Vertex: faltan GOOGLE_VERTEX_PROJECT, GOOGLE_CLIENT_EMAIL o GOOGLE_PRIVATE_KEY");
  }

  const vertex = createVertex({
    project,
    location: e.GOOGLE_VERTEX_LOCATION.trim(),
    googleAuthOptions: {
      credentials: {
        client_email: clientEmail,
        private_key: parseGooglePrivateKey(privateKeyRaw),
      },
    },
  });

  return vertex(e.VERTEX_GEMINI_MODEL);
}
