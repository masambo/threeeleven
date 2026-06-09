"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import type { Id } from "@311-security/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { DataTable } from "@/components/operations/data-table";
import { MetricCard } from "@/components/operations/metric-card";
import { PageHeader } from "@/components/operations/page-header";
import type { DataTableRow } from "@/lib/table-rows";
import { userRows } from "@/lib/live-operations-data";

export default function UsersPage() {
  const verifyUser = useMutation(api.users.verifyUser);
  const [isUpdating, setIsUpdating] = useState(false);
  const usersResult = useQuery(api.users.listForAdmin, { limit: 25 });
  const users = usersResult ?? [];
  const isLoading = usersResult === undefined;
  const admins = users.filter(
    (user) => user.role === "admin" || user.role === "super_admin",
  ).length;
  const pending = users.filter((user) => !user.isVerified).length;

  const handleAction = async (row: DataTableRow) => {
    const user = users.find((item) => item._id === row.id);
    if (!user || user.isVerified || isUpdating) {
      return;
    }

    setIsUpdating(true);
    try {
      await verifyUser({ userId: row.id as Id<"users"> });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Identity and access" title="Users" />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Registered users" tone="brand" value={String(users.length)} />
        <MetricCard label="Admins" tone="safety" value={String(admins)} />
        <MetricCard label="Pending verification" tone="warning" value={String(pending)} />
      </div>

      <DataTable
        columns={["ID", "Name", "Region", "Role", "Status", "Action"]}
        emptyMessage="No users are available for this admin view"
        isLoading={isLoading}
        onAction={handleAction}
        rows={userRows(users)}
      />
    </div>
  );
}
