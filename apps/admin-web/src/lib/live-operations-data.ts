import {
  AlertTriangle,
  Bell,
  ClipboardList,
  ContactRound,
  FileSearch,
  MapPinned,
  Megaphone,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Doc } from "@311-security/backend/convex/_generated/dataModel";
import type { MapMarker, Tone } from "@/lib/operations-data";
import type { DataTableRow } from "@/lib/table-rows";

export const LIST_PAGE_ARGS = {
  paginationOpts: {
    cursor: null,
    numItems: 25,
  },
} as const;

type PageResult<T> = { page: T[] } | undefined;

type QueueItem = {
  title: string;
  meta: string;
  status: string;
  tone: Tone;
  icon: LucideIcon;
};

export function pageItems<T>(result: PageResult<T>) {
  return result?.page ?? [];
}

export function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function timeAgo(timestamp?: number) {
  if (timestamp === undefined) {
    return "Unknown";
  }

  const elapsedMs = Date.now() - timestamp;
  const minutes = Math.max(0, Math.floor(elapsedMs / 60000));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function shortId(prefix: string, id: string) {
  return `${prefix}-${id.slice(-6).toUpperCase()}`;
}

function placeFromParts(...parts: Array<string | undefined>) {
  const place = parts.filter(Boolean).join(", ");
  return place.length > 0 ? place : "Unassigned";
}

function locationFromAlert(alert: Doc<"emergencyAlerts">) {
  if (alert.locationDescription !== undefined) {
    return alert.locationDescription;
  }

  if (alert.latitude !== undefined && alert.longitude !== undefined) {
    return `${alert.latitude.toFixed(3)}, ${alert.longitude.toFixed(3)}`;
  }

  return "Unknown location";
}

function actionForStatus(status: string) {
  if (status === "active" || status === "pending") {
    return "Acknowledge";
  }

  if (status === "responding" || status === "investigating") {
    return "Follow up";
  }

  return "Review";
}

export function emergencyAlertRows(alerts: Array<Doc<"emergencyAlerts">>): DataTableRow[] {
  return alerts.map((alert) => ({
    id: alert._id,
    action: actionForStatus(alert.status),
    cells: [
      shortId("EA", alert._id),
      formatLabel(alert.type),
      locationFromAlert(alert),
      formatLabel(alert.status),
      timeAgo(alert.triggeredAt),
      actionForStatus(alert.status),
    ],
  }));
}

export function crimeReportRows(reports: Array<Doc<"crimeReports">>): DataTableRow[] {
  return reports.map((report) => ({
    id: report._id,
    action: actionForStatus(report.status),
    cells: [
      shortId("CR", report._id),
      report.crimeType,
      placeFromParts(report.city, report.region),
      formatLabel(report.status),
      formatLabel(report.severity),
      actionForStatus(report.status),
    ],
  }));
}

export function missingReportRows(reports: Array<Doc<"missingReports">>): DataTableRow[] {
  return reports.map((report) => ({
    id: report._id,
    action: report.status === "approved" ? "Open" : "Review",
    cells: [
      shortId("MR", report._id),
      formatLabel(report.reportType),
      report.lastSeenLocation ?? "Unknown location",
      formatLabel(report.status),
      timeAgo(report._creationTime),
      report.status === "approved" ? "Open" : "Review",
    ],
  }));
}

export function safetyAlertRows(alerts: Array<Doc<"safetyAlerts">>): DataTableRow[] {
  return alerts.map((alert) => ({
    id: alert._id,
    action: alert.isActive ? "Deactivate" : "Activate",
    cells: [
      shortId("SA", alert._id),
      alert.title,
      placeFromParts(alert.city, alert.region),
      formatLabel(alert.severity),
      formatLabel(alert.priority),
      alert.isActive ? "Deactivate" : "Activate",
    ],
  }));
}

export function dangerZoneRows(zones: Array<Doc<"dangerZones">>): DataTableRow[] {
  return zones.map((zone) => ({
    id: zone._id,
    action: zone.isActive ? "Deactivate" : "Activate",
    cells: [
      shortId("DZ", zone._id),
      zone.name,
      placeFromParts(zone.city, zone.region),
      formatLabel(zone.riskLevel),
      formatLabel(zone.geometryType),
      zone.isActive ? "Deactivate" : "Activate",
    ],
  }));
}

export function userRows(users: Array<Doc<"users">>): DataTableRow[] {
  return users.map((user) => ({
    id: user._id,
    action: user.isVerified ? "Verified" : "Verify",
    cells: [
      shortId(user.role === "user" ? "USR" : "ADM", user._id),
      user.fullName,
      user.region ?? "Unassigned",
      formatLabel(user.role),
      user.isActive ? (user.isVerified ? "Verified" : "Pending") : "Inactive",
      user.isVerified ? "Verified" : "Verify",
    ],
  }));
}

export function regionRows(regions: Array<Doc<"regions">>): DataTableRow[] {
  return regions.map((region) => ({
    id: region._id,
    action: "Review",
    cells: [
      region.name,
      region.description ??
        (region.centerLatitude !== undefined && region.centerLongitude !== undefined
          ? `${region.centerLatitude.toFixed(2)}, ${region.centerLongitude.toFixed(2)}`
          : "Center unset"),
      region.centerLatitude !== undefined ? "Mapped" : "Setup needed",
      "Review",
    ],
  }));
}

export function dashboardMetrics({
  crimeReports,
  emergencyAlerts,
  regions,
  safetyAlerts,
}: {
  crimeReports: Array<Doc<"crimeReports">>;
  emergencyAlerts: Array<Doc<"emergencyAlerts">>;
  regions: Array<Doc<"regions">>;
  safetyAlerts: Array<Doc<"safetyAlerts">>;
}) {
  const pendingReports = crimeReports.filter(
    (report) => report.status === "pending",
  ).length;
  const criticalReports = crimeReports.filter(
    (report) => report.severity.toLowerCase() === "critical",
  ).length;
  const regionalAlerts = safetyAlerts.filter(
    (alert) => alert.region !== undefined,
  ).length;

  return [
    {
      label: "Active emergencies",
      value: String(emergencyAlerts.length),
      trend: "Live queue",
      tone: "emergency",
    },
    {
      label: "Pending reports",
      value: String(pendingReports),
      trend: `${criticalReports} critical`,
      tone: "warning",
    },
    {
      label: "Safety alerts",
      value: String(safetyAlerts.length),
      trend: `${regionalAlerts} regional`,
      tone: "brand",
    },
    {
      label: "Regions online",
      value: String(regions.length),
      trend: "Configured coverage",
      tone: "safety",
    },
  ] satisfies Array<{ label: string; value: string; trend: string; tone: Tone }>;
}

export function operationalSignals({
  dangerZones,
  emergencyAlerts,
  safetyAlerts,
}: {
  dangerZones: Array<Doc<"dangerZones">>;
  emergencyAlerts: Array<Doc<"emergencyAlerts">>;
  safetyAlerts: Array<Doc<"safetyAlerts">>;
}) {
  const criticalZones = dangerZones.filter(
    (zone) => zone.riskLevel === "critical",
  ).length;
  const queuedNotifications = emergencyAlerts.reduce(
    (total, alert) => total + alert.notifiedServices.length,
    0,
  );
  const contactsNotified = emergencyAlerts.reduce(
    (total, alert) => total + alert.notifiedContacts.length,
    0,
  );

  return [
    {
      label: "Active emergency alerts",
      value: String(emergencyAlerts.length),
      icon: ShieldAlert,
      tone: "emergency",
    },
    {
      label: "Community notices",
      value: String(queuedNotifications + safetyAlerts.length),
      icon: Bell,
      tone: "brand",
    },
    {
      label: "Contacts notified",
      value: String(contactsNotified),
      icon: ContactRound,
      tone: "safety",
    },
    {
      label: "Critical risk zones",
      value: String(criticalZones),
      icon: AlertTriangle,
      tone: "warning",
    },
  ] satisfies Array<{
    label: string;
    value: string;
    icon: LucideIcon;
    tone: Tone;
  }>;
}

export function priorityQueueItems({
  crimeReports,
  dangerZones,
  emergencyAlerts,
}: {
  crimeReports: Array<Doc<"crimeReports">>;
  dangerZones: Array<Doc<"dangerZones">>;
  emergencyAlerts: Array<Doc<"emergencyAlerts">>;
}): QueueItem[] {
  const emergencies: QueueItem[] = emergencyAlerts.slice(0, 2).map((alert) => ({
    title: `${formatLabel(alert.type)} alert`,
    meta: `${locationFromAlert(alert)} - ${timeAgo(alert.triggeredAt)}`,
    status: formatLabel(alert.status),
    tone: alert.status === "active" ? "emergency" : "warning",
    icon: ShieldAlert,
  }));
  const reports: QueueItem[] = crimeReports.slice(0, 2).map((report) => ({
    title: report.title,
    meta: `${placeFromParts(report.city, report.region)} - ${timeAgo(
      report._creationTime,
    )}`,
    status: formatLabel(report.status),
    tone: report.status === "pending" ? "warning" : "brand",
    icon: ClipboardList,
  }));
  const zones: QueueItem[] = dangerZones.slice(0, 1).map((zone) => ({
    title: zone.name,
    meta: `${placeFromParts(zone.city, zone.region)} - ${formatLabel(
      zone.riskLevel,
    )} risk`,
    status: zone.isActive ? "Active" : "Inactive",
    tone: zone.riskLevel === "critical" ? "emergency" : "brand",
    icon: MapPinned,
  }));

  return [...emergencies, ...reports, ...zones].slice(0, 4);
}

function hasCoordinates<T extends { latitude?: number; longitude?: number }>(
  value: T,
): value is T & { latitude: number; longitude: number } {
  return value.latitude !== undefined && value.longitude !== undefined;
}

function hasRegionCoordinates<
  T extends { centerLatitude?: number; centerLongitude?: number },
>(value: T): value is T & { centerLatitude: number; centerLongitude: number } {
  return value.centerLatitude !== undefined && value.centerLongitude !== undefined;
}

function zoneCenter(zone: Doc<"dangerZones">) {
  if (hasRegionCoordinates(zone)) {
    return {
      latitude: zone.centerLatitude,
      longitude: zone.centerLongitude,
    };
  }

  const firstPoint = zone.polygonPoints[0];
  if (firstPoint !== undefined) {
    return firstPoint;
  }

  return undefined;
}

function riskTone(riskLevel: Doc<"dangerZones">["riskLevel"]): Tone {
  if (riskLevel === "critical") {
    return "emergency";
  }

  if (riskLevel === "high") {
    return "warning";
  }

  if (riskLevel === "medium") {
    return "brand";
  }

  return "safety";
}

function reportTone(report: Doc<"crimeReports">): Tone {
  if (report.severity.toLowerCase() === "critical") {
    return "emergency";
  }

  if (report.status === "pending") {
    return "warning";
  }

  return "brand";
}

export function mapMarkers({
  crimeReports,
  dangerZones,
  emergencyAlerts,
  regions,
  safetyAlerts = [],
}: {
  crimeReports: Array<Doc<"crimeReports">>;
  dangerZones: Array<Doc<"dangerZones">>;
  emergencyAlerts: Array<Doc<"emergencyAlerts">>;
  regions: Array<Doc<"regions">>;
  safetyAlerts?: Array<Doc<"safetyAlerts">>;
}): MapMarker[] {
  const counts = new Map<string, number>();
  const add = (label?: string) => {
    if (label !== undefined && label.length > 0) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  };

  crimeReports.forEach((report) => add(report.city || report.region));
  dangerZones.forEach((zone) => add(zone.city || zone.region));
  emergencyAlerts.forEach((alert) => add(alert.locationDescription));
  safetyAlerts.forEach((alert) => add(alert.city || alert.region));

  const regionMarkers: MapMarker[] = regions
    .filter(hasRegionCoordinates)
    .map((region) => ({
      count: String(counts.get(region.name) ?? 0),
      description: region.description ?? "Regional coverage point",
      details: [
        {
          label: "Coordinates",
          value:
            region.centerLatitude !== undefined &&
            region.centerLongitude !== undefined
              ? `${region.centerLatitude.toFixed(2)}, ${region.centerLongitude.toFixed(2)}`
              : "Not set",
        },
      ],
      id: region._id,
      label: region.name,
      latitude: region.centerLatitude,
      layer: "region",
      longitude: region.centerLongitude,
      meta: "Region",
      tone: counts.get(region.name) ? "brand" : "muted",
      title: region.name,
    }));

  const emergencyMarkers: MapMarker[] = emergencyAlerts
    .filter(hasCoordinates)
    .slice(0, 24)
    .map((alert) => ({
      count: "1",
      description: alert.description ?? locationFromAlert(alert),
      details: [
        { label: "Type", value: formatLabel(alert.type) },
        { label: "Triggered", value: timeAgo(alert.triggeredAt) },
        {
          label: "GPS",
          value: `${alert.latitude.toFixed(5)}, ${alert.longitude.toFixed(5)}`,
        },
        { label: "Contacts", value: String(alert.notifiedContacts.length) },
      ],
      id: alert._id,
      label: shortId("EA", alert._id),
      latitude: alert.latitude,
      layer: "emergency",
      longitude: alert.longitude,
      meta: locationFromAlert(alert),
      status: formatLabel(alert.status),
      title: `${formatLabel(alert.type)} alert`,
      tone: alert.status === "active" ? "emergency" : "warning",
    }));

  const reportMarkers: MapMarker[] = crimeReports
    .filter(hasCoordinates)
    .slice(0, 24)
    .map((report) => ({
      count: "1",
      description: report.description,
      details: [
        { label: "Type", value: report.crimeType },
        { label: "Severity", value: formatLabel(report.severity) },
        { label: "Reported", value: timeAgo(report._creationTime) },
      ],
      id: report._id,
      label: shortId("CR", report._id),
      latitude: report.latitude,
      layer: "report",
      longitude: report.longitude,
      meta: placeFromParts(report.city, report.region),
      status: formatLabel(report.status),
      title: report.title,
      tone: reportTone(report),
    }));

  const safetyAlertMarkers: MapMarker[] = safetyAlerts
    .filter(hasCoordinates)
    .slice(0, 24)
    .map((alert) => ({
      count: "1",
      description: alert.message,
      details: [
        { label: "Type", value: formatLabel(alert.type) },
        { label: "Severity", value: formatLabel(alert.severity) },
        { label: "Priority", value: formatLabel(alert.priority) },
      ],
      id: alert._id,
      label: shortId("SA", alert._id),
      latitude: alert.latitude,
      layer: "alert",
      longitude: alert.longitude,
      meta: placeFromParts(alert.city, alert.region),
      status: alert.isActive ? "Active" : "Inactive",
      title: alert.title,
      tone: alert.severity === "critical" ? "emergency" : "brand",
    }));

  const zoneMarkers: MapMarker[] = dangerZones.flatMap((zone) => {
    const center = zoneCenter(zone);
    if (center === undefined) {
      return [];
    }

    const geometry =
      zone.geometryType === "polygon"
        ? {
            type: "polygon" as const,
            points: zone.polygonPoints,
          }
        : {
            type: "circle" as const,
            radiusMeters: zone.radiusMeters,
          };

    return {
      count: String(zone.incidentCount),
      description: zone.warningMessage ?? zone.description ?? "Active risk zone",
      details: [
        { label: "Risk", value: formatLabel(zone.riskLevel) },
        { label: "Geometry", value: formatLabel(zone.geometryType) },
        { label: "Incidents", value: String(zone.incidentCount) },
      ],
      geometry,
      id: zone._id,
      label: shortId("DZ", zone._id),
      latitude: center.latitude,
      layer: "zone",
      longitude: center.longitude,
      meta: placeFromParts(zone.city, zone.region),
      status: zone.isActive ? "Active" : "Inactive",
      title: zone.name,
      tone: riskTone(zone.riskLevel),
    };
  });

  return [
    ...emergencyMarkers,
    ...zoneMarkers,
    ...reportMarkers,
    ...safetyAlertMarkers,
    ...regionMarkers,
  ].slice(0, 96);
}

export function emergencyMetrics(alerts: Array<Doc<"emergencyAlerts">>) {
  return {
    active: String(alerts.filter((alert) => alert.status === "active").length),
    responding: String(
      alerts.filter((alert) => alert.status === "responding").length,
    ),
    services: String(
      alerts.reduce((total, alert) => total + alert.notifiedServices.length, 0),
    ),
    unassigned: String(
      alerts.filter((alert) => alert.notifiedServices.length === 0).length,
    ),
  };
}

export function crimeMetrics(reports: Array<Doc<"crimeReports">>) {
  return {
    critical: String(
      reports.filter((report) => report.severity.toLowerCase() === "critical")
        .length,
    ),
    investigating: String(
      reports.filter((report) => report.status === "investigating").length,
    ),
    pending: String(reports.filter((report) => report.status === "pending").length),
    resolved: String(reports.filter((report) => report.status === "resolved").length),
  };
}

export function missingMetrics(reports: Array<Doc<"missingReports">>) {
  return {
    approved: String(reports.filter((report) => report.status === "approved").length),
    pending: String(reports.filter((report) => report.status === "pending").length),
    rejected: String(reports.filter((report) => report.status === "rejected").length),
  };
}

export function safetyMetrics(alerts: Array<Doc<"safetyAlerts">>) {
  const now = Date.now();
  return {
    active: String(alerts.filter((alert) => alert.isActive).length),
    critical: String(alerts.filter((alert) => alert.severity === "critical").length),
    expiring: String(
      alerts.filter(
        (alert) =>
          alert.expiresAt !== undefined &&
          alert.expiresAt > now &&
          alert.expiresAt - now < 1000 * 60 * 60 * 24,
      ).length,
    ),
  };
}

export function dangerZoneSignals(zones: Array<Doc<"dangerZones">>) {
  return [
    {
      icon: MapPinned,
      label: "Active zones",
      tone: "brand",
      value: String(zones.filter((zone) => zone.isActive).length),
    },
    {
      icon: AlertTriangle,
      label: "Critical risk",
      tone: "emergency",
      value: String(zones.filter((zone) => zone.riskLevel === "critical").length),
    },
  ] satisfies Array<{ icon: LucideIcon; label: string; tone: Tone; value: string }>;
}

export const pageIcons = {
  fileSearch: FileSearch,
  megaphone: Megaphone,
  users: UsersRound,
};
