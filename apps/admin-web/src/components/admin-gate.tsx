"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import type { ReactNode } from "react";

type AllowedRole = "admin" | "super_admin";

export function AdminGate({
  allowedRoles = ["admin", "super_admin"],
  children,
}: {
  allowedRoles?: AllowedRole[];
  children: ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const profile = useQuery(
    api.users.current,
    isLoaded && isSignedIn ? {} : "skip",
  );

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
        Checking session...
      </div>
    );
  }

  if (profile === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
        Syncing profile...
      </div>
    );
  }

  const allowed = new Set<string>(allowedRoles);
  if (profile === null || !allowed.has(profile.role)) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-white">Unauthorized</p>
        <p className="max-w-md text-sm text-slate-400">
          This console requires an admin account. Contact a super admin to
          assign the correct role and region.
        </p>
      </div>
    );
  }

  return children;
}
