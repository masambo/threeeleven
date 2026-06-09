"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import type { ReactNode } from "react";

export function SuperAdminGate({ children }: { children: ReactNode }) {
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

  if (profile === null || profile.role !== "super_admin") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-white">Super admin required</p>
        <p className="max-w-md text-sm text-slate-400">
          The first signed-in user is promoted automatically. Additional super
          admins must be assigned from an existing super-admin account.
        </p>
      </div>
    );
  }

  return children;
}
