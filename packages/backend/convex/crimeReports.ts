import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertOwns, requireAdmin, requireUser } from "./auth";
import { notifyAdmins, notifyUser } from "./notificationHelpers";

const status = v.union(
  v.literal("pending"),
  v.literal("investigating"),
  v.literal("resolved"),
  v.literal("closed"),
);

export const create = mutation({
  args: {
    crimeType: v.string(),
    title: v.string(),
    description: v.string(),
    region: v.string(),
    city: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    locationDescription: v.optional(v.string()),
    incidentAt: v.number(),
    severity: v.string(),
    evidenceImageIds: v.optional(v.array(v.id("_storage"))),
    evidenceUrls: v.optional(v.array(v.string())),
    isAnonymous: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    const reportId = await ctx.db.insert("crimeReports", {
      userId: user._id,
      crimeType: args.crimeType,
      title: args.title,
      description: args.description,
      region: args.region,
      city: args.city,
      latitude: args.latitude,
      longitude: args.longitude,
      locationDescription: args.locationDescription,
      incidentAt: args.incidentAt,
      severity: args.severity,
      status: "pending",
      evidenceImageIds: args.evidenceImageIds ?? [],
      evidenceUrls: args.evidenceUrls ?? [],
      isAnonymous: args.isAnonymous ?? false,
      updatedAt: now,
    });

    await notifyAdmins(ctx, {
      type: "crime_report_submitted",
      title: "New crime report",
      message: `${args.title} was submitted in ${args.city}, ${args.region}.`,
      region: args.region,
      relatedEntityId: reportId,
      relatedEntityType: "crimeReports",
      actionUrl: "/dashboard/reports",
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
      .query("crimeReports")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getMine = query({
  args: {
    reportId: v.id("crimeReports"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const report = await ctx.db.get(args.reportId);
    if (report === null) {
      return null;
    }
    assertOwns(user, report.userId);
    return report;
  },
});

export const listForAdmin = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(status),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const region = args.region;
    const reportStatus = args.status;

    if (region !== undefined && reportStatus !== undefined) {
      return await ctx.db
        .query("crimeReports")
        .withIndex("by_region_and_status", (q) =>
          q.eq("region", region).eq("status", reportStatus),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }

    if (reportStatus !== undefined) {
      return await ctx.db
        .query("crimeReports")
        .withIndex("by_status", (q) =>
          q.eq("status", reportStatus),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("crimeReports")
      .withIndex("by_status")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const updateStatus = mutation({
  args: {
    reportId: v.id("crimeReports"),
    status,
    assignedOfficerId: v.optional(v.id("users")),
    resolutionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.reportId, {
      status: args.status,
      assignedOfficerId: args.assignedOfficerId,
      resolutionNotes: args.resolutionNotes,
      updatedAt: Date.now(),
    });
    const report = await ctx.db.get(args.reportId);
    if (report !== null) {
      await notifyUser(ctx, report.userId, {
        type: "report_status_change",
        title: "Crime report updated",
        message: `Your report "${report.title}" is now ${args.status}.`,
        relatedEntityId: args.reportId,
        relatedEntityType: "crimeReports",
        actionUrl: "/reports",
      });
    }
    return await ctx.db.get(args.reportId);
  },
});
