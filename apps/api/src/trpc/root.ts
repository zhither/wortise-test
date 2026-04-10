import { router } from "./init.js";
import { chatsRouter } from "./routers/chats.js";
import { messagesRouter } from "./routers/messages.js";
import { sessionRouter } from "./routers/session.js";

export const appRouter = router({
  session: sessionRouter,
  chats: chatsRouter,
  messages: messagesRouter,
});

export type AppRouter = typeof appRouter;
