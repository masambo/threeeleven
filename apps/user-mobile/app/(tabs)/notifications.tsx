import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { api } from '@311-security/backend/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PAGINATION = { paginationOpts: { cursor: null, numItems: 30 } } as const;

interface NotifMeta {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
}

function getNotifMeta(type: string): NotifMeta {
  switch (type) {
    case 'alert_published':
      return { icon: 'warning-outline', iconColor: colors.warning, iconBg: colors.warningBg };
    case 'report_status_change':
      return { icon: 'checkmark-circle-outline', iconColor: colors.success, iconBg: colors.successBg };
    case 'emergency_acknowledged':
      return { icon: 'shield-checkmark-outline', iconColor: colors.primary, iconBg: colors.primaryLight };
    case 'missing_update':
      return { icon: 'person-outline', iconColor: '#8B5CF6', iconBg: '#EDE9FE' };
    case 'system':
    default:
      return { icon: 'information-circle-outline', iconColor: colors.info, iconBg: colors.infoBg };
  }
}

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1d ago';
  return `${diffDays}d ago`;
}

export default function NotificationsScreen() {
  const notificationsResult = useQuery(api.notifications.mine, PAGINATION);
  const insets = useSafeAreaInsets();
  const items = notificationsResult?.page ?? [];

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={notifStyles.safe}>
      {/* ── Header ── */}
      <View style={[notifStyles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={notifStyles.headerTitle}>Notifications</Text>
        <View style={notifStyles.headerActions}>
          <Ionicons color={colors.textInverse} name="settings-outline" size={22} />
          <Ionicons color={colors.textInverse} name="ellipsis-vertical" size={22} />
        </View>
      </View>

      {unreadCount > 0 && (
        <View style={notifStyles.unreadBanner}>
          <Ionicons color={colors.primary} name="ellipse" size={8} />
          <Text style={notifStyles.unreadText}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[notifStyles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={notifStyles.empty}>
            <Ionicons color={colors.textTertiary} name="notifications-off-outline" size={48} />
            <Text style={notifStyles.emptyTitle}>No notifications yet</Text>
            <Text style={notifStyles.emptyText}>
              You will be notified about safety alerts, report updates, and more.
            </Text>
          </View>
        ) : (
          items.map((item, index) => {
            const meta = getNotifMeta(item.type ?? 'system');
            const isLast = index === items.length - 1;

            return (
              <View key={item._id}>
                <View style={notifStyles.item}>
                  <View style={[notifStyles.iconWrap, { backgroundColor: meta.iconBg }]}>
                    <Ionicons color={meta.iconColor} name={meta.icon} size={20} />
                  </View>

                  <View style={notifStyles.itemContent}>
                    <View style={notifStyles.itemTitleRow}>
                      <Text numberOfLines={1} style={notifStyles.itemTitle}>
                        {item.title}
                      </Text>
                      {!item.isRead && <View style={notifStyles.unreadDot} />}
                    </View>
                    <Text numberOfLines={2} style={notifStyles.itemMessage}>
                      {item.message}
                    </Text>
                    <Text style={notifStyles.itemTime}>
                      {formatRelativeTime(item._creationTime ?? Date.now())}
                    </Text>
                  </View>
                </View>
                {!isLast && <View style={notifStyles.divider} />}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const notifStyles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },

  header: {
    alignItems: 'center',
    backgroundColor: colors.primaryHeader,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.base,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
  },
  headerTitle: { color: colors.textInverse, fontSize: fontSizes.lg, fontWeight: '700' },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.base },

  unreadBanner: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  unreadText: { color: colors.primary, fontSize: fontSizes.sm, fontWeight: '600' },

  scrollContent: {
    backgroundColor: colors.surface,
    flexGrow: 1,
  },

  item: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radii.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  itemContent: { flex: 1, gap: 3 },
  itemTitleRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  itemTitle: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: fontSizes.base,
    fontWeight: '700',
  },
  unreadDot: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    height: 8,
    width: 8,
  },
  itemMessage: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    lineHeight: 18,
  },
  itemTime: { color: colors.textTertiary, fontSize: fontSizes.xs, marginTop: 2 },

  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginLeft: spacing.base + 44 + spacing.md,
  },

  empty: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing['2xl'],
    paddingTop: spacing['4xl'],
  },
  emptyTitle: { color: colors.textSecondary, fontSize: fontSizes.lg, fontWeight: '700' },
  emptyText: { color: colors.textTertiary, fontSize: fontSizes.base, lineHeight: 22, textAlign: 'center' },
});
