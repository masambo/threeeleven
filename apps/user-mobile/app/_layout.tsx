import { ProfileSync } from '@/components/ProfileSync';
import { ConvexReactClient, ConvexProvider } from 'convex/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL ?? 'http://127.0.0.1:3210';
const convex = new ConvexReactClient(convexUrl);

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <ProfileSync appType="user-mobile" />
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ConvexProvider>
  );
}
