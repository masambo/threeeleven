"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { MetricCard } from "@/components/operations/metric-card";
import { PageHeader } from "@/components/operations/page-header";
import {
  LIST_PAGE_ARGS,
  dashboardMetrics,
  pageItems,
} from "@/lib/live-operations-data";

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
  const users = useQuery(api.users.listForAdmin, { limit: 100 });

  const emergencyAlerts = pageItems(emergencyAlertsResult);
  const crimeReports = pageItems(crimeReportsResult);
  const safetyAlerts = pageItems(safetyAlertsResult);
  const regionItems = regions ?? [];
  const userItems = users ?? [];
  const admins = userItems.filter(
    (user) => user.role === "admin" || user.role === "super_admin",
  ).length;

  const metrics = dashboardMetrics({
    crimeReports,
    emergencyAlerts,
    regions: regionItems,
    safetyAlerts,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Platform command" title="Super Admin Dashboard" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            tone={metric.tone}
            trend={metric.trend}
            value={metric.value}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Regions monitored" tone="brand" value={String(regionItems.length)} />
        <MetricCard label="Admins active" tone="safety" value={String(admins)} />
        <MetricCard
          label="Open escalations"
          tone="emergency"
          value={String(emergencyAlerts.length)}
        />
      </div>
    </div>
  );
}
