import { z } from "zod";

export const toolNames = ["currentDate", "currentTime", "currentWeather"] as const;
export type ToolName = (typeof toolNames)[number];

export const toolNameSchema = z.enum(toolNames);

export const currentDateOutputSchema = z.object({
  isoDate: z.string(),
  timezone: z.string(),
});

export const currentTimeOutputSchema = z.object({
  isoTime: z.string(),
  timezone: z.string(),
});

export const currentWeatherOutputSchema = z.object({
  location: z.string(),
  tempC: z.number(),
  condition: z.string(),
  humidity: z.number().optional(),
});

export const toolResultPayloadSchema = z.discriminatedUnion("tool", [
  z.object({ tool: z.literal("currentDate"), data: currentDateOutputSchema }),
  z.object({ tool: z.literal("currentTime"), data: currentTimeOutputSchema }),
  z.object({ tool: z.literal("currentWeather"), data: currentWeatherOutputSchema }),
]);

export type ToolResultPayload = z.infer<typeof toolResultPayloadSchema>;

export const currentDateInputSchema = z.object({
  timezone: z.string().optional(),
});

export const currentTimeInputSchema = z.object({
  timezone: z.string().optional(),
});

export const currentWeatherInputSchema = z.object({
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
