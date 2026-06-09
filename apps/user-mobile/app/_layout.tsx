import { ProfileSync } from '@/components/ProfileSync';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { colors, darkSemanticColors } from '@311-security/design';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, SafeAreaView, Text } from 'react-native';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL ?? 'http://127.0.0.1:3210';
const convex = new ConvexReactClient(convexUrl);

export default function RootLayout() {
  if (!publishableKey) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: darkSemanticColors.appBackground, padding: 24 }}>
        <Text style={{ color: colors.neutral[300] }}>
          Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to the Expo app environment.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ProfileSync appType="user-mobile" />
        <StatusBar style="light" />
        <AuthAwareStack />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

function AuthAwareStack() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: darkSemanticColors.appBackground }}>
        <ActivityIndicator color={colors.brand[300]} />
      </SafeAreaView>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
