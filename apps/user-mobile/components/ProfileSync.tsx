import { api } from '@311-security/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useEffect, useRef } from 'react';

export function ProfileSync({ appType }: { appType: string }) {
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
