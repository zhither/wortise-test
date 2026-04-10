import { z } from "zod";

import {
  toolNameSchema,
  toolResultPayloadSchema,
} from "./tools.js";

export const messageRoleSchema = z.enum(["user", "assistant", "system"]);
export type MessageRole = z.infer<typeof messageRoleSchema>;

export const messageStatusSchema = z.enum(["streaming", "complete", "failed"]);
export type MessageStatus = z.infer<typeof messageStatusSchema>;

export const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

export const toolInvocationStateSchema = z.enum(["pending", "result", "error"]);

export const toolErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const toolInvocationPartSchema = z.object({
  type: z.literal("tool_invocation"),
  id: z.string(),
  name: toolNameSchema,
  state: toolInvocationStateSchema,
  input: z.unknown().optional(),
  output: toolResultPayloadSchema.optional(),
  error: toolErrorSchema.optional(),
});

export const messagePartSchema = z.discriminatedUnion("type", [
  textPartSchema,
  toolInvocationPartSchema,
]);

export type MessagePart = z.infer<typeof messagePartSchema>;
export type TextPart = z.infer<typeof textPartSchema>;
export type ToolInvocationPart = z.infer<typeof toolInvocationPartSchema>;
