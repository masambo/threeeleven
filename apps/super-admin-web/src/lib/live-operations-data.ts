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
    return "Dispatch";
  }

  if (status === "responding" || status === "investigating") {
    return "Track";
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
      label: "Notifications queued",
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

const fallbackMarkerPositions: Record<string, { left: string; top: string }> = {
  "Kavango East": { left: "67%", top: "24%" },
  Karas: { left: "55%", top: "72%" },
  Khomas: { left: "52%", top: "40%" },
  Oshana: { left: "56%", top: "25%" },
  Rundu: { left: "67%", top: "24%" },
  Swakopmund: { left: "42%", top: "36%" },
  "Walvis Bay": { left: "39%", top: "48%" },
  Windhoek: { left: "52%", top: "40%" },
};

function projectNamibiaPoint(latitude?: number, longitude?: number) {
  if (latitude === undefined || longitude === undefined) {
    return undefined;
  }

  const left = Math.min(88, Math.max(12, ((longitude - 11) / 14) * 76 + 12));
  const top = Math.min(86, Math.max(12, ((-17 - latitude) / 12) * 74 + 12));

  return {
    left: `${left.toFixed(0)}%`,
    top: `${top.toFixed(0)}%`,
  };
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
}: {
  crimeReports: Array<Doc<"crimeReports">>;
  dangerZones: Array<Doc<"dangerZones">>;
  emergencyAlerts: Array<Doc<"emergencyAlerts">>;
  regions: Array<Doc<"regions">>;
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

  const regionMarkers: MapMarker[] = regions.map((region) => {
    const projected = projectNamibiaPoint(
      region.centerLatitude,
      region.centerLongitude,
    );
    const fallback = fallbackMarkerPositions[region.name] ?? {
      left: "52%",
      top: "42%",
    };

    return {
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
      label: region.name,
      layer: "region",
      meta: "Region",
      tone: counts.get(region.name) ? "brand" : "muted",
      title: region.name,
      ...(projected ?? fallback),
    };
  });

  const emergencyMarkers: MapMarker[] = emergencyAlerts.slice(0, 12).map((alert) => {
    const projected = projectNamibiaPoint(alert.latitude, alert.longitude);
    const fallback =
      fallbackMarkerPositions[alert.locationDescription ?? ""] ??
      fallbackMarkerPositions.Windhoek;

    return {
      count: "1",
      description: alert.description ?? locationFromAlert(alert),
      details: [
        { label: "Type", value: formatLabel(alert.type) },
        { label: "Triggered", value: timeAgo(alert.triggeredAt) },
        { label: "Contacts", value: String(alert.notifiedContacts.length) },
        { label: "Services", value: String(alert.notifiedServices.length) },
      ],
      label: shortId("EA", alert._id),
      layer: "emergency",
      meta: locationFromAlert(alert),
      status: formatLabel(alert.status),
      title: `${formatLabel(alert.type)} alert`,
      tone: alert.status === "active" ? "emergency" : "warning",
      ...(projected ?? fallback),
    };
  });

  const reportMarkers: MapMarker[] = crimeReports.slice(0, 12).map((report) => {
    const projected = projectNamibiaPoint(report.latitude, report.longitude);
    const fallback =
      fallbackMarkerPositions[report.city] ??
      fallbackMarkerPositions[report.region] ??
      fallbackMarkerPositions.Windhoek;

    return {
      count: "1",
      description: report.description,
      details: [
        { label: "Type", value: report.crimeType },
        { label: "Severity", value: formatLabel(report.severity) },
        { label: "Reported", value: timeAgo(report._creationTime) },
      ],
      label: shortId("CR", report._id),
      layer: "report",
      meta: placeFromParts(report.city, report.region),
      status: formatLabel(report.status),
      title: report.title,
      tone: reportTone(report),
      ...(projected ?? fallback),
    };
  });

  const zoneMarkers: MapMarker[] = dangerZones.slice(0, 12).map((zone) => {
    const projected = projectNamibiaPoint(
      zone.centerLatitude,
      zone.centerLongitude,
    );
    const fallback =
      fallbackMarkerPositions[zone.city ?? ""] ??
      fallbackMarkerPositions[zone.region ?? ""] ??
      fallbackMarkerPositions.Windhoek;
    const radius = zone.radiusMeters
      ? `${Math.min(96, Math.max(44, zone.radiusMeters / 35))}px`
      : zone.geometryType === "polygon"
        ? "74px"
        : "56px";

    return {
      count: String(zone.incidentCount),
      description: zone.warningMessage ?? zone.description ?? "Active risk zone",
      details: [
        { label: "Risk", value: formatLabel(zone.riskLevel) },
        { label: "Geometry", value: formatLabel(zone.geometryType) },
        { label: "Incidents", value: String(zone.incidentCount) },
      ],
      label: shortId("DZ", zone._id),
      layer: "zone",
      meta: placeFromParts(zone.city, zone.region),
      radius,
      status: zone.isActive ? "Active" : "Inactive",
      title: zone.name,
      tone: riskTone(zone.riskLevel),
      ...(projected ?? fallback),
    };
  });

  return [
    ...emergencyMarkers,
    ...zoneMarkers,
    ...reportMarkers,
    ...regionMarkers,
  ].slice(0, 32);
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
