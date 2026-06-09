import { useSignIn, useSignUp } from '@clerk/expo/legacy';
import { getClerkError } from '@/lib/clerk';
import { styles } from '@/lib/styles';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

export function AuthForm() {
  const router = useRouter();
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
      router.replace('/(tabs)');
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
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Verification failed', getClerkError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.list}>
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
          : 'Access safety alerts, reports, and emergency tools.'}
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
  );
}
