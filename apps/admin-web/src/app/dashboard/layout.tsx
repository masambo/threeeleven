import type { ReactNode } from "react";
import { AdminGate } from "@/components/admin-gate";
import { OperationsShell } from "@/components/operations/app-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <OperationsShell>
      <AdminGate>{children}</AdminGate>
    </OperationsShell>
  );
}
