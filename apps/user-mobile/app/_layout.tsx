import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { ProfileSync } from '@/components/ProfileSync';
import { ConvexReactClient, ConvexProvider } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL ?? 'http://127.0.0.1:3210';
const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkConfigured = Boolean(clerkPublishableKey);
const convex = new ConvexReactClient(convexUrl);

export default function RootLayout() {
  if (!clerkConfigured) {
    return (
      <ConvexProvider client={convex}>
        <ProfileSync appType="user-mobile" />
        <RootStack />
      </ConvexProvider>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey!} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ProfileSync appType="user-mobile" />
        <RootStack />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

function RootStack() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="profile-complete" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
