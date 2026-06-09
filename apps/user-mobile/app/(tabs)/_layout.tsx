import { colors } from '@/lib/theme';
import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ColorValue } from 'react-native';

type IoniconsName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IoniconsName, focusedName: IoniconsName) {
  return ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons color={color as string} name={focused ? focusedName : name} size={24} />
  );
}

export default function TabsLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: tabIcon('home-outline', 'home'),
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          tabBarIcon: tabIcon('document-text-outline', 'document-text'),
          title: 'Reports',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: tabIcon('notifications-outline', 'notifications'),
          title: 'Notifications',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: tabIcon('person-outline', 'person'),
          title: 'Profile',
        }}
      />

      {/* Hidden tabs – accessible via navigation but not shown in the tab bar */}
      <Tabs.Screen name="alerts" options={{ href: null }} />
      <Tabs.Screen name="emergency" options={{ href: null }} />
      <Tabs.Screen name="missing" options={{ href: null }} />
    </Tabs>
  );
}
