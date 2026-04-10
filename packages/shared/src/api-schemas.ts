import { z } from "zod";

import { objectIdStringSchema } from "./domain.js";
import { messagePartSchema } from "./message-parts.js";

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
});

export const chatsListInputSchema = paginationSchema.extend({
  cursor: z.string().optional(),
  query: z.string().max(200).optional(),
});

export const chatsListOutputSchema = z.object({
  items: z.array(
    z.object({
      _id: objectIdStringSchema,
      title: z.string(),
      pinned: z.boolean(),
      pinnedAt: z.coerce.date().nullable().optional(),
      lastMessageAt: z.coerce.date().nullable().optional(),
      updatedAt: z.coerce.date(),
    }),
  ),
  nextCursor: z.string().nullable(),
});

export const chatCreateInputSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export const chatSingleOutputSchema = z.object({
  chat: z.object({
    _id: objectIdStringSchema,
    title: z.string(),
    pinned: z.boolean(),
    lastMessageAt: z.coerce.date().nullable().optional(),
    updatedAt: z.coerce.date(),
  }),
});

export const chatRenameInputSchema = z.object({
  chatId: objectIdStringSchema,
  title: z.string().min(1).max(200),
});

export const chatPinInputSchema = z.object({
  chatId: objectIdStringSchema,
  pinned: z.boolean(),
});

export const chatDeleteInputSchema = z.object({
  chatId: objectIdStringSchema,
});

export const chatGetByIdInputSchema = z.object({
  chatId: objectIdStringSchema,
});

export const messagesListInputSchema = paginationSchema.extend({
  chatId: objectIdStringSchema,
  cursor: z.string().optional(),
});

export const messagesListOutputSchema = z.object({
  items: z.array(
    z.object({
      _id: objectIdStringSchema,
      role: z.enum(["user", "assistant", "system"]),
      parts: z.array(messagePartSchema),
      status: z.enum(["streaming", "complete", "failed"]),
      createdAt: z.coerce.date(),
    }),
  ),
  nextCursor: z.string().nullable(),
});

export const messageCreateUserInputSchema = z.object({
  chatId: objectIdStringSchema,
  text: z.string().min(1).max(16000),
});

export const streamChatRequestSchema = z.object({
  chatId: objectIdStringSchema,
  text: z.string().min(1).max(16000),
});
