import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  clerkUserIdFromIdentity,
  getCurrentUser,
  requireAdmin,
  requireIdentity,
  requireSuperAdmin,
  requireUser,
} from "./auth";

const idType = v.union(v.literal("namibianId"), v.literal("passport"));
const role = v.union(
  v.literal("user"),
  v.literal("admin"),
  v.literal("super_admin"),
);

export const me = query({
  args: {},
  handler: async (ctx) => {
    return await requireUser(ctx);
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const syncProfile = mutation({
  args: {
    fullName: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    region: v.optional(v.string()),
    idNumber: v.optional(v.string()),
    idType: v.optional(idType),
    profileImageId: v.optional(v.id("_storage")),
    profileImageUrl: v.optional(v.string()),
    appType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const existing = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    const now = Date.now();
    const email = identity.email ?? "";
    const fullName = args.fullName ?? identity.name ?? email;

    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        email,
        fullName,
        phoneNumber: args.phoneNumber,
        region: args.region,
        idNumber: args.idNumber,
        idType: args.idType,
        profileImageId: args.profileImageId,
        profileImageUrl: args.profileImageUrl,
        appType: args.appType,
        lastLoginAt: now,
        updatedAt: now,
      });
      return await ctx.db.get(existing._id);
    }

    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      clerkUserId: clerkUserIdFromIdentity(identity),
      email,
      fullName,
      phoneNumber: args.phoneNumber,
      region: args.region,
      idNumber: args.idNumber,
      idType: args.idType,
      isVerified: false,
      profileImageId: args.profileImageId,
      profileImageUrl: args.profileImageUrl,
      role: "user",
      appType: args.appType,
      isActive: true,
      lastLoginAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(userId);
  },
});

export const bootstrapFirstSuperAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const existingSuperAdmin = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "super_admin"))
      .take(1);

    if (existingSuperAdmin.length > 0 && user.role !== "super_admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(user._id, {
      role: "super_admin",
      isVerified: true,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(user._id);
  },
});

export const listForAdmin = query({
  args: {
    role: v.optional(role),
    region: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const limit = args.limit ?? 50;
    const userRole = args.role;
    const region =
      admin.role === "admin"
        ? (admin.region ?? undefined)
        : args.region;

    if (admin.role === "admin" && region === undefined) {
      throw new Error("Admin account has no assigned region");
    }

    if (region !== undefined && userRole !== undefined) {
      return await ctx.db
        .query("users")
        .withIndex("by_region_and_role", (q) =>
          q.eq("region", region).eq("role", userRole),
        )
        .take(limit);
    }

    if (userRole !== undefined) {
      const users = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", userRole))
        .take(limit * 2);
      return region === undefined
        ? users.slice(0, limit)
        : users.filter((user) => user.region === region).slice(0, limit);
    }

    const users = await ctx.db
      .query("users")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .take(limit * 3);

    return region === undefined
      ? users.slice(0, limit)
      : users.filter((user) => user.region === region).slice(0, limit);
  },
});

export const verifyUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const user = await ctx.db.get(args.userId);
    if (user === null) {
      throw new Error("User not found");
    }

    if (admin.role === "admin" && user.region !== admin.region) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.userId, {
      isVerified: true,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.userId);
  },
});

export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role,
    isActive: v.optional(v.boolean()),
    isVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    await ctx.db.patch(args.userId, {
      role: args.role,
      isActive: args.isActive,
      isVerified: args.isVerified,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.userId);
  },
});
