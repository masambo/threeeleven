import { type MapAlert, type MapZone, CrimeMap } from '@/components/CrimeMap';
import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { api } from '@311-security/backend/convex/_generated/api';
import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { Link, useRouter } from 'expo-router';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PAGINATION = { paginationOpts: { cursor: null, numItems: 20 } } as const;

const SAFETY_TIPS = [
  { icon: 'location-outline' as const, tip: 'Always let someone know where you are going and when you will be back.' },
  { icon: 'eye-outline' as const, tip: 'If you see something suspicious, report it immediately.' },
  { icon: 'call-outline' as const, tip: 'Keep emergency contacts updated in your profile.' },
];

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const profile = useQuery(api.users.current);
  const alerts = useQuery(api.safetyAlerts.active, PAGINATION);
  const reports = useQuery(api.crimeReports.mine, PAGINATION);
  const dangerZones = useQuery(api.dangerZones.active, PAGINATION);
  const emergencies = useQuery(api.emergencyAlerts.mine, PAGINATION);

  const firstName = profile?.fullName?.split(' ')[0] ?? user?.firstName ?? 'User';
  const locationDisplay = profile?.region ?? 'Namibia';

  // Build map data from live Convex results
  const mapZones: MapZone[] = (dangerZones?.page ?? [])
    .filter((z) => z.centerLatitude !== undefined && z.centerLongitude !== undefined)
    .map((z) => ({
      id: z._id,
      latitude: z.centerLatitude as number,
      longitude: z.centerLongitude as number,
      radiusMeters: z.radiusMeters,
      riskLevel: (z.riskLevel ?? 'medium') as MapZone['riskLevel'],
      name: z.name,
    }));

  const mapAlerts: MapAlert[] = (alerts?.page ?? [])
    .filter((a) => a.latitude !== undefined && a.longitude !== undefined)
    .map((a) => ({
      id: a._id,
      latitude: a.latitude as number,
      longitude: a.longitude as number,
      title: a.title,
      severity: a.severity,
    }));

  const alertCount = alerts?.page.length ?? 0;
  const reportCount = reports?.page.length ?? 0;
  const zoneCount = dangerZones?.page.length ?? 0;
  const emergencyCount = emergencies?.page.length ?? 0;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryHeader} />

      {/* ── Blue Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.locationRow}>
            <Ionicons color={colors.blue200} name="location-outline" size={14} />
            <Text style={styles.locationLabel}>Your Location</Text>
          </View>
          <Text numberOfLines={1} style={styles.locationValue}>
            {locationDisplay}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={() => router.push('/(tabs)/notifications')}
            style={styles.headerIconBtn}
          >
            <Ionicons color={colors.textInverse} name="notifications-outline" size={22} />
            {alertCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{alertCount > 9 ? '9+' : alertCount}</Text>
              </View>
            )}
          </Pressable>

          <Pressable onPress={() => router.push('/(tabs)/profile')} style={styles.avatarBtn}>
            <Ionicons color={colors.primary} name="person" size={18} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting ── */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Good day, {firstName} 👋</Text>
            <Text style={styles.greetingSubtitle}>Stay safe and connected</Text>
          </View>
          {!profile?.isVerified && (
            <View style={styles.unverifiedBadge}>
              <Text style={styles.unverifiedText}>Unverified</Text>
            </View>
          )}
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <StatChip
            color={colors.danger}
            colorBg={colors.dangerBg}
            icon="warning-outline"
            label="Active alerts"
            value={alertCount}
          />
          <StatChip
            color={colors.primary}
            colorBg={colors.primaryLight}
            icon="document-text-outline"
            label="My reports"
            value={reportCount}
          />
          <StatChip
            color={colors.warning}
            colorBg={colors.warningBg}
            icon="shield-outline"
            label="Danger zones"
            value={zoneCount}
          />
        </View>

        {/* ── Crime Map ── */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Community Safety Map</Text>
            <View style={styles.mapLiveDot} />
            <Text style={styles.mapLiveLabel}>Live</Text>
          </View>
          <CrimeMap
            alerts={mapAlerts}
            style={styles.map}
            zoom={11}
            zones={mapZones}
          />
          <View style={styles.mapLegend}>
            <LegendItem color={colors.danger} label="Critical" />
            <LegendItem color="#f97316" label="High" />
            <LegendItem color={colors.warning} label="Medium" />
            <LegendItem color={colors.success} label="Low risk" />
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionCard
            color="#FEF3C7"
            iconBg="#F59E0B"
            iconName="warning-outline"
            label="Safety Alerts"
            subLabel="View security &amp; safety notifications"
            onPress={() => router.push('/(tabs)/alerts')}
          />
          <ActionCard
            color="#FEE2E2"
            iconBg="#EF4444"
            iconName="document-text-outline"
            label="Report Crime"
            subLabel="Report incidents safely"
            onPress={() => router.push('/(tabs)/report')}
          />
          <ActionCard
            color="#D1FAE5"
            iconBg="#10B981"
            iconName="shield-checkmark-outline"
            label="Emergency Services"
            subLabel="Quick access to help"
            onPress={() => router.push('/(tabs)/emergency')}
          />
          <ActionCard
            color="#DBEAFE"
            iconBg="#2563EB"
            iconName="search-outline"
            label="Missing Persons"
            subLabel="Browse or submit reports"
            onPress={() => router.push('/(tabs)/missing')}
          />
        </View>

        {/* ── Safety Tips ── */}
        <Text style={styles.sectionTitle}>Safety Tips</Text>
        <View style={styles.tipsContainer}>
          {SAFETY_TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <Ionicons color={colors.primary} name={tip.icon} size={18} />
              </View>
              <Text style={styles.tipText}>{tip.tip}</Text>
            </View>
          ))}
        </View>

        {/* ── SOS Footer ── */}
        <Link asChild href="/(tabs)/emergency">
          <Pressable style={styles.sosButton}>
            <Ionicons color={colors.textInverse} name="alert-circle-outline" size={22} />
            <Text style={styles.sosText}>Trigger Emergency SOS</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function StatChip({
  color,
  colorBg,
  icon,
  label,
  value,
}: {
  color: string;
  colorBg: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
}) {
  return (
    <View style={[chipStyles.chip, { backgroundColor: colorBg, borderColor: color + '33' }]}>
      <Ionicons color={color} name={icon} size={18} />
      <Text style={[chipStyles.value, { color }]}>{value}</Text>
      <Text style={chipStyles.label}>{label}</Text>
    </View>
  );
}

function ActionCard({
  color,
  iconBg,
  iconName,
  label,
  onPress,
  subLabel,
}: {
  color: string;
  iconBg: string;
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  subLabel: string;
}) {
  return (
    <Pressable onPress={onPress} style={actionStyles.card}>
      <View style={[actionStyles.iconWrap, { backgroundColor: color }]}>
        <Ionicons color={iconBg} name={iconName} size={26} />
      </View>
      <Text style={actionStyles.label}>{label}</Text>
      <Text numberOfLines={2} style={actionStyles.sub}>
        {subLabel}
      </Text>
    </Pressable>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={legendStyles.item}>
      <View style={[legendStyles.dot, { backgroundColor: color }]} />
      <Text style={legendStyles.label}>{label}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },

  // Header
  header: {
    alignItems: 'center',
    backgroundColor: colors.primaryHeader,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.base,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
  },
  headerLeft: { flex: 1 },
  locationRow: { alignItems: 'center', flexDirection: 'row', gap: 4, marginBottom: 2 },
  locationLabel: { color: colors.blue200, fontSize: fontSizes.xs, fontWeight: '500' },
  locationValue: {
    color: colors.textInverse,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    maxWidth: 220,
  },
  headerRight: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  headerIconBtn: { padding: 4, position: 'relative' },
  notifBadge: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderColor: colors.primaryHeader,
    borderRadius: radii.full,
    borderWidth: 1.5,
    height: 16,
    justifyContent: 'center',
    minWidth: 16,
    paddingHorizontal: 2,
    position: 'absolute',
    right: -2,
    top: -2,
  },
  notifBadgeText: { color: colors.textInverse, fontSize: 9, fontWeight: '700' },
  avatarBtn: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    height: 36,
    justifyContent: 'center',
    width: 36,
    ...shadows.sm,
  },

  // Scroll
  scrollContent: {
    gap: spacing.base,
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },

  // Greeting
  greetingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: fontSizes['2xl'],
    fontWeight: '800',
  },
  greetingSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    marginTop: 2,
  },
  unverifiedBadge: {
    backgroundColor: colors.warningBg,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  unverifiedText: { color: colors.warning, fontSize: fontSizes.xs, fontWeight: '700' },

  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.sm },

  // Map
  mapCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.md,
  },
  mapHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  mapTitle: { color: colors.textPrimary, flex: 1, fontSize: fontSizes.md, fontWeight: '700' },
  mapLiveDot: {
    backgroundColor: colors.success,
    borderRadius: radii.full,
    height: 8,
    width: 8,
  },
  mapLiveLabel: { color: colors.success, fontSize: fontSizes.sm, fontWeight: '600' },
  map: { height: 240 },
  mapLegend: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },

  // Sections
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  // Tips
  tipsContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.base,
    ...shadows.sm,
  },
  tipRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md },
  tipIcon: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.sm,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  tipText: { color: colors.textSecondary, flex: 1, fontSize: fontSizes.base, lineHeight: 22 },

  // SOS
  sosButton: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.xs,
    minHeight: 56,
    ...shadows.md,
  },
  sosText: { color: colors.textInverse, fontSize: fontSizes.md, fontWeight: '700' },
});

const chipStyles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  value: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    textAlign: 'center',
  },
});

const actionStyles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.base,
    width: '47.5%',
    ...shadows.sm,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radii.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  label: {
    color: colors.textPrimary,
    fontSize: fontSizes.base,
    fontWeight: '700',
  },
  sub: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    lineHeight: 16,
  },
});

const legendStyles = StyleSheet.create({
  item: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  dot: { borderRadius: radii.full, height: 8, width: 8 },
  label: { color: colors.textSecondary, fontSize: fontSizes.xs },
});
