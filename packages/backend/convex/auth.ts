import type { UserIdentity } from "convex/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type Ctx = QueryCtx | MutationCtx;
export type Role = Doc<"users">["role"];

export async function requireIdentity(ctx: Ctx): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Not authenticated");
  }
  return identity;
}

export async function getCurrentUser(ctx: Ctx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
}

export async function requireUser(ctx: Ctx): Promise<Doc<"users">> {
  const user = await getCurrentUser(ctx);
  if (user === null || !user.isActive) {
    throw new Error("User profile not found");
  }
  return user;
}

export async function requireRole(
  ctx: Ctx,
  allowedRoles: Role[],
): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin(ctx: Ctx): Promise<Doc<"users">> {
  return await requireRole(ctx, ["admin", "super_admin"]);
}

export async function requireSuperAdmin(ctx: Ctx): Promise<Doc<"users">> {
  return await requireRole(ctx, ["super_admin"]);
}

export function assertOwns(user: Doc<"users">, ownerId: Id<"users">) {
  if (user._id !== ownerId) {
    throw new Error("Unauthorized");
  }
}

export function clerkUserIdFromIdentity(identity: UserIdentity) {
  return identity.subject.split("|").pop() ?? identity.subject;
}
