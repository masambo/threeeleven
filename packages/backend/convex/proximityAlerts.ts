import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./auth";

const status = v.union(
  v.literal("pending"),
  v.literal("delivered"),
  v.literal("dismissed"),
);

export const mine = query({
  args: {
    status: v.optional(status),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await ctx.db
      .query("proximityAlerts")
      .withIndex("by_targetUserId_and_status", (q) =>
        q.eq("targetUserId", user._id).eq("status", args.status ?? "pending"),
      )
      .take(args.limit ?? 50);
  },
});

export const create = mutation({
  args: {
    crimeReportId: v.id("crimeReports"),
    targetUserId: v.id("users"),
    distanceMeters: v.number(),
    radiusMeters: v.number(),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("proximityAlerts")
      .withIndex("by_crimeReportId_and_targetUserId", (q) =>
        q.eq("crimeReportId", args.crimeReportId).eq("targetUserId", args.targetUserId),
      )
      .unique();
    if (existing !== null) {
      return existing._id;
    }

    return await ctx.db.insert("proximityAlerts", {
      crimeReportId: args.crimeReportId,
      targetUserId: args.targetUserId,
      distanceMeters: args.distanceMeters,
      radiusMeters: args.radiusMeters,
      status: "pending",
      metadata: args.metadata,
    });
  },
});

export const updateStatus = mutation({
  args: {
    proximityAlertId: v.id("proximityAlerts"),
    status,
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const alert = await ctx.db.get(args.proximityAlertId);
    if (alert === null) {
      return null;
    }
    if (alert.targetUserId !== user._id && user.role !== "admin" && user.role !== "super_admin") {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.proximityAlertId, {
      status: args.status,
      deliveredAt: args.status === "delivered" ? Date.now() : alert.deliveredAt,
    });
    return await ctx.db.get(args.proximityAlertId);
  },
});
