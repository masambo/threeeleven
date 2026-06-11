"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  AlertTriangle,
  Bell,
  ClipboardList,
  MapPin,
  Megaphone,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { BarChart, DonutChart } from "@/components/operations/charts";
import { MapPanel } from "@/components/operations/map-panel";
import { StatCard } from "@/components/operations/stat-card";
import {
  LIST_PAGE_ARGS,
  crimeHotspots,
  mapMarkers,
  pageItems,
  timeAgo,
} from "@/lib/live-operations-data";

const SPARKLINE_FALLBACK = [3, 6, 4, 8, 5, 9, 7, 11, 8, 12];

// ── Strict blue + supporting status palette ─────────────────────────
const COLORS = {
  primary: "#2563eb", // blue-600
  primaryLight: "#3b82f6", // blue-500
  primarySofter: "#60a5fa", // blue-400
  primarySoftest: "#93c5fd", // blue-300
  danger: "#ef4444", // red-500 (critical only)
  warning: "#f59e0b", // amber-500 (high severity only)
  success: "#16a34a", // green-600 (safe / regions)
} as const;

export default function DashboardPage() {
  const emergencyAlertsResult = useQuery(
    api.emergencyAlerts.activeForAdmin,
    LIST_PAGE_ARGS,
  );
  const crimeReportsResult = useQuery(
    api.crimeReports.listForAdmin,
    LIST_PAGE_ARGS,
  );
  const safetyAlertsResult = useQuery(
    api.safetyAlerts.listForAdmin,
    LIST_PAGE_ARGS,
  );
  const regions = useQuery(api.regions.list);

  const emergencyAlerts = pageItems(emergencyAlertsResult);
  const crimeReports = pageItems(crimeReportsResult);
  const safetyAlerts = pageItems(safetyAlertsResult);
  const regionItems = regions ?? [];

  const markers = mapMarkers({
    crimeReports,
    emergencyAlerts,
    regions: regionItems,
    safetyAlerts,
  });

  const activeEmergencies = emergencyAlerts.filter(
    (alert) => alert.status === "active",
  ).length;
  const pendingReports = crimeReports.filter(
    (report) => report.status === "pending",
  ).length;
  const criticalReports = crimeReports.filter(
    (report) => report.severity.toLowerCase() === "critical",
  ).length;
  const activeSafetyAlerts = safetyAlerts.filter(
    (alert) => alert.isActive,
  ).length;

  const hotspots = useMemo(
    () => crimeHotspots({ crimeReports, regions: regionItems }).slice(0, 5),
    [crimeReports, regionItems],
  );

  const crimeTypeData = useMemo(() => {
    const counts = new Map<string, number>();
    crimeReports.forEach((report) => {
      const key = report.crimeType.replace(/_/g, " ");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        tone: COLORS.primary,
        value,
      }));
  }, [crimeReports]);

  const severitySegments = useMemo(() => {
    const counts = { critical: 0, high: 0, low: 0, medium: 0 };
    crimeReports.forEach((report) => {
      const severity = report.severity.toLowerCase() as keyof typeof counts;
      if (severity in counts) {
        counts[severity] += 1;
      }
    });
    return [
      { color: COLORS.primary, label: "Critical", value: counts.critical },
      { color: COLORS.primaryLight, label: "High", value: counts.high },
      { color: COLORS.primarySofter, label: "Medium", value: counts.medium },
      { color: COLORS.primarySoftest, label: "Low", value: counts.low },
    ];
  }, [crimeReports]);

  const recentActivity = useMemo(() => {
    type Event = {
      icon: typeof ShieldAlert;
      id: string;
      timestamp: number;
      title: string;
      subtitle: string;
      tone: string;
    };

    const events: Event[] = [];

    emergencyAlerts.slice(0, 6).forEach((alert) => {
      events.push({
        icon: ShieldAlert,
        id: alert._id,
        subtitle: `${alert.locationDescription ?? "Unknown location"} • ${alert.status}`,
        timestamp: alert.triggeredAt ?? alert._creationTime,
        title: `${alert.type.replace(/_/g, " ")} alert`,
        tone: COLORS.danger,
      });
    });

    crimeReports.slice(0, 6).forEach((report) => {
      events.push({
        icon: ClipboardList,
        id: report._id,
        subtitle: `${[report.city, report.region].filter(Boolean).join(", ")} • ${report.severity}`,
        timestamp: report._creationTime,
        title: report.title,
        tone: COLORS.warning,
      });
    });

    safetyAlerts.slice(0, 4).forEach((alert) => {
      events.push({
        icon: Megaphone,
        id: alert._id,
        subtitle: `${[alert.city, alert.region].filter(Boolean).join(", ")} • ${alert.severity}`,
        timestamp: alert._creationTime,
        title: alert.title,
        tone: COLORS.primary,
      });
    });

    return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 7);
  }, [crimeReports, emergencyAlerts, safetyAlerts]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ── */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Live Operations
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Command Center Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time intelligence across the community neighbourhood watch
            network.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Live data stream
        </div>
      </header>

      {/* ── Stat cards row ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          accent={COLORS.primary}
          icon={ShieldAlert}
          label="Active Emergencies"
          sparkline={SPARKLINE_FALLBACK}
          trend={{
            direction: activeEmergencies > 0 ? "up" : "flat",
            label:
              activeEmergencies > 0
                ? `${activeEmergencies} need attention`
                : "All clear",
          }}
          value={activeEmergencies}
        />
        <StatCard
          accent={COLORS.primary}
          icon={ClipboardList}
          label="Pending Reports"
          sparkline={[2, 4, 3, 5, 6, 4, 7, 8, 6, 9]}
          trend={{
            direction: pendingReports > 5 ? "up" : "flat",
            label: `${criticalReports} critical reports`,
          }}
          value={pendingReports}
        />
        <StatCard
          accent={COLORS.primary}
          icon={Megaphone}
          label="Safety Alerts"
          sparkline={[1, 2, 4, 3, 5, 4, 6, 5, 7, 6]}
          trend={{ direction: "up", label: `${activeSafetyAlerts} published` }}
          value={safetyAlerts.length}
        />
        <StatCard
          accent={COLORS.primary}
          icon={Users}
          label="Active Regions"
          sparkline={[8, 9, 10, 11, 12, 12, 13, 13, 14, 14]}
          trend={{
            direction: regionItems.length > 0 ? "up" : "flat",
            label: `${regionItems.length} coverage zones`,
          }}
          value={regionItems.length}
        />
      </div>

      {/* ── Main grid: charts + map + side panels ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column: Crime breakdown */}
        <section className="lg:col-span-3">
          <DashboardCard
            icon={ClipboardList}
            subtitle="Top reported categories"
            title="Crime Breakdown"
          >
            {crimeTypeData.length > 0 ? (
              <BarChart data={crimeTypeData} />
            ) : (
              <EmptyState message="No crime reports yet" />
            )}
          </DashboardCard>
        </section>

        {/* Center column: MAP */}
        <section className="lg:col-span-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
                  <MapPin size={18} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Crime Heat Map
                  </h2>
                  <p className="text-xs text-slate-500">
                    Report density and active panic locations
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Real-time
              </div>
            </div>
            <MapPanel
              detailStats={[
                {
                  label: "Community alerts",
                  value: `${emergencyAlerts.length} active`,
                },
                { label: "Crime reports", value: `${crimeReports.length}` },
                { label: "Hotspots", value: `${hotspots.length} ranked` },
                {
                  label: "Safety alerts",
                  value: `${activeSafetyAlerts} live`,
                },
              ]}
              detailSubtitle="Click heat circles or panic markers to inspect"
              detailTitle="Resource planning overview"
              markers={markers}
            />
          </div>
        </section>

        {/* Right column: Risk distribution donut */}
        <section className="lg:col-span-3">
          <DashboardCard
            icon={AlertTriangle}
            subtitle="Reported crime severity"
            title="Crime Severity"
          >
            <div className="flex flex-col items-center gap-4">
              <DonutChart
                centerLabel="Reports"
                centerValue={crimeReports.length}
                segments={severitySegments}
              />
              <ul className="grid w-full grid-cols-2 gap-2">
                {severitySegments.map((segment) => (
                  <li
                    className="flex items-center gap-2 rounded-md bg-slate-50 px-2 py-1.5"
                    key={segment.label}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: segment.color }}
                    />
                    <div className="flex flex-1 items-baseline justify-between gap-1">
                      <span className="text-[11px] font-medium text-slate-600">
                        {segment.label}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-slate-900">
                        {segment.value}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </DashboardCard>
        </section>
      </div>

      {/* ── Second row: Activity + summary ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-8">
          <DashboardCard
            icon={Bell}
            subtitle="Most recent signals across the network"
            title="Recent Activity"
          >
            {recentActivity.length === 0 ? (
              <EmptyState message="No recent activity" />
            ) : (
              <ul className="-mx-1 flex flex-col">
                {recentActivity.map((event) => {
                  const EventIcon = event.icon;
                  return (
                    <li
                      className="flex items-start gap-3 rounded-lg px-1 py-2.5 transition hover:bg-slate-50"
                      key={event.id}
                    >
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                        style={{
                          background: `${event.tone}14`,
                          color: event.tone,
                        }}
                      >
                        <EventIcon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold capitalize text-slate-900">
                          {event.title}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {event.subtitle}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-slate-400">
                        {timeAgo(event.timestamp)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </DashboardCard>
        </section>

        <section className="lg:col-span-4">
          <DashboardCard
            icon={AlertTriangle}
            subtitle="Where resources should be prioritized"
            title="Top Crime Places"
          >
            {hotspots.length === 0 ? (
              <EmptyState message="No mapped crime hotspots yet" />
            ) : (
              <div className="flex flex-col gap-3">
                {hotspots.map((hotspot, index) => (
                  <div
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    key={hotspot.key}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {index + 1}. {hotspot.place}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {hotspot.topCrimeType}
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                        {hotspot.score}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-md bg-white p-2">
                        <p className="font-bold text-slate-900">{hotspot.count}</p>
                        <p className="text-slate-500">Reports</p>
                      </div>
                      <div className="rounded-md bg-white p-2">
                        <p className="font-bold text-red-600">{hotspot.critical}</p>
                        <p className="text-slate-500">Critical</p>
                      </div>
                      <div className="rounded-md bg-white p-2">
                        <p className="font-bold text-amber-600">{hotspot.high}</p>
                        <p className="text-slate-500">High</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </section>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────

function DashboardCard({
  children,
  icon: Icon,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  icon: typeof ShieldAlert;
  subtitle?: string;
  title: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
          <Icon size={16} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle ? (
            <p className="text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </article>
  );
}

function StatusRow({
  accent,
  label,
  value,
}: {
  accent: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: accent }}
        />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <span
        className="text-lg font-semibold tabular-nums"
        style={{ color: accent }}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[140px] items-center justify-center text-center">
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
