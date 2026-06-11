import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const role = v.union(
  v.literal("user"),
  v.literal("admin"),
  v.literal("super_admin"),
);

const idType = v.union(v.literal("namibianId"), v.literal("passport"));

const reportStatus = v.union(
  v.literal("pending"),
  v.literal("investigating"),
  v.literal("resolved"),
  v.literal("closed"),
);

const missingReportType = v.union(
  v.literal("missing_person"),
  v.literal("lost_item"),
  v.literal("stolen_item"),
  v.literal("found_person"),
);

const missingReportStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

const alertSeverity = v.union(
  v.literal("info"),
  v.literal("warning"),
  v.literal("critical"),
);

const priority = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("critical"),
);

const riskLevel = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("critical"),
);

const metadata = v.optional(v.record(v.string(), v.any()));

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    clerkUserId: v.optional(v.string()),
    email: v.string(),
    fullName: v.string(),
    phoneNumber: v.optional(v.string()),
    region: v.optional(v.string()),
    idNumber: v.optional(v.string()),
    idType: v.optional(idType),
    isVerified: v.boolean(),
    profileImageId: v.optional(v.id("_storage")),
    profileImageUrl: v.optional(v.string()),
    role,
    appType: v.optional(v.string()),
    createdByUserId: v.optional(v.id("users")),
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()),
    metadata,
    legacySupabaseId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_region_and_role", ["region", "role"])
    .index("by_isActive", ["isActive"]),

  regions: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    centerLatitude: v.optional(v.number()),
    centerLongitude: v.optional(v.number()),
    metadata,
    createdByUserId: v.optional(v.id("users")),
    legacySupabaseId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_createdByUserId", ["createdByUserId"]),

  crimeReports: defineTable({
    userId: v.id("users"),
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
    status: reportStatus,
    evidenceImageIds: v.array(v.id("_storage")),
    evidenceUrls: v.array(v.string()),
    isAnonymous: v.boolean(),
    assignedOfficerId: v.optional(v.id("users")),
    resolutionNotes: v.optional(v.string()),
    legacySupabaseId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_region_and_status", ["region", "status"])
    .index("by_assignedOfficerId_and_status", ["assignedOfficerId", "status"]),

  emergencyAlerts: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("panic"),
      v.literal("medical"),
      v.literal("fire"),
      v.literal("crime_in_progress"),
    ),
    description: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    locationDescription: v.optional(v.string()),
    isActive: v.boolean(),
    triggeredAt: v.number(),
    resolvedAt: v.optional(v.number()),
    status: v.union(
      v.literal("active"),
      v.literal("responding"),
      v.literal("resolved"),
      v.literal("false_alarm"),
    ),
    notifiedContacts: v.array(v.string()),
    notifiedServices: v.array(v.string()),
    legacySupabaseId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status_and_triggeredAt", ["status", "triggeredAt"])
    .index("by_isActive_and_triggeredAt", ["isActive", "triggeredAt"]),

  missingReports: defineTable({
    userId: v.id("users"),
    reportType: missingReportType,
    title: v.string(),
    description: v.string(),
    personName: v.optional(v.string()),
    age: v.optional(v.number()),
    lastSeenLocation: v.optional(v.string()),
    lastSeenAt: v.optional(v.number()),
    itemName: v.optional(v.string()),
    itemCategory: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    photoImageIds: v.array(v.id("_storage")),
    photoUrls: v.array(v.string()),
    adminNotes: v.optional(v.string()),
    status: missingReportStatus,
    approvedByUserId: v.optional(v.id("users")),
    publishedAt: v.optional(v.number()),
    legacySupabaseId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_reportType_and_status", ["reportType", "status"])
    .index("by_serialNumber", ["serialNumber"]),

  stolenItems: defineTable({
    userId: v.id("users"),
    itemName: v.string(),
    itemCategory: v.string(),
    serialNumber: v.string(),
    normalizedSerialNumber: v.string(),
    description: v.string(),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    color: v.optional(v.string()),
    lastSeenLocation: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    status: v.union(
      v.literal("reported"),
      v.literal("verified"),
      v.literal("recovered"),
      v.literal("rejected"),
    ),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_normalizedSerialNumber", ["normalizedSerialNumber"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  wantedPersons: defineTable({
    name: v.string(),
    alias: v.optional(v.string()),
    description: v.string(),
    lastKnownLocation: v.optional(v.string()),
    wantedFor: v.string(),
    riskLevel,
    imageIds: v.array(v.id("_storage")),
    imageUrls: v.array(v.string()),
    isActive: v.boolean(),
    createdByUserId: v.id("users"),
    publishedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_isActive", ["isActive"])
    .index("by_riskLevel", ["riskLevel"]),

  emergencyServices: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("police"),
      v.literal("ambulance"),
      v.literal("fire"),
      v.literal("gbv"),
      v.literal("child_protection"),
      v.literal("other"),
    ),
    phoneNumber: v.string(),
    region: v.optional(v.string()),
    city: v.optional(v.string()),
    isNational: v.boolean(),
    isActive: v.boolean(),
    priority: v.number(),
    notes: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_isActive_and_priority", ["isActive", "priority"])
    .index("by_region_and_isActive", ["region", "isActive"]),

  safetyAlerts: defineTable({
    type: v.string(),
    title: v.string(),
    message: v.string(),
    regionId: v.optional(v.id("regions")),
    region: v.optional(v.string()),
    city: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    locationDescription: v.optional(v.string()),
    imageIds: v.array(v.id("_storage")),
    imageUrls: v.array(v.string()),
    severity: alertSeverity,
    priority,
    isActive: v.boolean(),
    expiresAt: v.optional(v.number()),
    createdByUserId: v.id("users"),
    metadata,
    legacySupabaseId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_isActive", ["isActive"])
    .index("by_region_and_isActive", ["region", "isActive"])
    .index("by_severity", ["severity"])
    .index("by_createdByUserId", ["createdByUserId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    relatedEntityId: v.optional(v.string()),
    relatedEntityType: v.optional(v.string()),
    metadata,
    actionUrl: v.optional(v.string()),
    legacySupabaseId: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_isRead", ["userId", "isRead"]),

  emergencyContacts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    phoneNumber: v.string(),
    relationship: v.union(
      v.literal("family"),
      v.literal("friend"),
      v.literal("colleague"),
      v.literal("neighbor"),
      v.literal("other"),
    ),
    priority: v.number(),
    isActive: v.boolean(),
    notes: v.optional(v.string()),
    legacySupabaseId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_userId_and_priority", ["userId", "priority"])
    .index("by_userId_and_isActive", ["userId", "isActive"]),

  userLocations: defineTable({
    userId: v.id("users"),
    latitude: v.number(),
    longitude: v.number(),
    accuracy: v.optional(v.number()),
    source: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_updatedAt", ["updatedAt"]),

  dangerZones: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    geometryType: v.union(v.literal("circle"), v.literal("polygon")),
    centerLatitude: v.optional(v.number()),
    centerLongitude: v.optional(v.number()),
    radiusMeters: v.optional(v.number()),
    polygonPoints: v.array(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
      }),
    ),
    crimeTypes: v.array(v.string()),
    riskLevel,
    warningMessage: v.optional(v.string()),
    safetyTips: v.optional(v.string()),
    activeHours: v.array(v.string()),
    isAlwaysActive: v.boolean(),
    incidentCount: v.number(),
    lastIncidentAt: v.optional(v.number()),
    region: v.optional(v.string()),
    city: v.optional(v.string()),
    isActive: v.boolean(),
    createdByUserId: v.id("users"),
    legacySupabaseId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_isActive_and_riskLevel", ["isActive", "riskLevel"])
    .index("by_region_and_isActive", ["region", "isActive"])
    .index("by_city_and_isActive", ["city", "isActive"])
    .index("by_createdByUserId", ["createdByUserId"]),

  dangerZoneEntries: defineTable({
    userId: v.id("users"),
    dangerZoneId: v.id("dangerZones"),
    enteredAt: v.number(),
    exitedAt: v.optional(v.number()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  })
    .index("by_userId_and_enteredAt", ["userId", "enteredAt"])
    .index("by_dangerZoneId_and_enteredAt", ["dangerZoneId", "enteredAt"]),

  proximityAlerts: defineTable({
    crimeReportId: v.id("crimeReports"),
    targetUserId: v.id("users"),
    distanceMeters: v.number(),
    radiusMeters: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("delivered"),
      v.literal("dismissed"),
    ),
    metadata,
    deliveredAt: v.optional(v.number()),
  })
    .index("by_targetUserId_and_status", ["targetUserId", "status"])
    .index("by_crimeReportId_and_targetUserId", [
      "crimeReportId",
      "targetUserId",
    ]),
});
