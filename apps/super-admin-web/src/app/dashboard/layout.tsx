import type { ReactNode } from "react";
import { SuperAdminGate } from "@/components/super-admin-gate";
import { SuperAdminShell } from "@/components/super-admin-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SuperAdminShell>
      <SuperAdminGate>{children}</SuperAdminGate>
    </SuperAdminShell>
  );
}
