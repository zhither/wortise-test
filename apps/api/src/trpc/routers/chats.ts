import {
  chatCreateInputSchema,
  chatDeleteInputSchema,
  chatGetByIdInputSchema,
  chatPinInputSchema,
  chatRenameInputSchema,
  chatsListInputSchema,
} from "@wortise/shared";
import {
  chatDocToDto,
  createChat,
  deleteChatCascade,
  findChatForUser,
  listChatsPage,
  renameChat,
  setChatPinned,
} from "@wortise/db";
import { TRPCError } from "@trpc/server";

import { protectedProcedure, router } from "../init.js";

export const chatsRouter = router({
  list: protectedProcedure.input(chatsListInputSchema).query(async ({ ctx, input }) => {
    const { items, nextCursor } = await listChatsPage({
      db: ctx.db,
      userId: ctx.userId,
      limit: input.limit,
      cursor: input.cursor,
      titleQuery: input.query,
    });
    return {
      items: items.map((c) => ({
        _id: c._id.toHexString(),
        title: c.title,
        pinned: c.pinned,
        pinnedAt: c.pinnedAt,
        lastMessageAt: c.lastMessageAt,
        updatedAt: c.updatedAt,
      })),
      nextCursor,
    };
  }),

  create: protectedProcedure.input(chatCreateInputSchema).mutation(async ({ ctx, input }) => {
    const title = input.title?.trim() || "Nuevo chat";
    const doc = await createChat({ db: ctx.db, userId: ctx.userId, title });
    return { chat: chatDocToDto(doc) };
  }),

  rename: protectedProcedure.input(chatRenameInputSchema).mutation(async ({ ctx, input }) => {
    const doc = await renameChat({
      db: ctx.db,
      chatId: input.chatId,
      userId: ctx.userId,
      title: input.title,
    });
    if (!doc) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Chat not found" });
    }
    return { chat: chatDocToDto(doc) };
  }),

  pin: protectedProcedure.input(chatPinInputSchema).mutation(async ({ ctx, input }) => {
    const doc = await setChatPinned({
      db: ctx.db,
      chatId: input.chatId,
      userId: ctx.userId,
      pinned: input.pinned,
    });
    if (!doc) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Chat not found" });
    }
    return { chat: chatDocToDto(doc) };
  }),

  delete: protectedProcedure.input(chatDeleteInputSchema).mutation(async ({ ctx, input }) => {
    const ok = await deleteChatCascade({
      db: ctx.db,
      chatId: input.chatId,
      userId: ctx.userId,
    });
    return { ok };
  }),

  getById: protectedProcedure.input(chatGetByIdInputSchema).query(async ({ ctx, input }) => {
    const doc = await findChatForUser(ctx.db, input.chatId, ctx.userId);
    if (!doc) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Chat not found" });
    }
    return { chat: chatDocToDto(doc) };
  }),
});
