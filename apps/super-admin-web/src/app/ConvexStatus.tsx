"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import { useQuery } from "convex/react";

export function ConvexStatus() {
  const status = useQuery(api.health.publicStatus);

  return (
    <div className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs font-semibold text-neutral-200">
      <span
        className={`h-2 w-2 rounded-full ${
          status?.ok ? "bg-emerald-400" : "bg-neutral-500"
        }`}
      />
      {status?.ok ? "Convex online" : "Syncing Convex"}
    </div>
  );
}
