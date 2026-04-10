import { z } from "zod";

/** Origen del navegador sin barra final; evita fallos si en Vercel se pone `https://web.com/` */
function normalizeOriginUrl(href: string): string {
  return new URL(href.trim()).origin;
}

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url(),
  /** Una o varias URLs separadas por coma (ej. prod + preview de Vercel). */
  CORS_ORIGIN: z.string().min(1),
  /** `1` = LLM local heurístico (sin Vertex). En dev, si no ponés `LLM_MOCK=0`, también va en mock. */
  LLM_MOCK: z.string().optional(),

  /** Google Cloud project id (ej. el de la service account JSON). */
  GOOGLE_VERTEX_PROJECT: z.string().optional(),
  /** Región Vertex (ej. us-central1, europe-west1). */
  GOOGLE_VERTEX_LOCATION: z.string().default("us-central1"),
  GOOGLE_CLIENT_EMAIL: z.string().optional(),
  /** PEM multilínea; en Vercel podés usar \n como dos caracteres entre líneas. */
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  /** Modelo Gemini en Vertex (ver IDs en @ai-sdk/google-vertex). */
  VERTEX_GEMINI_MODEL: z.string().default("gemini-2.0-flash-001"),
});

export type Env = Omit<z.infer<typeof schema>, "CORS_ORIGIN"> & {
  CORS_ORIGIN: string;
  CORS_ORIGINS: string[];
};

let cached: Env | undefined;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const detail = JSON.stringify(flat);
    console.error("[env] validation failed:", detail);
    throw new Error(`Invalid environment variables: ${detail}`);
  }
  const raw = parsed.data;
  let corsOrigins: string[];
  try {
    corsOrigins = raw.CORS_ORIGIN.split(/,/u)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => normalizeOriginUrl(s));
  } catch {
    throw new Error("CORS_ORIGIN: cada entrada debe ser una URL válida (https://…)");
  }
  if (corsOrigins.length === 0) {
    throw new Error("CORS_ORIGIN vacío");
  }

  const hasVertex =
    Boolean(raw.GOOGLE_VERTEX_PROJECT?.trim()) &&
    Boolean(raw.GOOGLE_CLIENT_EMAIL?.trim()) &&
    Boolean(raw.GOOGLE_PRIVATE_KEY?.trim());
  const llmMockFlag = raw.LLM_MOCK === "1";

  if (raw.LLM_MOCK === "0" && !hasVertex) {
    throw new Error(
      "LLM_MOCK=0 requiere GOOGLE_VERTEX_PROJECT, GOOGLE_CLIENT_EMAIL y GOOGLE_PRIVATE_KEY.",
    );
  }

  if (raw.NODE_ENV === "production" && !llmMockFlag) {
    if (!hasVertex) {
      throw new Error(
        "En producción definí credenciales Vertex (GOOGLE_VERTEX_PROJECT, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY) o LLM_MOCK=1.",
      );
    }
  }

  const data: Env = {
    ...raw,
    BETTER_AUTH_URL: normalizeOriginUrl(raw.BETTER_AUTH_URL),
    CORS_ORIGIN: corsOrigins[0],
    CORS_ORIGINS: corsOrigins,
  };

  cached = data;
  return data;
}
