import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./auth";
import { notifyActiveUsers } from "./notificationHelpers";

const severity = v.union(
  v.literal("info"),
  v.literal("warning"),
  v.literal("critical"),
);

const priority = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("critical"),
);

export const create = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    message: v.string(),
    regionId: v.optional(v.id("regions")),
    region: v.optional(v.string()),
    city: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    locationDescription: v.optional(v.string()),
    imageIds: v.optional(v.array(v.id("_storage"))),
    imageUrls: v.optional(v.array(v.string())),
    severity,
    priority,
    expiresAt: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const now = Date.now();
    const imageIds = args.imageIds ?? [];
    const imageUrls =
      args.imageUrls ??
      (
        await Promise.all(
          imageIds.map(async (imageId) => await ctx.storage.getUrl(imageId)),
        )
      ).filter((url): url is string => url !== null);

    const alertId = await ctx.db.insert("safetyAlerts", {
      type: args.type,
      title: args.title,
      message: args.message,
      regionId: args.regionId,
      region: args.region,
      city: args.city,
      latitude: args.latitude,
      longitude: args.longitude,
      locationDescription: args.locationDescription,
      imageIds,
      imageUrls,
      severity: args.severity,
      priority: args.priority,
      isActive: true,
      expiresAt: args.expiresAt,
      createdByUserId: admin._id,
      metadata: args.metadata,
      updatedAt: now,
    });

    await notifyActiveUsers(ctx, {
      type: "alert_published",
      title: args.title,
      message: args.message,
      region: args.region,
      relatedEntityId: alertId,
      relatedEntityType: "safetyAlerts",
      actionUrl: "/alerts",
    });

    return alertId;
  },
});

export const active = query({
  args: {
    paginationOpts: paginationOptsValidator,
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const region = args.region;
    if (region !== undefined) {
      return await ctx.db
        .query("safetyAlerts")
        .withIndex("by_region_and_isActive", (q) =>
          q.eq("region", region).eq("isActive", true),
        )
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("safetyAlerts")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listForAdmin = query({
  args: {
    paginationOpts: paginationOptsValidator,
    severity: v.optional(severity),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const alertSeverity = args.severity;
    if (alertSeverity !== undefined) {
      return await ctx.db
        .query("safetyAlerts")
        .withIndex("by_severity", (q) =>
          q.eq("severity", alertSeverity),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("safetyAlerts")
      .withIndex("by_isActive")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const setActive = mutation({
  args: {
    alertId: v.id("safetyAlerts"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.alertId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.alertId);
  },
});
