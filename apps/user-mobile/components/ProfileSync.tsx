import { api } from '@311-security/backend/convex/_generated/api';
import { useAuth, useUser } from '@clerk/expo';
import { useMutation } from 'convex/react';
import { useEffect, useRef } from 'react';

const clerkConfigured = Boolean(process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function ProfileSync({ appType }: { appType: string }) {
  if (clerkConfigured) {
    return <ClerkProfileSync appType={appType} />;
  }

  return <DemoProfileSync appType={appType} />;
}

function DemoProfileSync({ appType }: { appType: string }) {
  const syncProfile = useMutation(api.users.syncProfile);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (syncedRef.current) {
      return;
    }

    syncedRef.current = true;

    void syncProfile({ appType }).catch(() => {
      syncedRef.current = false;
    });
  }, [appType, syncProfile]);

  return null;
}

function ClerkProfileSync({ appType }: { appType: string }) {
  const syncProfile = useMutation(api.users.syncProfile);
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || syncedRef.current) {
      return;
    }

    syncedRef.current = true;

    void syncProfile({
      appType,
      fullName: user?.fullName ?? undefined,
      profileImageUrl: user?.imageUrl ?? undefined,
    }).catch(() => {
      syncedRef.current = false;
    });
  }, [appType, isLoaded, isSignedIn, syncProfile, user?.fullName, user?.imageUrl]);

  return null;
}
