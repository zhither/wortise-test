import { HeroUIProvider } from "@heroui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { createQueryClient, createTrpcClient, trpc } from "./lib/trpc";
import { routeTree } from "./routeTree";
import "./styles.css";

const queryClient = createQueryClient();
const trpcClient = createTrpcClient();

const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <HeroUIProvider className="min-h-screen">
          <RouterProvider router={router} />
        </HeroUIProvider>
      </QueryClientProvider>
    </trpc.Provider>
  </StrictMode>,
);
