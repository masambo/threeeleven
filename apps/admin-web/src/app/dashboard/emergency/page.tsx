"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import type { Id } from "@311-security/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { DataTable } from "@/components/operations/data-table";
import { MetricCard } from "@/components/operations/metric-card";
import { PageHeader } from "@/components/operations/page-header";
import type { DataTableRow } from "@/lib/table-rows";
import {
  LIST_PAGE_ARGS,
  emergencyAlertRows,
  emergencyMetrics,
  pageItems,
} from "@/lib/live-operations-data";

export default function EmergencyPage() {
  const updateStatus = useMutation(api.emergencyAlerts.updateStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const emergencyAlertsResult = useQuery(
    api.emergencyAlerts.activeForAdmin,
    LIST_PAGE_ARGS,
  );
  const emergencyAlerts = pageItems(emergencyAlertsResult);
  const metrics = emergencyMetrics(emergencyAlerts);

  const handleAction = async (row: DataTableRow) => {
    const alertId = row.id as Id<"emergencyAlerts">;
    const alert = emergencyAlerts.find((item) => item._id === alertId);
    if (!alert || isUpdating) {
      return;
    }

    const nextStatus =
      alert.status === "active"
        ? "responding"
        : alert.status === "responding"
          ? "resolved"
          : "false_alarm";

    setIsUpdating(true);
    try {
      await updateStatus({ alertId, status: nextStatus });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Community watch" title="Community Alerts" />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Active"
          tone="emergency"
          trend={`${metrics.unassigned} not yet acknowledged`}
          value={metrics.active}
        />
        <MetricCard label="Following up" tone="warning" value={metrics.responding} />
        <MetricCard label="Community notices" tone="safety" value={metrics.services} />
      </div>

      <DataTable
        columns={["ID", "Type", "Location", "Status", "Age", "Action"]}
        emptyMessage="No active community alerts"
        isLoading={emergencyAlertsResult === undefined}
        onAction={handleAction}
        rows={emergencyAlertRows(emergencyAlerts)}
      />
    </div>
  );
}
