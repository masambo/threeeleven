import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertOwns, requireUser } from "./auth";

const relationship = v.union(
  v.literal("family"),
  v.literal("friend"),
  v.literal("colleague"),
  v.literal("neighbor"),
  v.literal("other"),
);

export const listMine = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (args.activeOnly === true) {
      return await ctx.db
        .query("emergencyContacts")
        .withIndex("by_userId_and_isActive", (q) =>
          q.eq("userId", user._id).eq("isActive", true),
        )
        .take(20);
    }

    return await ctx.db
      .query("emergencyContacts")
      .withIndex("by_userId_and_priority", (q) => q.eq("userId", user._id))
      .take(20);
  },
});

export const upsert = mutation({
  args: {
    contactId: v.optional(v.id("emergencyContacts")),
    name: v.string(),
    phoneNumber: v.string(),
    relationship,
    priority: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    if (args.contactId !== undefined) {
      const contact = await ctx.db.get(args.contactId);
      if (contact === null) {
        throw new Error("Contact not found");
      }
      assertOwns(user, contact.userId);
      await ctx.db.patch(args.contactId, {
        name: args.name,
        phoneNumber: args.phoneNumber,
        relationship: args.relationship,
        priority: args.priority ?? contact.priority,
        isActive: args.isActive ?? contact.isActive,
        notes: args.notes,
        updatedAt: now,
      });
      return args.contactId;
    }

    return await ctx.db.insert("emergencyContacts", {
      userId: user._id,
      name: args.name,
      phoneNumber: args.phoneNumber,
      relationship: args.relationship,
      priority: args.priority ?? 3,
      isActive: args.isActive ?? true,
      notes: args.notes,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: {
    contactId: v.id("emergencyContacts"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const contact = await ctx.db.get(args.contactId);
    if (contact === null) {
      return null;
    }
    assertOwns(user, contact.userId);
    await ctx.db.delete(args.contactId);
    return args.contactId;
  },
});
