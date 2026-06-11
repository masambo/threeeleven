import { colors } from '@/lib/theme';
import { api } from '@311-security/backend/convex/_generated/api';
import { useAuth } from '@clerk/expo';
import { useQuery } from 'convex/react';
import * as SecureStore from 'expo-secure-store';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

const ONBOARDING_KEY = '311-security.onboarding-complete';
const clerkConfigured = Boolean(process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function Index() {
  const [route, setRoute] = useState<'home' | 'onboarding' | null>(null);

  useEffect(() => {
    let isMounted = true;

    SecureStore.getItemAsync(ONBOARDING_KEY)
      .then((value) => {
        if (isMounted) {
          setRoute(value === 'true' ? 'home' : 'onboarding');
        }
      })
      .catch(() => {
        if (isMounted) {
          setRoute('onboarding');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (route === 'home') {
    return clerkConfigured ? <ClerkEntry /> : <ProfileEntry />;
  }

  if (route === 'onboarding') {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View style={{ alignItems: 'center', backgroundColor: '#EEF4FF', flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

function ClerkEntry() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return <ProfileEntry />;
}

function ProfileEntry() {
  const profile = useQuery(api.users.current);

  if (profile === undefined) {
    return <LoadingScreen />;
  }

  if (profile === null || !profile.phoneNumber || !profile.region) {
    return <Redirect href="/profile-complete" />;
  }

  return <Redirect href="/(tabs)" />;
}

function LoadingScreen() {
  return (
    <View style={{ alignItems: 'center', backgroundColor: '#EEF4FF', flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
