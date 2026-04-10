import type { MessagePart, ToolName } from "@wortise/shared";
import { toolResultPayloadSchema } from "@wortise/shared";

export function partsToModelContent(parts: MessagePart[]): string {
  return parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("\n");
}

export function historyToCoreMessages(
  input: {
    role: "user" | "assistant" | "system";
    parts: MessagePart[];
  }[],
): { role: "user" | "assistant"; content: string }[] {
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of input) {
    if (m.role === "user") {
      out.push({
        role: "user",
        content: partsToModelContent(m.parts),
      });
    } else if (m.role === "assistant") {
      const text = partsToModelContent(m.parts);
      if (text.trim()) {
        out.push({
          role: "assistant",
          content: text,
        });
      }
    }
  }
  return out;
}

export function buildPartsFromSteps(input: {
  text: string;
  toolResults: {
    toolCallId: string;
    toolName: string;
    result: unknown;
  }[];
}): MessagePart[] {
  const parts: MessagePart[] = [];
  const trimmed = input.text.trim();
  if (trimmed.length > 0) {
    parts.push({ type: "text", text: trimmed });
  }

  for (const tr of input.toolResults) {
    const name = mapToolName(tr.toolName);
    const parsed = toolResultPayloadSchema.safeParse(tr.result);
    if (!parsed.success || !name) {
      parts.push({
        type: "tool_invocation",
        id: tr.toolCallId,
        name: name ?? "currentDate",
        state: "error",
        error: { code: "TOOL_OUTPUT_INVALID", message: "Resultado de herramienta inválido" },
      });
      continue;
    }
    parts.push({
      type: "tool_invocation",
      id: tr.toolCallId,
      name: parsed.data.tool,
      state: "result",
      output: parsed.data,
    });
  }

  return parts;
}

function mapToolName(name: string): ToolName | null {
  if (name === "currentDate" || name === "currentTime" || name === "currentWeather") {
    return name;
  }
  return null;
}
