"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import type { Id } from "@311-security/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, Smartphone, Undo2, XCircle } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/operations/data-table";
import { MetricCard } from "@/components/operations/metric-card";
import { PageHeader } from "@/components/operations/page-header";
import { LIST_PAGE_ARGS, pageItems, shortId } from "@/lib/live-operations-data";
import type { DataTableRow } from "@/lib/table-rows";

export default function StolenItemsPage() {
  const updateStatus = useMutation(api.stolenItems.updateStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const result = useQuery(api.stolenItems.listForAdmin, LIST_PAGE_ARGS);
  const items = pageItems(result);

  const handleAction = async (row: DataTableRow) => {
    if (isUpdating) {
      return;
    }

    const item = items.find((entry) => entry._id === row.id);
    if (item === undefined) {
      return;
    }

    const nextStatus =
      item.status === "reported"
        ? "verified"
        : item.status === "verified"
          ? "recovered"
          : item.status === "recovered"
            ? "reported"
            : "reported";

    setIsUpdating(true);
    try {
      await updateStatus({
        itemId: row.id as Id<"stolenItems">,
        status: nextStatus,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const reported = items.filter((item) => item.status === "reported").length;
  const verified = items.filter((item) => item.status === "verified").length;
  const recovered = items.filter((item) => item.status === "recovered").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Property intelligence" title="Stolen Item Registry" />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={Smartphone}
          label="Reported"
          tone="warning"
          value={String(reported)}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Verified stolen"
          tone="emergency"
          value={String(verified)}
        />
        <MetricCard
          icon={Undo2}
          label="Recovered"
          tone="safety"
          value={String(recovered)}
        />
      </div>

      <DataTable
        columns={["ID", "Item", "Serial", "Category", "Location", "Status", "Action"]}
        emptyMessage="No stolen items reported"
        isLoading={result === undefined}
        onAction={handleAction}
        rows={items.map((item) => ({
          action:
            item.status === "reported"
              ? "Verify"
              : item.status === "verified"
                ? "Recovered"
                : item.status === "recovered"
                  ? "Reopen"
                  : "Review",
          cells: [
            shortId("SI", item._id),
            item.itemName,
            item.serialNumber,
            item.itemCategory,
            item.lastSeenLocation ?? "Unknown",
            item.status.replace(/_/g, " "),
            item.status === "reported"
              ? "Verify"
              : item.status === "verified"
                ? "Recovered"
                : item.status === "recovered"
                  ? "Reopen"
                  : "Review",
          ],
          id: item._id,
        }))}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600">
            <XCircle aria-hidden size={20} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Serial search powers the mobile check-before-buy flow
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Verified stolen items are searchable by serial number, IMEI, VIN, or
              other device IDs from the citizen app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
