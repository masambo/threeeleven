import { styles } from '@/lib/styles';
import { api } from '@311-security/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

const LIST_ARGS = {
  paginationOpts: { cursor: null, numItems: 20 },
} as const;

export default function AlertsScreen() {
  const alerts = useQuery(api.safetyAlerts.active, LIST_ARGS);

  if (alerts === undefined) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Safety alerts</Text>
      <Text style={styles.title}>Public advisories</Text>
      <View style={styles.list}>
        {alerts.page.length === 0 ? (
          <Text style={styles.body}>No active safety alerts in your area.</Text>
        ) : (
          alerts.page.map((alert) => (
            <View key={alert._id} style={styles.card}>
              <Text style={styles.cardTitle}>{alert.title}</Text>
              <Text style={styles.cardMeta}>
                {[alert.region, alert.city].filter(Boolean).join(', ') || 'Regional alert'}
              </Text>
              <Text style={styles.body}>{alert.message}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
