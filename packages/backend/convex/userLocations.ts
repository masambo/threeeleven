import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./auth";

export const upsertMine = mutation({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    accuracy: v.optional(v.number()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db
      .query("userLocations")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    const now = Date.now();

    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        latitude: args.latitude,
        longitude: args.longitude,
        accuracy: args.accuracy,
        source: args.source,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("userLocations", {
      userId: user._id,
      latitude: args.latitude,
      longitude: args.longitude,
      accuracy: args.accuracy,
      source: args.source,
      updatedAt: now,
    });
  },
});

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return await ctx.db
      .query("userLocations")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
  },
});

export const recentForAdmin = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("userLocations")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(args.limit ?? 100);
  },
});
