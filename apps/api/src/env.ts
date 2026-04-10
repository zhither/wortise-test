import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url(),
  CORS_ORIGIN: z.string().url(),
  /** OpenAI (platform.openai.com). En producción: obligatorio salvo `LLM_MOCK=1`. */
  OPENAI_API_KEY: z.string().optional(),
  /** Producción: `1` = chat sin modelo remoto (heurística + tools). En desarrollo el mock ya va por defecto. */
  LLM_MOCK: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  const data = parsed.data;
  const hasOpenai = Boolean(data.OPENAI_API_KEY?.trim());
  const llmMockFlag = data.LLM_MOCK === "1";
  if (data.NODE_ENV === "production" && !hasOpenai && !llmMockFlag) {
    throw new Error(
      "En producción definí OPENAI_API_KEY o LLM_MOCK=1 (modo demo sin modelo OpenAI).",
    );
  }
  cached = data;
  return cached;
}
