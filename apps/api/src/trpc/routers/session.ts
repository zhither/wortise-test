import { publicProcedure, router } from "../init.js";

export const sessionRouter = router({
  me: publicProcedure.query(({ ctx }) => {
    return {
      user: ctx.session?.user ?? null,
    };
  }),
});
