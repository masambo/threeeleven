import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertOwns, requireAdmin, requireUser } from "./auth";

export const mine = query({
  args: {
    paginationOpts: paginationOptsValidator,
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (args.unreadOnly === true) {
      return await ctx.db
        .query("notifications")
        .withIndex("by_userId_and_isRead", (q) =>
          q.eq("userId", user._id).eq("isRead", false),
        )
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const createForUser = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    relatedEntityId: v.optional(v.string()),
    relatedEntityType: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      isRead: false,
      relatedEntityId: args.relatedEntityId,
      relatedEntityType: args.relatedEntityType,
      metadata: args.metadata,
      actionUrl: args.actionUrl,
    });
  },
});

export const markRead = mutation({
  args: {
    notificationId: v.id("notifications"),
    isRead: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const notification = await ctx.db.get(args.notificationId);
    if (notification === null) {
      return null;
    }
    assertOwns(user, notification.userId);
    await ctx.db.patch(args.notificationId, {
      isRead: args.isRead ?? true,
    });
    return await ctx.db.get(args.notificationId);
  },
});
