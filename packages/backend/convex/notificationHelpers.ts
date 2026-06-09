import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

type NotificationInput = {
  type: string;
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  actionUrl?: string;
};

async function insertNotification(
  ctx: MutationCtx,
  userId: Id<"users">,
  input: NotificationInput,
) {
  await ctx.db.insert("notifications", {
    userId,
    type: input.type,
    title: input.title,
    message: input.message,
    isRead: false,
    relatedEntityId: input.relatedEntityId,
    relatedEntityType: input.relatedEntityType,
    actionUrl: input.actionUrl,
  });
}

export async function notifyUser(
  ctx: MutationCtx,
  userId: Id<"users">,
  input: NotificationInput,
) {
  await insertNotification(ctx, userId, input);
}

export async function notifyAdmins(
  ctx: MutationCtx,
  input: NotificationInput & { region?: string },
) {
  const adminUsers =
    input.region !== undefined
      ? await ctx.db
          .query("users")
          .withIndex("by_region_and_role", (q) =>
            q.eq("region", input.region).eq("role", "admin"),
          )
          .take(50)
      : await ctx.db
          .query("users")
          .withIndex("by_role", (q) => q.eq("role", "admin"))
          .take(50);

  const superAdmins = await ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", "super_admin"))
    .take(25);

  const recipients = new Map<Id<"users">, true>();
  for (const admin of [...adminUsers, ...superAdmins]) {
    if (admin.isActive) {
      recipients.set(admin._id, true);
    }
  }

  for (const userId of recipients.keys()) {
    await insertNotification(ctx, userId, input);
  }
}

export async function notifyActiveUsers(
  ctx: MutationCtx,
  input: NotificationInput & { region?: string },
) {
  const users = await ctx.db
    .query("users")
    .withIndex("by_isActive", (q) => q.eq("isActive", true))
    .take(100);

  for (const user of users) {
    if (input.region !== undefined && user.region !== input.region) {
      continue;
    }

    await insertNotification(ctx, user._id, input);
  }
}
