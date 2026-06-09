import { ClerkProvider, useAuth, useUser } from '@clerk/expo';
import { useSignIn, useSignUp } from '@clerk/expo/legacy';
import { tokenCache } from '@clerk/expo/token-cache';
import { api } from '@311-security/backend/convex/_generated/api';
import { colors, darkSemanticColors, radii, spacing } from '@311-security/design';
import { ConvexReactClient, useQuery } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL ?? 'http://127.0.0.1:3210';
const convex = new ConvexReactClient(convexUrl);

export default function App() {
  if (!publishableKey) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.eyebrow}>3:11 Security</Text>
        <Text style={styles.title}>Missing Clerk publishable key</Text>
        <Text style={styles.body}>
          Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to the Expo app environment.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AuthScreen />
      </ConvexProviderWithClerk>
      <StatusBar style="light" />
    </ClerkProvider>
  );
}

function AuthScreen() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#67e8f9" />
      </SafeAreaView>
    );
  }

  if (isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.panel}>
          <Text style={styles.eyebrow}>Signed in</Text>
          <Text style={styles.title}>Welcome to 3:11 Security</Text>
          <Text style={styles.body}>
            {user?.primaryEmailAddress?.emailAddress ?? 'Your account is active.'}
          </Text>
          <ConvexStatus />
          <Pressable style={styles.primaryButton} onPress={() => signOut()}>
            <Text style={styles.primaryButtonText}>Sign out</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return <AuthForm />;
}

function ConvexStatus() {
  const status = useQuery(api.health.publicStatus);

  return (
    <View style={styles.statusRow}>
      <View
        style={[
          styles.statusDot,
          { backgroundColor: status?.ok ? darkSemanticColors.success : colors.neutral[500] },
        ]}
      />
      <Text style={styles.statusText}>
        {status?.ok ? 'Convex backend online' : 'Syncing Convex backend'}
      </Text>
    </View>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

  const resetForm = (nextMode: 'sign-in' | 'sign-up') => {
    setMode(nextMode);
    setPassword('');
    setCode('');
    setPendingVerification(false);
  };

  const handleSignIn = async () => {
    if (!isSignInLoaded) return;

    setIsSubmitting(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      await setSignInActive({ session: result.createdSessionId });
    } catch (error) {
      Alert.alert('Sign in failed', getClerkError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    if (!isSignUpLoaded) return;

    setIsSubmitting(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (error) {
      Alert.alert('Sign up failed', getClerkError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!isSignUpLoaded) return;

    setIsSubmitting(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      await setSignUpActive({ session: result.createdSessionId });
    } catch (error) {
      Alert.alert('Verification failed', getClerkError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.eyebrow}>3:11 Security</Text>
        <Text style={styles.title}>
          {pendingVerification
            ? 'Verify your email'
            : mode === 'sign-in'
              ? 'Sign in to continue'
              : 'Create your account'}
        </Text>
        <Text style={styles.body}>
          {pendingVerification
            ? 'Enter the code Clerk sent to your email.'
            : 'Access safety alerts, reports, and emergency tools from the new mobile app.'}
        </Text>

        {!pendingVerification ? (
          <>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              value={email}
            />
            <TextInput
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              style={styles.input}
              value={password}
            />
            <Pressable
              disabled={isSubmitting}
              onPress={mode === 'sign-in' ? handleSignIn : handleSignUp}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting
                  ? 'Please wait...'
                  : mode === 'sign-in'
                    ? 'Sign in'
                    : 'Create account'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => resetForm(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>
                {mode === 'sign-in'
                  ? 'Need an account? Sign up'
                  : 'Already have an account? Sign in'}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setCode}
              placeholder="Verification code"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              value={code}
            />
            <Pressable
              disabled={isSubmitting}
              onPress={handleVerify}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Verifying...' : 'Verify email'}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function getClerkError(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray(error.errors) &&
    error.errors[0]?.message
  ) {
    return error.errors[0].message;
  }

  return 'Please check your details and try again.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkSemanticColors.appBackground,
    justifyContent: 'center',
    padding: spacing[6],
  },
  panel: {
    gap: spacing[4],
  },
  eyebrow: {
    color: darkSemanticColors.focus,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: darkSemanticColors.appForeground,
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
  },
  body: {
    color: colors.neutral[300],
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing[2],
  },
  statusRow: {
    alignItems: 'center',
    borderColor: darkSemanticColors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing[2],
    height: 44,
    paddingHorizontal: spacing[3],
  },
  statusDot: {
    borderRadius: radii.sm,
    height: 8,
    width: 8,
  },
  statusText: {
    color: colors.neutral[200],
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    backgroundColor: darkSemanticColors.panel,
    borderColor: darkSemanticColors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    color: darkSemanticColors.appForeground,
    fontSize: 16,
    height: 52,
    paddingHorizontal: spacing[4],
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: darkSemanticColors.focus,
    borderRadius: radii.lg,
    height: 52,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: darkSemanticColors.appBackground,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.neutral[200],
    fontSize: 15,
    fontWeight: '700',
  },
});
