import { colors } from '@/lib/theme';
import * as SecureStore from 'expo-secure-store';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

const ONBOARDING_KEY = '311-security.onboarding-complete';

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
    return <Redirect href="/(tabs)" />;
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
