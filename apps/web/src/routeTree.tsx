import {
  Outlet,
  createRootRoute,
  createRoute,
  redirect,
} from "@tanstack/react-router";
import { z } from "zod";

import { AuthPage } from "./routes/auth";
import { ChatPage } from "./routes/chat";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/chat" });
  },
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const chatSearchSchema = z.object({
  chatId: z.string().optional(),
  q: z.string().optional(),
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  validateSearch: (search: Record<string, unknown>) => {
    const parsed = chatSearchSchema.safeParse(search);
    return parsed.success ? parsed.data : {};
  },
  component: ChatPage,
});

export const routeTree = rootRoute.addChildren([indexRoute, authRoute, chatRoute]);
