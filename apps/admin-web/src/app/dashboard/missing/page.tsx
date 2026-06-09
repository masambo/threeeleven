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
  missingMetrics,
  missingReportRows,
  pageItems,
} from "@/lib/live-operations-data";

export default function MissingReportsPage() {
  const reviewReport = useMutation(api.missingReports.review);
  const [isUpdating, setIsUpdating] = useState(false);
  const missingReportsResult = useQuery(
    api.missingReports.listForAdmin,
    LIST_PAGE_ARGS,
  );
  const missingReports = pageItems(missingReportsResult);
  const metrics = missingMetrics(missingReports);

  const handleAction = async (row: DataTableRow) => {
    const reportId = row.id as Id<"missingReports">;
    const report = missingReports.find((item) => item._id === reportId);
    if (!report || isUpdating || report.status !== "pending") {
      return;
    }

    setIsUpdating(true);
    try {
      await reviewReport({
        reportId,
        status: "approved",
        adminNotes: "Approved from admin review queue",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Review queue" title="Missing And Lost Reports" />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Awaiting review" tone="warning" value={metrics.pending} />
        <MetricCard label="Published" tone="safety" value={metrics.approved} />
        <MetricCard label="Rejected" tone="muted" value={metrics.rejected} />
      </div>

      <DataTable
        columns={["ID", "Type", "Region", "Status", "Submitted", "Action"]}
        emptyMessage="No missing or lost reports awaiting review"
        isLoading={missingReportsResult === undefined}
        onAction={handleAction}
        rows={missingReportRows(missingReports)}
      />
    </div>
  );
}
