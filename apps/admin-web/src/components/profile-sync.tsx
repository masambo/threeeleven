"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";

export function ProfileSync({ appType }: { appType: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const syncProfile = useMutation(api.users.syncProfile);
  const bootstrapFirstSuperAdmin = useMutation(api.users.bootstrapFirstSuperAdmin);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || syncedRef.current) {
      return;
    }

    syncedRef.current = true;

    void (async () => {
      try {
        await syncProfile({ appType });
        await bootstrapFirstSuperAdmin().catch(() => undefined);
      } catch {
        syncedRef.current = false;
      }
    })();
  }, [appType, bootstrapFirstSuperAdmin, isLoaded, isSignedIn, syncProfile]);

  return null;
}
