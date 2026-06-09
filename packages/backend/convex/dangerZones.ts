import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireSuperAdmin, requireUser } from "./auth";

const riskLevel = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("critical"),
);

const polygonPoint = v.object({
  latitude: v.number(),
  longitude: v.number(),
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
        .query("dangerZones")
        .withIndex("by_region_and_isActive", (q) =>
          q.eq("region", region).eq("isActive", true),
        )
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("dangerZones")
      .withIndex("by_isActive_and_riskLevel", (q) => q.eq("isActive", true))
      .paginate(args.paginationOpts);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    geometryType: v.union(v.literal("circle"), v.literal("polygon")),
    centerLatitude: v.optional(v.number()),
    centerLongitude: v.optional(v.number()),
    radiusMeters: v.optional(v.number()),
    polygonPoints: v.optional(v.array(polygonPoint)),
    crimeTypes: v.optional(v.array(v.string())),
    riskLevel,
    warningMessage: v.optional(v.string()),
    safetyTips: v.optional(v.string()),
    activeHours: v.optional(v.array(v.string())),
    isAlwaysActive: v.optional(v.boolean()),
    region: v.optional(v.string()),
    city: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (
      args.geometryType === "circle" &&
      (args.centerLatitude === undefined ||
        args.centerLongitude === undefined ||
        args.radiusMeters === undefined)
    ) {
      throw new Error("Circle danger zones require center and radius");
    }
    if (args.geometryType === "polygon" && args.polygonPoints === undefined) {
      throw new Error("Polygon danger zones require polygon points");
    }

    return await ctx.db.insert("dangerZones", {
      name: args.name,
      description: args.description,
      geometryType: args.geometryType,
      centerLatitude: args.centerLatitude,
      centerLongitude: args.centerLongitude,
      radiusMeters: args.radiusMeters,
      polygonPoints: args.polygonPoints ?? [],
      crimeTypes: args.crimeTypes ?? ["general"],
      riskLevel: args.riskLevel,
      warningMessage: args.warningMessage,
      safetyTips: args.safetyTips,
      activeHours: args.activeHours ?? [],
      isAlwaysActive: args.isAlwaysActive ?? true,
      incidentCount: 0,
      region: args.region,
      city: args.city,
      isActive: true,
      createdByUserId: admin._id,
      updatedAt: Date.now(),
    });
  },
});

export const setActive = mutation({
  args: {
    dangerZoneId: v.id("dangerZones"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.dangerZoneId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.dangerZoneId);
  },
});

export const remove = mutation({
  args: {
    dangerZoneId: v.id("dangerZones"),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    await ctx.db.delete(args.dangerZoneId);
    return args.dangerZoneId;
  },
});

export const recordEntry = mutation({
  args: {
    dangerZoneId: v.id("dangerZones"),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await ctx.db.insert("dangerZoneEntries", {
      userId: user._id,
      dangerZoneId: args.dangerZoneId,
      enteredAt: Date.now(),
      latitude: args.latitude,
      longitude: args.longitude,
    });
  },
});
