import { createDataStreamResponse, formatDataStreamPart } from "ai";

import { updateMessageParts } from "@wortise/db";
import type { ToolResultPayload } from "@wortise/shared";
import type { Db } from "mongodb";

import { buildPartsFromSteps } from "../ai/parts.js";
import { buildAiTools } from "../ai/tools.js";
import type { WeatherProvider } from "../weather/provider.js";

const toolExecOpts = (toolCallId: string) => ({
  toolCallId,
  messages: [] as [],
  abortSignal: undefined as AbortSignal | undefined,
});

type Invocation = {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
};

/**
 * Sin Vertex: ejecuta herramientas por heurística y persiste el mismo formato que streamText.
 */
export async function respondWithDevMockLlm(input: {
  db: Db;
  userId: string;
  assistantMessageId: string;
  userText: string;
  weatherProvider: WeatherProvider;
  defaultTimeZone: string;
}): Promise<Response> {
  const { db, userId, assistantMessageId, userText, weatherProvider, defaultTimeZone } = input;
  const lower = userText.toLowerCase();
  const tools = buildAiTools({ weatherProvider, defaultTimeZone });

  const invocations: Invocation[] = [];
  let n = 0;
  const nextId = () => `mock-${++n}`;

  const wantsDate =
    /\bfecha\b/.test(lower) ||
    /\bqué día\b/.test(lower) ||
    /\bque dia\b/.test(lower) ||
    /\bdate\b/.test(lower) ||
    (/\bhoy\b/.test(lower) && (/\bhora\b/.test(lower) || /\bclima\b|\btiempo\b|\btemperatura\b/.test(lower)));
  const wantsTime = /\bhora\b/.test(lower) || /\btime\b/.test(lower);
  const wantsWeather =
    /\bclima\b/.test(lower) ||
    /\btiempo\b/.test(lower) ||
    /\btemperatura\b/.test(lower) ||
    /\bweather\b/.test(lower);

  if (wantsDate) {
    const toolCallId = nextId();
    const args = { timezone: defaultTimeZone };
    const r = await tools.currentDate.execute(args, toolExecOpts(toolCallId));
    invocations.push({ toolCallId, toolName: "currentDate", args, result: r });
  }
  if (wantsTime) {
    const toolCallId = nextId();
    const args = { timezone: defaultTimeZone };
    const r = await tools.currentTime.execute(args, toolExecOpts(toolCallId));
    invocations.push({ toolCallId, toolName: "currentTime", args, result: r });
  }
  if (wantsWeather) {
    const toolCallId = nextId();
    const city = extractCity(userText);
    const args = city ? { city } : {};
    const r = await tools.currentWeather.execute(args, toolExecOpts(toolCallId));
    invocations.push({ toolCallId, toolName: "currentWeather", args, result: r });
  }

  const toolResults = invocations.map((i) => ({
    toolCallId: i.toolCallId,
    toolName: i.toolName,
    result: i.result,
  }));

  const summary =
    invocations.length === 0
      ? "Modo demo sin API de lenguaje: no detecté pedidos de fecha, hora o clima. Preguntá por ejemplo por el clima en una ciudad o la hora actual."
      : buildHumanSummary(invocations.map((i) => i.result as ToolResultPayload));

  const parts = buildPartsFromSteps({ text: summary, toolResults });

  await updateMessageParts({
    db,
    messageId: assistantMessageId,
    userId,
    parts,
    status: "complete",
  });

  const usage = { promptTokens: 0, completionTokens: 0 };

  return createDataStreamResponse({
    execute: ({ write }) => {
      write(formatDataStreamPart("start_step", { messageId: assistantMessageId }));
      for (const inv of invocations) {
        write(
          formatDataStreamPart("tool_call", {
            toolCallId: inv.toolCallId,
            toolName: inv.toolName,
            args: inv.args,
          }),
        );
        write(
          formatDataStreamPart("tool_result", {
            toolCallId: inv.toolCallId,
            result: inv.result,
          }),
        );
      }
      write(formatDataStreamPart("text", summary));
      write(
        formatDataStreamPart("finish_step", {
          finishReason: "stop",
          isContinued: false,
          usage,
        }),
      );
      write(
        formatDataStreamPart("finish_message", {
          finishReason: "stop",
          usage,
        }),
      );
    },
    onError: (err) => {
      console.error("[chat-stream-mock]", err);
      return err instanceof Error ? err.message : "Error en el stream mock.";
    },
  });
}

function buildHumanSummary(results: ToolResultPayload[]): string {
  const lines: string[] = [];
  for (const r of results) {
    if (r.tool === "currentDate") {
      lines.push(`Fecha (zona ${r.data.timezone}): ${r.data.isoDate}.`);
    } else if (r.tool === "currentTime") {
      lines.push(`Hora (zona ${r.data.timezone}): ${r.data.isoTime}.`);
    } else if (r.tool === "currentWeather") {
      lines.push(
        `Clima en ${r.data.location}: ${r.data.tempC}°C, ${r.data.condition}.` +
          (r.data.humidity != null ? ` Humedad: ${r.data.humidity}%.` : ""),
      );
    }
  }
  if (lines.length === 0) return "";
  return `${lines.join("\n")}\n\nLos datos también aparecen en las tarjetas de herramientas.`;
}

function extractCity(text: string): string | undefined {
  const m = text.match(/\b(?:en|de|para)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s]{1,48})/i);
  if (m?.[1]) return m[1].replace(/\s*[?.!,].*$/, "").trim();
  const known = [
    "Buenos Aires",
    "Madrid",
    "Barcelona",
    "Montevideo",
    "Ciudad de México",
    "Bogotá",
    "Santiago",
  ];
  for (const k of known) {
    if (text.includes(k)) return k;
  }
  return undefined;
}
