import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./auth";
import { notifyAdmins } from "./notificationHelpers";

const status = v.union(
  v.literal("reported"),
  v.literal("verified"),
  v.literal("recovered"),
  v.literal("rejected"),
);

function normalizeSerialNumber(value: string) {
  return value.trim().replace(/[\s-]/g, "").toUpperCase();
}

export const report = mutation({
  args: {
    itemName: v.string(),
    itemCategory: v.string(),
    serialNumber: v.string(),
    description: v.string(),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    color: v.optional(v.string()),
    lastSeenLocation: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const normalizedSerialNumber = normalizeSerialNumber(args.serialNumber);

    if (normalizedSerialNumber.length < 4) {
      throw new Error("Serial number is too short");
    }

    const itemId = await ctx.db.insert("stolenItems", {
      userId: user._id,
      itemName: args.itemName,
      itemCategory: args.itemCategory,
      serialNumber: args.serialNumber.trim(),
      normalizedSerialNumber,
      description: args.description,
      brand: args.brand,
      model: args.model,
      color: args.color,
      lastSeenLocation: args.lastSeenLocation,
      contactPhone: args.contactPhone,
      status: "reported",
      isPublic: args.isPublic ?? true,
      createdAt: now,
      updatedAt: now,
    });

    await notifyAdmins(ctx, {
      type: "stolen_item_reported",
      title: "Stolen item reported",
      message: `${args.itemName} was reported with serial ${args.serialNumber}.`,
      relatedEntityId: itemId,
      relatedEntityType: "stolenItems",
      actionUrl: "/dashboard/stolen-items",
    });

    return itemId;
  },
});

export const searchBySerial = query({
  args: {
    serialNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedSerialNumber = normalizeSerialNumber(args.serialNumber);
    if (normalizedSerialNumber.length < 4) {
      return [];
    }

    return await ctx.db
      .query("stolenItems")
      .withIndex("by_normalizedSerialNumber", (q) =>
        q.eq("normalizedSerialNumber", normalizedSerialNumber),
      )
      .collect();
  },
});

export const mine = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await ctx.db
      .query("stolenItems")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listForAdmin = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(status),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.status !== undefined) {
      return await ctx.db
        .query("stolenItems")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("stolenItems")
      .withIndex("by_status")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const updateStatus = mutation({
  args: {
    itemId: v.id("stolenItems"),
    status,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.itemId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.itemId);
  },
});
