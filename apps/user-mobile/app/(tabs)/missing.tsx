import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { api } from '@311-security/backend/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LIST_ARGS = {
  paginationOpts: { cursor: null, numItems: 20 },
} as const;

const missingPersonIcon = require('../../assets/missing person.png');

export default function MissingScreen() {
  const insets = useSafeAreaInsets();
  const publicReports = useQuery(api.missingReports.publicApproved, LIST_ARGS);
  const missingPeople = (publicReports?.page ?? []).filter(
    (report) => report.reportType === 'missing_person',
  );

  return (
    <ScrollView
      contentContainerStyle={[screenStyles.container, { paddingTop: insets.top + spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={screenStyles.hero}>
        <View style={screenStyles.heroIcon}>
          <Image resizeMode="contain" source={missingPersonIcon} style={screenStyles.heroImage} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={screenStyles.eyebrow}>Missing persons</Text>
          <Text style={screenStyles.title}>Published cases</Text>
          <Text style={screenStyles.body}>Admin-approved missing-person notices for the public.</Text>
        </View>
      </View>

      <View style={screenStyles.list}>
        {missingPeople.length === 0 ? (
          <View style={screenStyles.emptyCard}>
            <Image resizeMode="contain" source={missingPersonIcon} style={screenStyles.emptyImage} />
            <Text style={screenStyles.emptyTitle}>No published missing-person cases</Text>
            <Text style={screenStyles.emptyText}>Approved notices from admins will appear here.</Text>
          </View>
        ) : (
          missingPeople.map((report) => (
            <View key={report._id} style={screenStyles.caseCard}>
              {report.photoUrls?.[0] ? (
                <Image source={{ uri: report.photoUrls[0] }} style={screenStyles.casePhoto} />
              ) : (
                <View style={screenStyles.casePhotoFallback}>
                  <Image resizeMode="contain" source={missingPersonIcon} style={screenStyles.fallbackImage} />
                </View>
              )}
              <View style={screenStyles.caseBody}>
                <Text style={screenStyles.caseTitle}>{report.personName || report.title}</Text>
                <View style={screenStyles.metaLine}>
                  <Ionicons color={colors.primary} name="location-outline" size={16} />
                  <Text style={screenStyles.metaText}>{report.lastSeenLocation ?? 'Location not listed'}</Text>
                </View>
                <Text numberOfLines={3} style={screenStyles.description}>
                  {report.description}
                </Text>
                {report.contactPhone ? (
                  <View style={screenStyles.contactBadge}>
                    <Ionicons color={colors.success} name="call-outline" size={14} />
                    <Text style={screenStyles.contactText}>{report.contactPhone}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const screenStyles = StyleSheet.create({
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
    backgroundColor: '#EAF8FA',
    borderRadius: radii.lg,
    height: 70,
    justifyContent: 'center',
    width: 70,
  },
  heroImage: {
    height: 58,
    width: 58,
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
  emptyImage: {
    height: 62,
    width: 62,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    lineHeight: 22,
    textAlign: 'center',
  },
  caseCard: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(17, 24, 39, 0.07)',
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.md,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  casePhoto: {
    aspectRatio: 16 / 10,
    backgroundColor: colors.surfaceSecondary,
    width: '100%',
  },
  casePhotoFallback: {
    alignItems: 'center',
    aspectRatio: 16 / 10,
    backgroundColor: '#EAF8FA',
    justifyContent: 'center',
    width: '100%',
  },
  fallbackImage: {
    height: 96,
    width: 96,
  },
  caseBody: {
    gap: spacing.sm,
    padding: spacing.base,
  },
  caseTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '900',
  },
  metaLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    lineHeight: 22,
  },
  contactBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.successBg,
    borderRadius: radii.full,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  contactText: {
    color: colors.success,
    fontSize: fontSizes.sm,
    fontWeight: '900',
  },
});
