import { AuthForm } from '@/components/AuthForm';
import { styles } from '@/lib/styles';
import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native';

export default function SignInScreen() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <AuthForm />
    </SafeAreaView>
  );
}
