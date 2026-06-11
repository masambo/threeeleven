import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./auth";

const serviceType = v.union(
  v.literal("police"),
  v.literal("ambulance"),
  v.literal("fire"),
  v.literal("gbv"),
  v.literal("child_protection"),
  v.literal("other"),
);

const defaultServices = [
  {
    _id: "police-emergency",
    name: "Police Emergency",
    type: "police",
    phoneNumber: "10111",
    isNational: true,
    priority: 1,
    notes: "National police emergency line",
  },
  {
    _id: "ambulance-emergency",
    name: "Ambulance",
    type: "ambulance",
    phoneNumber: "211111",
    isNational: true,
    priority: 2,
    notes: "Medical emergency response",
  },
  {
    _id: "fire-emergency",
    name: "Fire Brigade",
    type: "fire",
    phoneNumber: "211111",
    isNational: true,
    priority: 3,
    notes: "Fire and rescue services",
  },
  {
    _id: "city-of-windhoek",
    name: "City Police / Windhoek",
    type: "other",
    phoneNumber: "061211111",
    isNational: false,
    priority: 4,
    notes: "Municipal emergency support",
  },
] as const;

function serviceKey(service: { name: string; type: string }) {
  const name = service.name.toLowerCase();

  if (service.type === "police" || name.includes("police")) {
    return "police";
  }

  if (service.type === "ambulance" || name.includes("ambulance")) {
    return "ambulance";
  }

  if (service.type === "fire" || name.includes("fire")) {
    return "fire";
  }

  if (name.includes("windhoek") || name.includes("city")) {
    return "city";
  }

  return `${service.type}:${name}`;
}

export const active = query({
  args: {
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const services =
      args.region !== undefined
        ? await ctx.db
            .query("emergencyServices")
            .withIndex("by_region_and_isActive", (q) =>
              q.eq("region", args.region).eq("isActive", true),
            )
            .collect()
        : await ctx.db
            .query("emergencyServices")
            .withIndex("by_isActive_and_priority", (q) =>
              q.eq("isActive", true),
            )
            .collect();

    const serviceKeys = new Set(services.map(serviceKey));
    const mergedServices = [
      ...services,
      ...defaultServices.filter((service) => !serviceKeys.has(serviceKey(service))),
    ];

    return mergedServices.sort((a, b) => (a.priority ?? 50) - (b.priority ?? 50));
  },
});

export const upsert = mutation({
  args: {
    serviceId: v.optional(v.id("emergencyServices")),
    name: v.string(),
    type: serviceType,
    phoneNumber: v.string(),
    region: v.optional(v.string()),
    city: v.optional(v.string()),
    isNational: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    priority: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const data = {
      name: args.name,
      type: args.type,
      phoneNumber: args.phoneNumber,
      region: args.region,
      city: args.city,
      isNational: args.isNational ?? true,
      isActive: args.isActive ?? true,
      priority: args.priority ?? 50,
      notes: args.notes,
      updatedAt: Date.now(),
    };

    if (args.serviceId !== undefined) {
      await ctx.db.patch(args.serviceId, data);
      return args.serviceId;
    }

    return await ctx.db.insert("emergencyServices", data);
  },
});
