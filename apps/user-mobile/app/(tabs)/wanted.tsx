import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { api } from '@311-security/backend/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LIST_ARGS = {
  paginationOpts: { cursor: null, numItems: 20 },
} as const;

const wantedPersonsIcon = require('../../assets/final_wanted_persons-removebg-preview.webp');

export default function WantedScreen() {
  const wantedPersons = useQuery(api.wantedPersons.active, LIST_ARGS);
  const insets = useSafeAreaInsets();
  const items = wantedPersons?.page ?? [];

  return (
    <ScrollView
      contentContainerStyle={[screenStyles.container, { paddingTop: insets.top + spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={screenStyles.hero}>
        <View style={screenStyles.heroIcon}>
          <Image resizeMode="contain" source={wantedPersonsIcon} style={screenStyles.heroImage} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={screenStyles.eyebrow}>Police notices</Text>
          <Text style={screenStyles.title}>Wanted persons</Text>
          <Text style={screenStyles.body}>Persons of interest published by police or admins.</Text>
        </View>
      </View>

      <View style={screenStyles.list}>
        {items.length === 0 ? (
          <View style={screenStyles.emptyCard}>
            <Ionicons color={colors.textTertiary} name="person-outline" size={42} />
            <Text style={screenStyles.emptyTitle}>No active wanted notices</Text>
            <Text style={screenStyles.emptyText}>Police-published notices will appear here.</Text>
          </View>
        ) : (
          items.map((person) => (
            <View key={person._id} style={screenStyles.personCard}>
              <View style={screenStyles.personTop}>
                <View style={screenStyles.personIcon}>
                  <Ionicons color="#7C3AED" name="person" size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={screenStyles.cardTitle}>{person.name}</Text>
                  {person.alias ? <Text style={screenStyles.cardMeta}>Alias: {person.alias}</Text> : null}
                </View>
                <View style={screenStyles.riskBadge}>
                  <Text style={screenStyles.riskText}>{person.riskLevel}</Text>
                </View>
              </View>

              <View style={screenStyles.infoBlock}>
                <InfoLine icon="shield-outline" text={`Wanted for: ${person.wantedFor}`} />
                <InfoLine
                  icon="location-outline"
                  text={`Last known: ${person.lastKnownLocation ?? 'Unknown'}`}
                />
              </View>
              <Text style={screenStyles.cardBody}>{person.description}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function InfoLine({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={screenStyles.infoLine}>
      <Ionicons color={colors.primary} name={icon} size={16} />
      <Text style={screenStyles.infoText}>{text}</Text>
    </View>
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
    backgroundColor: '#F0ECFF',
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
  personCard: {
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
  personTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  personIcon: {
    alignItems: 'center',
    backgroundColor: '#F0ECFF',
    borderRadius: radii.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
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
  riskBadge: {
    backgroundColor: colors.dangerBg,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  riskText: {
    color: colors.danger,
    fontSize: fontSizes.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  infoBlock: {
    gap: spacing.xs,
  },
  infoLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  infoText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: fontSizes.sm,
    lineHeight: 18,
  },
  cardBody: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    lineHeight: 22,
  },
});
