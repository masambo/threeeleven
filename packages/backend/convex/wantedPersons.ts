import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./auth";

const riskLevel = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("critical"),
);

export const active = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wantedPersons")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    alias: v.optional(v.string()),
    description: v.string(),
    lastKnownLocation: v.optional(v.string()),
    wantedFor: v.string(),
    riskLevel,
    imageIds: v.optional(v.array(v.id("_storage"))),
    imageUrls: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const now = Date.now();
    return await ctx.db.insert("wantedPersons", {
      name: args.name,
      alias: args.alias,
      description: args.description,
      lastKnownLocation: args.lastKnownLocation,
      wantedFor: args.wantedFor,
      riskLevel: args.riskLevel,
      imageIds: args.imageIds ?? [],
      imageUrls: args.imageUrls ?? [],
      isActive: args.isActive ?? true,
      createdByUserId: admin._id,
      publishedAt: now,
      updatedAt: now,
    });
  },
});

export const setActive = mutation({
  args: {
    personId: v.id("wantedPersons"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.personId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.personId);
  },
});
