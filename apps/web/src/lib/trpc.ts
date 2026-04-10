import type { AppRouter } from "@wortise/api/trpc";
import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();

const base = import.meta.env.VITE_API_URL ?? "";

export function createTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${base}/trpc`,
        fetch(url, opts) {
          return fetch(url, {
            ...opts,
            credentials: "include",
          });
        },
      }),
    ],
  });
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
  });
}
