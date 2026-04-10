import type { Context } from "hono";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

import type { AuthInstance } from "../auth.js";
import { getDb } from "../mongo.js";

export type TrpcContext = {
  db: ReturnType<typeof getDb>;
  auth: AuthInstance;
  userId: string | null;
  session: { user: { id: string; email: string; name: string } } | null;
};

export function createContextFactory(auth: AuthInstance) {
  return async function createContext(
    opts: FetchCreateContextFnOptions,
    _c: Context,
  ): Promise<TrpcContext> {
    const db = getDb();
    const session = await auth.api.getSession({
      headers: opts.req.headers,
    });
    const userId = session?.user?.id ?? null;
    return {
      db,
      auth,
      userId,
      session: session
        ? {
            user: {
              id: session.user.id,
              email: session.user.email,
              name: session.user.name,
            },
          }
        : null,
    };
  };
}
