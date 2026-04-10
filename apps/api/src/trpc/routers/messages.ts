import { messagesListInputSchema } from "@wortise/shared";
import { findChatForUser, listMessagesPage, messageDocToDto } from "@wortise/db";
import { TRPCError } from "@trpc/server";

import { protectedProcedure, router } from "../init.js";

export const messagesRouter = router({
  listByChat: protectedProcedure.input(messagesListInputSchema).query(async ({ ctx, input }) => {
    const chat = await findChatForUser(ctx.db, input.chatId, ctx.userId);
    if (!chat) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Chat not found" });
    }
    const { items, nextCursor } = await listMessagesPage({
      db: ctx.db,
      chatId: input.chatId,
      userId: ctx.userId,
      limit: input.limit,
      cursor: input.cursor,
    });
    return {
      items: items.map((m) => {
        const dto = messageDocToDto(m);
        return {
          _id: dto._id,
          role: dto.role,
          parts: dto.parts,
          status: dto.status,
          createdAt: dto.createdAt,
        };
      }),
      nextCursor,
    };
  }),
});
