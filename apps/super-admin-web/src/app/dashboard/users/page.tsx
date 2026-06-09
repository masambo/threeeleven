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
  const updateRole = useMutation(api.users.updateRole);
  const [isUpdating, setIsUpdating] = useState(false);
  const usersResult = useQuery(api.users.listForAdmin, { limit: 50 });
  const users = usersResult ?? [];
  const admins = users.filter(
    (user) => user.role === "admin" || user.role === "super_admin",
  ).length;

  const handleAction = async (row: DataTableRow) => {
    const user = users.find((item) => item._id === row.id);
    if (!user || isUpdating || user.role === "super_admin") {
      return;
    }

    const nextRole = user.role === "user" ? "admin" : "user";

    setIsUpdating(true);
    try {
      await updateRole({
        userId: row.id as Id<"users">,
        role: nextRole,
        isVerified: nextRole === "admin" ? true : user.isVerified,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Identity and access" title="Admin Accounts" />

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard label="Total users" tone="brand" value={String(users.length)} />
        <MetricCard label="Admins" tone="safety" value={String(admins)} />
      </div>

      <p className="text-sm text-slate-400">
        Use the action button to promote a user to admin or demote an admin back
        to user.
      </p>

      <DataTable
        columns={["ID", "Name", "Region", "Role", "Status", "Action"]}
        emptyMessage="No users found"
        isLoading={usersResult === undefined}
        onAction={handleAction}
        rows={userRows(users).map((row) => ({
          ...row,
          action:
            users.find((user) => user._id === row.id)?.role === "admin"
              ? "Demote"
              : users.find((user) => user._id === row.id)?.role === "super_admin"
                ? "Protected"
                : "Promote",
        }))}
      />
    </div>
  );
}
