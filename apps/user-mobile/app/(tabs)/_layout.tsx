import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="report" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="alerts" />
      <Tabs.Screen name="emergency" />
      <Tabs.Screen name="missing" />
      <Tabs.Screen name="stolen" />
      <Tabs.Screen name="wanted" />
    </Tabs>
  );
}
