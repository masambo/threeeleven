import { StyleSheet } from 'react-native';
import { colors, fontSizes, radii, shadows, spacing } from './theme';

/** Shared stylesheet for screens that still use the legacy style map. */
export const styles = StyleSheet.create({
  // ── Layout ──────────────────────────────────────────────────────────
  container: {
    backgroundColor: colors.background,
    flexGrow: 1,
    padding: spacing.base,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing['2xl'],
  },

  // ── Typography ──────────────────────────────────────────────────────
  eyebrow: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSizes['3xl'],
    fontWeight: '800',
    lineHeight: 36,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    lineHeight: 22,
  },
  body: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    lineHeight: 22,
  },
  label: {
    color: colors.textPrimary,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },

  // ── Cards ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.base,
    ...shadows.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  cardMeta: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
  },

  // ── Inputs ─────────────────────────────────────────────────────────
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    minHeight: 52,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },

  // ── Buttons ────────────────────────────────────────────────────────
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.base,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  emergencyButton: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radii.lg,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.base,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    fontWeight: '600',
  },

  // ── Lists ──────────────────────────────────────────────────────────
  list: {
    gap: spacing.md,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
  },

  // ── Misc ───────────────────────────────────────────────────────────
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radii.full,
    height: 18,
    justifyContent: 'center',
    minWidth: 18,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
});
