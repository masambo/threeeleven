import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { getClerkError } from '@/lib/clerk';
import { Ionicons } from '@expo/vector-icons';
import { useSSO } from '@clerk/expo';
import * as Linking from 'expo-linking';
import { Redirect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

const clerkConfigured = Boolean(process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY);
const logo = require('../assets/311logo.png');

export default function SignInScreen() {
  if (!clerkConfigured) {
    return <Redirect href="/" />;
  }

  return <ClerkSignInScreen />;
}

function ClerkSignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startSSOFlow } = useSSO();
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        redirectUrl: Linking.createURL('/'),
        strategy: 'oauth_google',
      });

      if (createdSessionId !== null && setActive !== undefined) {
        await setActive({ session: createdSessionId });
        router.replace('/');
      }
    } catch (error) {
      Alert.alert('Google sign-in failed', getClerkError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + spacing.xl, paddingTop: insets.top + spacing.xl }]}>
      <View style={styles.brandBlock}>
        <Image resizeMode="contain" source={logo} style={styles.logo} />
        <Text style={styles.title}>3:11 Security</Text>
        <Text style={styles.subtitle}>Sign in to keep your emergency profile ready.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Continue with Google</Text>
        <Text style={styles.cardText}>
          Your name and email come from Google. We will ask for phone and region next so responders receive usable details.
        </Text>
        <Pressable disabled={isLoading} onPress={() => void signInWithGoogle()} style={styles.googleButton}>
          {isLoading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Ionicons color={colors.textInverse} name="logo-google" size={20} />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#EEF4FF',
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  brandBlock: {
    alignItems: 'center',
    paddingTop: spacing['2xl'],
  },
  logo: {
    height: 112,
    width: 112,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSizes['3xl'],
    fontWeight: '900',
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    lineHeight: 22,
    marginTop: spacing.sm,
    maxWidth: 280,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(17, 24, 39, 0.07)',
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.md,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.xl,
    fontWeight: '900',
  },
  cardText: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    lineHeight: 22,
  },
  googleButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 56,
  },
  googleButtonText: {
    color: colors.textInverse,
    fontSize: fontSizes.base,
    fontWeight: '900',
  },
});
