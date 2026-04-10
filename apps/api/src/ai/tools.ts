import { tool } from "ai";
import { z } from "zod";

import type { ToolResultPayload } from "@wortise/shared";

import type { WeatherProvider } from "../weather/provider.js";

export function buildAiTools(input: {
  weatherProvider: WeatherProvider;
  defaultTimeZone: string;
}) {
  const { weatherProvider, defaultTimeZone } = input;

  return {
    currentDate: tool({
      description:
        "Obtiene la fecha actual en calendario. Úsalo cuando el usuario pregunte por la fecha de hoy.",
      parameters: z.object({
        timezone: z
          .string()
          .optional()
          .describe("IANA timezone, por ejemplo Europe/Madrid"),
      }),
      execute: async ({ timezone }): Promise<ToolResultPayload> => {
        const tz = timezone ?? defaultTimeZone;
        const isoDate = new Intl.DateTimeFormat("en-CA", {
          timeZone: tz,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());
        return { tool: "currentDate", data: { isoDate, timezone: tz } };
      },
    }),

    currentTime: tool({
      description: "Obtiene la hora actual. Úsala cuando pregunten por la hora.",
      parameters: z.object({
        timezone: z.string().optional().describe("IANA timezone"),
      }),
      execute: async ({ timezone }): Promise<ToolResultPayload> => {
        const tz = timezone ?? defaultTimeZone;
        const isoTime = new Intl.DateTimeFormat("en-GB", {
          timeZone: tz,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date());
        return { tool: "currentTime", data: { isoTime, timezone: tz } };
      },
    }),

    currentWeather: tool({
      description:
        "Obtiene el clima actual para una ciudad o coordenadas. No inventes datos; usa esta herramienta.",
      parameters: z.object({
        city: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }),
      execute: async (args): Promise<ToolResultPayload> => {
        const snap = await weatherProvider.getCurrent(args);
        return {
          tool: "currentWeather",
          data: {
            location: snap.location,
            tempC: snap.tempC,
            condition: snap.condition,
            humidity: snap.humidity,
          },
        };
      },
    }),
  };
}
