import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import type { Hono } from "hono";

import type { MessagePart } from "@wortise/shared";
import { streamChatRequestSchema } from "@wortise/shared";
import {
  COLLECTIONS,
  findChatForUser,
  insertMessage,
  touchChatLastMessage,
  updateMessageParts,
} from "@wortise/db";
import type { MessageDoc } from "@wortise/db";

import { buildPartsFromSteps, historyToCoreMessages } from "../ai/parts.js";
import { buildAiTools } from "../ai/tools.js";
import type { AuthInstance } from "../auth.js";
import { env } from "../env.js";
import { getDb } from "../mongo.js";
import {
  DevMockWeatherProvider,
  OpenMeteoWeatherProvider,
} from "../weather/provider.js";
import { respondWithDevMockLlm } from "./chat-stream-mock.js";

export function registerChatStreamRoute(app: Hono, auth: AuthInstance): void {
  app.post("/api/chat/stream", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const userId = session.user.id;

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON" }, 400);
    }

    const extracted = parseChatStreamBody(body);
    if (!extracted) {
      return c.json({ error: "Invalid body" }, 400);
    }
    const { chatId, text } = extracted;

    const db = getDb();
    const chat = await findChatForUser(db, chatId, userId);
    if (!chat) {
      return c.json({ error: "Chat not found" }, 404);
    }

    const messagesCol = db.collection<MessageDoc>(COLLECTIONS.messages);
    const historyDocs = await messagesCol
      .find({ chatId: chat._id, userId: chat.userId })
      .sort({ createdAt: -1 })
      .limit(40)
      .toArray();
    const chronological = historyDocs.reverse();

    const userParts: MessagePart[] = [{ type: "text", text }];
    await insertMessage({
      db,
      chatId,
      userId,
      role: "user",
      parts: userParts,
      status: "complete",
    });
    const now = new Date();
    await touchChatLastMessage({ db, chatId, userId, at: now });

    const e0 = env();
    const openaiKey = e0.OPENAI_API_KEY?.trim();
    /** En desarrollo siempre mock. En producción: OpenAI o LLM_MOCK=1. */
    const useLlmMock = e0.NODE_ENV === "development" || process.env.LLM_MOCK === "1";
    const assistantModel = useLlmMock ? "dev-llm-mock" : e0.OPENAI_MODEL;

    const assistantDoc = await insertMessage({
      db,
      chatId,
      userId,
      role: "assistant",
      parts: [],
      status: "streaming",
      model: assistantModel,
    });

    const historyMessages = historyToCoreMessages(
      chronological.map((m) => ({ role: m.role, parts: m.parts })),
    );

    const useWeatherMock =
      e0.NODE_ENV === "development"
        ? process.env.WEATHER_USE_MOCK !== "0"
        : process.env.WEATHER_USE_MOCK === "1";
    const weatherProvider = useWeatherMock
      ? new DevMockWeatherProvider()
      : new OpenMeteoWeatherProvider();

    const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const tools = buildAiTools({
      weatherProvider,
      defaultTimeZone,
    });

    if (useLlmMock) {
      return respondWithDevMockLlm({
        db,
        userId,
        assistantMessageId: assistantDoc._id.toHexString(),
        userText: text,
        weatherProvider,
        defaultTimeZone,
      });
    }

    const languageModel = createOpenAI({ apiKey: openaiKey! })(e0.OPENAI_MODEL);

    const system =
      "Eres un asistente conciso. " +
      "Si preguntan la fecha de hoy usa currentDate; la hora, currentTime; tiempo meteorológico, temperatura o clima de una ciudad, usa currentWeather (pasa city cuando la mencionen). " +
      "No inventes temperaturas: para clima siempre llama a currentWeather. " +
      "No pegues JSON ni datos crudos de herramientas en el texto: esos resultados se muestran en la UI.";

    const result = streamText({
      model: languageModel,
      system,
      messages: [
        ...historyMessages.map((m) =>
          m.role === "user"
            ? { role: "user" as const, content: m.content }
            : { role: "assistant" as const, content: m.content },
        ),
        { role: "user" as const, content: text },
      ],
      tools,
      maxSteps: 5,
      async onError() {
        await updateMessageParts({
          db,
          messageId: assistantDoc._id.toHexString(),
          userId,
          parts: [
            {
              type: "text",
              text: "No se pudo completar la respuesta. Inténtalo de nuevo.",
            },
          ],
          status: "failed",
        });
      },
      async onFinish(event) {
        let fullText = "";
        const toolResults: { toolCallId: string; toolName: string; result: unknown }[] = [];
        for (const step of event.steps) {
          fullText += step.text;
          for (const tr of step.toolResults) {
            toolResults.push({
              toolCallId: tr.toolCallId,
              toolName: tr.toolName,
              result: tr.result,
            });
          }
        }
        const parts = buildPartsFromSteps({ text: fullText, toolResults });
        await updateMessageParts({
          db,
          messageId: assistantDoc._id.toHexString(),
          userId,
          parts,
          status: "complete",
        });
      },
    });

    return result.toDataStreamResponse();
  });
}

function parseChatStreamBody(
  body: unknown,
): { chatId: string; text: string } | null {
  const direct = streamChatRequestSchema.safeParse(body);
  if (direct.success) {
    const { chatId, text } = direct.data;
    if (typeof chatId !== "string" || typeof text !== "string") return null;
    return { chatId, text };
  }

  if (typeof body !== "object" || body === null) return null;
  const rec = body as Record<string, unknown>;
  const chatId = rec.chatId;
  if (typeof chatId !== "string") return null;
  const messages = rec.messages;
  if (Array.isArray(messages)) {
    const lastUser = [...messages]
      .reverse()
      .find(
        (m): m is Record<string, unknown> =>
          !!m && typeof m === "object" && (m as { role?: string }).role === "user",
      );
    if (!lastUser) return null;
    const text = extractUserTextFromUi(lastUser);
    if (!text) return null;
    return { chatId, text };
  }
  return null;
}

function extractUserTextFromUi(msg: Record<string, unknown>): string {
  if (typeof msg.content === "string") return msg.content.trim();
  const parts = msg.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .filter(
      (p): p is { type: string; text?: string } =>
        !!p && typeof p === "object" && (p as { type?: string }).type === "text",
    )
    .map((p) => (typeof p.text === "string" ? p.text : ""))
    .join("")
    .trim();
}
