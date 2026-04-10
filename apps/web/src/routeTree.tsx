import {
  Outlet,
  createRootRoute,
  createRoute,
  redirect,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { z } from "zod";

const AuthPage = lazy(() =>
  import("./routes/auth").then((m) => ({ default: m.AuthPage })),
);
const ChatPage = lazy(() =>
  import("./routes/chat").then((m) => ({ default: m.ChatPage })),
);

function RouteShellFallback() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-[#0a0a0f] text-[#9090a8]">
      <p className="text-sm">Cargando…</p>
    </div>
  );
}

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
  component: () => (
    <Suspense fallback={<RouteShellFallback />}>
      <AuthPage />
    </Suspense>
  ),
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
  component: () => (
    <Suspense fallback={<RouteShellFallback />}>
      <ChatPage />
    </Suspense>
  ),
});

export const routeTree = rootRoute.addChildren([indexRoute, authRoute, chatRoute]);
