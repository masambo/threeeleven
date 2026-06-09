import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSuperAdmin } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("regions").withIndex("by_name").take(100);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    centerLatitude: v.optional(v.number()),
    centerLongitude: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const admin = await requireSuperAdmin(ctx);
    return await ctx.db.insert("regions", {
      name: args.name,
      description: args.description,
      centerLatitude: args.centerLatitude,
      centerLongitude: args.centerLongitude,
      metadata: args.metadata,
      createdByUserId: admin._id,
      updatedAt: Date.now(),
    });
  },
});
