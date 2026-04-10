import { z } from "zod";

import { messagePartSchema, messageRoleSchema, messageStatusSchema } from "./message-parts.js";

export const objectIdStringSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid id");

export const chatSchema = z.object({
  _id: objectIdStringSchema,
  userId: objectIdStringSchema,
  title: z.string().min(1).max(200),
  pinned: z.boolean(),
  pinnedAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastMessageAt: z.coerce.date().nullable().optional(),
});

export type Chat = z.infer<typeof chatSchema>;

export const messageSchema = z.object({
  _id: objectIdStringSchema,
  chatId: objectIdStringSchema,
  userId: objectIdStringSchema,
  role: messageRoleSchema,
  parts: z.array(messagePartSchema),
  status: messageStatusSchema,
  model: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Message = z.infer<typeof messageSchema>;
