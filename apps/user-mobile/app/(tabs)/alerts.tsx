import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { api } from '@311-security/backend/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LIST_ARGS = {
  paginationOpts: { cursor: null, numItems: 20 },
} as const;

const safetyAlertsIcon = require('../../assets/safety_alerts_icon-removebg-preview.webp');

export default function AlertsScreen() {
  const alerts = useQuery(api.safetyAlerts.active, LIST_ARGS);
  const insets = useSafeAreaInsets();

  if (alerts === undefined) {
    return (
      <View style={[screenStyles.loading, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[screenStyles.container, { paddingTop: insets.top + spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={screenStyles.hero}>
        <View style={screenStyles.heroIcon}>
          <Image resizeMode="contain" source={safetyAlertsIcon} style={screenStyles.heroImage} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={screenStyles.eyebrow}>Police notices</Text>
          <Text style={screenStyles.title}>Safety alerts</Text>
          <Text style={screenStyles.body}>Official advisories for your area.</Text>
        </View>
      </View>

      <View style={screenStyles.list}>
        {alerts.page.length === 0 ? (
          <View style={screenStyles.emptyCard}>
            <Ionicons color={colors.textTertiary} name="shield-checkmark-outline" size={42} />
            <Text style={screenStyles.emptyTitle}>No active notices</Text>
            <Text style={screenStyles.emptyText}>Police-published advisories will appear here.</Text>
          </View>
        ) : (
          alerts.page.map((alert) => (
            <View key={alert._id} style={screenStyles.alertCard}>
              <View style={screenStyles.alertTop}>
                <View style={screenStyles.alertIcon}>
                  <Ionicons color={colors.warning} name="alert-circle" size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={screenStyles.cardTitle}>{alert.title}</Text>
                  <Text style={screenStyles.cardMeta}>
                    {[alert.region, alert.city].filter(Boolean).join(', ') || 'Regional alert'}
                  </Text>
                </View>
              </View>
              <Text style={screenStyles.cardBody}>{alert.message}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const screenStyles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#EEF4FF',
    flexGrow: 1,
    gap: spacing.base,
    padding: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.primaryHeader,
    borderRadius: radii.xl,
    flexDirection: 'row',
    gap: spacing.base,
    padding: spacing.lg,
    ...shadows.md,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    borderRadius: radii.lg,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  heroImage: {
    height: 54,
    width: 54,
  },
  eyebrow: {
    color: colors.blue200,
    fontSize: fontSizes.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.textInverse,
    fontSize: fontSizes['2xl'],
    fontWeight: '900',
    marginTop: 2,
  },
  body: {
    color: colors.blue200,
    fontSize: fontSizes.base,
    lineHeight: 22,
    marginTop: 3,
  },
  list: {
    gap: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: 'rgba(17, 24, 39, 0.07)',
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing['2xl'],
    ...shadows.md,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    lineHeight: 22,
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(17, 24, 39, 0.07)',
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.base,
    ...shadows.md,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  alertTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  alertIcon: {
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    borderRadius: radii.md,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '900',
  },
  cardMeta: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    marginTop: 2,
  },
  cardBody: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    lineHeight: 22,
  },
});
