"use client";

import { api } from "@311-security/backend/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";

export function ProfileSync({ appType }: { appType: string }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <DemoProfileSync appType={appType} />;
  }

  return <ClerkProfileSync appType={appType} />;
}

function DemoProfileSync({ appType }: { appType: string }) {
  const syncProfile = useMutation(api.users.syncProfile);
  const bootstrapFirstSuperAdmin = useMutation(api.users.bootstrapFirstSuperAdmin);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (syncedRef.current) {
      return;
    }

    syncedRef.current = true;

    void (async () => {
      try {
        await syncProfile({
          appType,
          fullName: "Demo Admin",
          phoneNumber: "+264 000 000 000",
          region: "Khomas",
        });
        await bootstrapFirstSuperAdmin().catch(() => undefined);
      } catch {
        syncedRef.current = false;
      }
    })();
  }, [appType, bootstrapFirstSuperAdmin, syncProfile]);

  return null;
}

function ClerkProfileSync({ appType }: { appType: string }) {
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
