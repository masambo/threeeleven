import { query } from "./_generated/server";

export const publicStatus = query({
  args: {},
  handler: async () => {
    return {
      ok: true,
      service: "3:11 Security Convex",
      checkedAt: Date.now(),
    };
  },
});

export const authenticatedStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    return {
      ok: true,
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email ?? null,
      name: identity.name ?? null,
    };
  },
});
