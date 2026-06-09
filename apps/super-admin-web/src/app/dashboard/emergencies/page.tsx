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

export default function EmergenciesPage() {
  const updateStatus = useMutation(api.emergencyAlerts.updateStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const emergencyAlertsResult = useQuery(
    api.emergencyAlerts.activeForAdmin,
    LIST_PAGE_ARGS,
  );
  const emergencyAlerts = pageItems(emergencyAlertsResult);
  const metrics = emergencyMetrics(emergencyAlerts);

  const handleAction = async (row: DataTableRow) => {
    const alert = emergencyAlerts.find((item) => item._id === row.id);
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
      await updateStatus({ alertId: row.id as Id<"emergencyAlerts">, status: nextStatus });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Platform escalations" title="Emergency Queue" />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Active" tone="emergency" value={metrics.active} />
        <MetricCard label="Responding" tone="warning" value={metrics.responding} />
        <MetricCard label="Services notified" tone="safety" value={metrics.services} />
      </div>

      <DataTable
        columns={["ID", "Type", "Region", "Status", "Age", "Action"]}
        emptyMessage="No active emergency alerts"
        isLoading={emergencyAlertsResult === undefined}
        onAction={handleAction}
        rows={emergencyAlertRows(emergencyAlerts)}
      />
    </div>
  );
}
