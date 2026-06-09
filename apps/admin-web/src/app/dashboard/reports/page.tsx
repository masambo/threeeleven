"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import type { Id } from "@311-security/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Filter } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/operations/data-table";
import { MetricCard } from "@/components/operations/metric-card";
import { PageHeader } from "@/components/operations/page-header";
import type { DataTableRow } from "@/lib/table-rows";
import {
  LIST_PAGE_ARGS,
  crimeMetrics,
  crimeReportRows,
  pageItems,
} from "@/lib/live-operations-data";

export default function ReportsPage() {
  const updateStatus = useMutation(api.crimeReports.updateStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const crimeReportsResult = useQuery(
    api.crimeReports.listForAdmin,
    LIST_PAGE_ARGS,
  );
  const crimeReports = pageItems(crimeReportsResult);
  const metrics = crimeMetrics(crimeReports);

  const handleAction = async (row: DataTableRow) => {
    const reportId = row.id as Id<"crimeReports">;
    const report = crimeReports.find((item) => item._id === reportId);
    if (!report || isUpdating) {
      return;
    }

    const nextStatus =
      report.status === "pending"
        ? "investigating"
        : report.status === "investigating"
          ? "resolved"
          : "closed";

    setIsUpdating(true);
    try {
      await updateStatus({ reportId, status: nextStatus });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Report management" title="Crime Reports">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--color-operations-border)] px-3 text-sm font-bold text-slate-200 transition hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
          type="button"
        >
          <Filter aria-hidden size={16} />
          Filters
        </button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Pending" tone="warning" value={metrics.pending} />
        <MetricCard label="Investigating" tone="brand" value={metrics.investigating} />
        <MetricCard label="Resolved" tone="safety" value={metrics.resolved} />
        <MetricCard label="Critical" tone="emergency" value={metrics.critical} />
      </div>

      <DataTable
        columns={["ID", "Type", "Region", "Status", "Severity", "Action"]}
        emptyMessage="No crime reports in the current admin queue"
        isLoading={crimeReportsResult === undefined}
        onAction={handleAction}
        rows={crimeReportRows(crimeReports)}
      />
    </div>
  );
}
