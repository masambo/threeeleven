import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./auth";
import { notifyAdmins, notifyUser } from "./notificationHelpers";

const reportType = v.union(
  v.literal("missing_person"),
  v.literal("lost_item"),
  v.literal("found_person"),
);

const status = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

export const create = mutation({
  args: {
    reportType,
    title: v.string(),
    description: v.string(),
    personName: v.optional(v.string()),
    age: v.optional(v.number()),
    lastSeenLocation: v.optional(v.string()),
    lastSeenAt: v.optional(v.number()),
    contactPhone: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    photoImageIds: v.optional(v.array(v.id("_storage"))),
    photoUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const reportId = await ctx.db.insert("missingReports", {
      userId: user._id,
      reportType: args.reportType,
      title: args.title,
      description: args.description,
      personName: args.personName,
      age: args.age,
      lastSeenLocation: args.lastSeenLocation,
      lastSeenAt: args.lastSeenAt,
      contactPhone: args.contactPhone,
      contactEmail: args.contactEmail,
      photoImageIds: args.photoImageIds ?? [],
      photoUrls: args.photoUrls ?? [],
      status: "pending",
      updatedAt: Date.now(),
    });

    await notifyAdmins(ctx, {
      type: "missing_report_submitted",
      title: "Missing report awaiting review",
      message: `${args.title} was submitted for admin review.`,
      relatedEntityId: reportId,
      relatedEntityType: "missingReports",
      actionUrl: "/dashboard/missing",
    });

    return reportId;
  },
});

export const mine = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await ctx.db
      .query("missingReports")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const publicApproved = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("missingReports")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
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
    const reportStatus = args.status;
    if (reportStatus !== undefined) {
      return await ctx.db
        .query("missingReports")
        .withIndex("by_status", (q) =>
          q.eq("status", reportStatus),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("missingReports")
      .withIndex("by_status")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const review = mutation({
  args: {
    reportId: v.id("missingReports"),
    status,
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await ctx.db.patch(args.reportId, {
      status: args.status,
      adminNotes: args.adminNotes,
      approvedByUserId: args.status === "approved" ? admin._id : undefined,
      publishedAt: args.status === "approved" ? Date.now() : undefined,
      updatedAt: Date.now(),
    });
    const report = await ctx.db.get(args.reportId);
    if (report !== null) {
      await notifyUser(ctx, report.userId, {
        type: "missing_update",
        title: "Missing report reviewed",
        message: `Your report "${report.title}" was ${args.status}.`,
        relatedEntityId: args.reportId,
        relatedEntityType: "missingReports",
        actionUrl: "/missing",
      });
    }
    return report;
  },
});
