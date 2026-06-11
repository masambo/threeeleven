import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./auth";
import { notifyAdmins, notifyUser } from "./notificationHelpers";

const alertType = v.union(
  v.literal("panic"),
  v.literal("medical"),
  v.literal("fire"),
  v.literal("crime_in_progress"),
);

const status = v.union(
  v.literal("active"),
  v.literal("responding"),
  v.literal("resolved"),
  v.literal("false_alarm"),
);

export const trigger = mutation({
  args: {
    type: alertType,
    description: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    locationDescription: v.optional(v.string()),
    notifiedContacts: v.optional(v.array(v.string())),
    notifiedServices: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const emergencyContacts = await ctx.db
      .query("emergencyContacts")
      .withIndex("by_userId_and_isActive", (q) =>
        q.eq("userId", user._id).eq("isActive", true),
      )
      .take(10);
    const senderContact = [
      user.fullName,
      user.phoneNumber ?? undefined,
      user.email,
    ].filter((value): value is string => value !== undefined && value.length > 0);
    const contactDetails = [
      senderContact.length > 0 ? `Sender: ${senderContact.join(" | ")}` : undefined,
      ...emergencyContacts.map(
        (contact) => `${contact.name}: ${contact.phoneNumber}`,
      ),
    ].filter((value): value is string => value !== undefined);

    const alertId = await ctx.db.insert("emergencyAlerts", {
      userId: user._id,
      type: args.type,
      description: args.description,
      latitude: args.latitude,
      longitude: args.longitude,
      locationDescription: args.locationDescription,
      isActive: true,
      triggeredAt: now,
      status: "active",
      notifiedContacts: args.notifiedContacts ?? contactDetails,
      notifiedServices: args.notifiedServices ?? [],
      updatedAt: now,
    });

    await notifyAdmins(ctx, {
      type: "emergency_triggered",
      title: "Emergency alert triggered",
      message: `${user.fullName} triggered a ${args.type.replace(/_/g, " ")} alert.`,
      relatedEntityId: alertId,
      relatedEntityType: "emergencyAlerts",
      actionUrl: "/dashboard/emergency",
    });

    return alertId;
  },
});

export const mine = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await ctx.db
      .query("emergencyAlerts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const activeForAdmin = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("emergencyAlerts")
      .withIndex("by_isActive_and_triggeredAt", (q) =>
        q.eq("isActive", true),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const updateStatus = mutation({
  args: {
    alertId: v.id("emergencyAlerts"),
    status,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const isResolved =
      args.status === "resolved" || args.status === "false_alarm";
    await ctx.db.patch(args.alertId, {
      status: args.status,
      isActive: !isResolved,
      resolvedAt: isResolved ? Date.now() : undefined,
      updatedAt: Date.now(),
    });
    const alert = await ctx.db.get(args.alertId);
    if (alert !== null) {
      await notifyUser(ctx, alert.userId, {
        type: "emergency_acknowledged",
        title: "Emergency alert updated",
        message: `Your emergency alert is now ${args.status.replace(/_/g, " ")}.`,
        relatedEntityId: args.alertId,
        relatedEntityType: "emergencyAlerts",
        actionUrl: "/emergency",
      });
    }
    return alert;
  },
});

export const updateLocation = mutation({
  args: {
    alertId: v.id("emergencyAlerts"),
    latitude: v.number(),
    longitude: v.number(),
    locationDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const alert = await ctx.db.get(args.alertId);

    if (alert === null || alert.userId !== user._id) {
      throw new Error("Emergency alert not found");
    }

    if (!alert.isActive) {
      return alert;
    }

    await ctx.db.patch(args.alertId, {
      latitude: args.latitude,
      longitude: args.longitude,
      locationDescription: args.locationDescription,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.alertId);
  },
});
