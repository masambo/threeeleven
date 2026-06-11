import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { api } from '@311-security/backend/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface SettingsRow {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  subtitle: string;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const profile = useQuery(api.users.current);
  const contacts = useQuery(api.emergencyContacts.listMine, {});
  const upsertContact = useMutation(api.emergencyContacts.upsert);

  const [showAddContact, setShowAddContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fullName = profile?.fullName ?? 'Demo User';
  const phoneNumber = profile?.phoneNumber ?? '';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleAddContact = async () => {
    if (!contactName.trim() || !contactPhone.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await upsertContact({
        name: contactName.trim(),
        phoneNumber: contactPhone.trim(),
        relationship: 'family',
        priority: 1,
      });
      setContactName('');
      setContactPhone('');
      setShowAddContact(false);
      Alert.alert('Contact saved', 'Emergency contact added to your profile.');
    } catch (error) {
      Alert.alert('Save failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Demo mode', 'Clerk login is disabled for now, so there is no session to sign out.');
  };

  const ACCOUNT_SETTINGS: SettingsRow[] = [
    {
      icon: 'create-outline',
      iconColor: colors.primary,
      iconBg: colors.primaryLight,
      label: 'Edit Profile',
      subtitle: 'Update your personal information',
    },
  ];

  const APP_SETTINGS: SettingsRow[] = [
    {
      icon: 'notifications-outline',
      iconColor: '#8B5CF6',
      iconBg: '#EDE9FE',
      label: 'Notifications',
      subtitle: 'Configure alert preferences',
    },
    {
      icon: 'location-outline',
      iconColor: '#10B981',
      iconBg: '#D1FAE5',
      label: 'Location Settings',
      subtitle: 'Manage location permissions',
    },
    {
      icon: 'shield-outline',
      iconColor: colors.primary,
      iconBg: colors.primaryLight,
      label: 'Privacy & Security',
      subtitle: 'Control your data and privacy',
    },
  ];

  const SUPPORT_SETTINGS: SettingsRow[] = [
    {
      icon: 'help-circle-outline',
      iconColor: colors.warning,
      iconBg: colors.warningBg,
      label: 'Help & Support',
      subtitle: 'Get help or report an issue',
    },
    {
      icon: 'information-circle-outline',
      iconColor: colors.textSecondary,
      iconBg: colors.surfaceSecondary,
      label: 'About 3:11 Security',
      subtitle: 'Version 2.0 – Community edition',
    },
  ];

  return (
    <SafeAreaView style={profileStyles.safe}>
      <ScrollView
        contentContainerStyle={profileStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Blue profile header ── */}
        <View style={profileStyles.header}>
          <View style={profileStyles.headerTop}>
            <View style={profileStyles.backPlaceholder} />
            <Text style={profileStyles.headerTitle}>Profile</Text>
            <Pressable style={profileStyles.menuBtn}>
              <Ionicons color={colors.textInverse} name="ellipsis-vertical" size={22} />
            </Pressable>
          </View>

          <View style={profileStyles.avatarWrap}>
            <View style={profileStyles.avatar}>
              <Text style={profileStyles.avatarInitials}>{initials}</Text>
            </View>
            <View style={profileStyles.cameraBtn}>
              <Ionicons color={colors.textInverse} name="camera" size={14} />
            </View>
          </View>

          <Text style={profileStyles.name}>{fullName}</Text>
          {phoneNumber ? <Text style={profileStyles.phone}>{phoneNumber}</Text> : null}

          <View style={profileStyles.statusRow}>
            <View
              style={[
                profileStyles.statusBadge,
                profile?.isVerified ? profileStyles.verifiedBadge : profileStyles.pendingBadge,
              ]}
            >
              <Ionicons
                color={profile?.isVerified ? colors.success : colors.warning}
                name={profile?.isVerified ? 'checkmark-circle' : 'time-outline'}
                size={13}
              />
              <Text
                style={[
                  profileStyles.statusText,
                  { color: profile?.isVerified ? colors.success : colors.warning },
                ]}
              >
                {profile?.isVerified ? 'Verified Citizen' : 'Verification Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Settings sections ── */}
        <View style={profileStyles.sections}>
          <SettingsSection label="Account" rows={ACCOUNT_SETTINGS} />
          <SettingsSection label="Settings" rows={APP_SETTINGS} />

          {/* ── Emergency contacts ── */}
          <View style={profileStyles.section}>
            <Text style={profileStyles.sectionLabel}>Emergency Contacts</Text>
            <View style={profileStyles.sectionCard}>
              {(contacts ?? []).map((contact, i) => (
                <View key={contact._id}>
                  {i > 0 && <View style={profileStyles.rowDivider} />}
                  <View style={profileStyles.contactRow}>
                    <View style={[profileStyles.rowIcon, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons color={colors.danger} name="call-outline" size={18} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={profileStyles.rowLabel}>{contact.name}</Text>
                      <Text style={profileStyles.rowSub}>{contact.phoneNumber}</Text>
                    </View>
                  </View>
                </View>
              ))}
              {(contacts ?? []).length === 0 && (
                <View style={profileStyles.emptyContacts}>
                  <Text style={profileStyles.emptyContactsText}>No emergency contacts added yet.</Text>
                </View>
              )}
            </View>

            <Pressable
              onPress={() => setShowAddContact(!showAddContact)}
              style={profileStyles.addContactBtn}
            >
              <Ionicons
                color={colors.primary}
                name={showAddContact ? 'remove-circle-outline' : 'add-circle-outline'}
                size={18}
              />
              <Text style={profileStyles.addContactText}>
                {showAddContact ? 'Cancel' : 'Add Emergency Contact'}
              </Text>
            </Pressable>

            {showAddContact && (
              <View style={profileStyles.addContactForm}>
                <TextInput
                  onChangeText={setContactName}
                  placeholder="Contact name"
                  placeholderTextColor={colors.textTertiary}
                  style={profileStyles.input}
                  value={contactName}
                />
                <TextInput
                  keyboardType="phone-pad"
                  onChangeText={setContactPhone}
                  placeholder="Phone number"
                  placeholderTextColor={colors.textTertiary}
                  style={profileStyles.input}
                  value={contactPhone}
                />
                <Pressable
                  disabled={isSubmitting}
                  onPress={() => void handleAddContact()}
                  style={[profileStyles.saveContactBtn, isSubmitting && { opacity: 0.6 }]}
                >
                  <Text style={profileStyles.saveContactText}>
                    {isSubmitting ? 'Saving...' : 'Save Contact'}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          <SettingsSection label="Support" rows={SUPPORT_SETTINGS} />

          {/* ── Sign out ── */}
          <Pressable onPress={handleSignOut} style={profileStyles.signOutBtn}>
            <Ionicons color={colors.danger} name="log-out-outline" size={20} />
            <Text style={profileStyles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function SettingsSection({ label, rows }: { label: string; rows: SettingsRow[] }) {
  return (
    <View style={profileStyles.section}>
      <Text style={profileStyles.sectionLabel}>{label}</Text>
      <View style={profileStyles.sectionCard}>
        {rows.map((row, i) => (
          <View key={row.label}>
            {i > 0 && <View style={profileStyles.rowDivider} />}
            <Pressable onPress={row.onPress} style={profileStyles.settingsRow}>
              <View style={[profileStyles.rowIcon, { backgroundColor: row.iconBg }]}>
                <Ionicons color={row.iconColor} name={row.icon} size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={profileStyles.rowLabel}>{row.label}</Text>
                <Text style={profileStyles.rowSub}>{row.subtitle}</Text>
              </View>
              <Ionicons color={colors.textTertiary} name="chevron-forward" size={18} />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const profileStyles = StyleSheet.create({
  safe: { backgroundColor: colors.primaryHeader, flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: spacing['2xl'] },

  // Header
  header: {
    alignItems: 'center',
    backgroundColor: colors.primaryHeader,
    paddingBottom: spacing['2xl'],
    paddingTop: spacing.base,
  },
  headerTop: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  backPlaceholder: { width: 32 },
  headerTitle: { color: colors.textInverse, fontSize: fontSizes.lg, fontWeight: '700' },
  menuBtn: { padding: 4 },

  avatarWrap: {
    marginTop: spacing.xl,
    position: 'relative',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: radii.full,
    borderWidth: 2,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  avatarInitials: {
    color: colors.textInverse,
    fontSize: fontSizes['2xl'],
    fontWeight: '800',
  },
  cameraBtn: {
    alignItems: 'center',
    backgroundColor: colors.success,
    borderColor: colors.textInverse,
    borderRadius: radii.full,
    borderWidth: 2,
    bottom: 0,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 28,
  },
  name: {
    color: colors.textInverse,
    fontSize: fontSizes['2xl'],
    fontWeight: '800',
    marginTop: spacing.md,
  },
  phone: { color: 'rgba(255,255,255,0.7)', fontSize: fontSizes.base, marginTop: 2 },
  statusRow: { flexDirection: 'row', marginTop: spacing.md },
  statusBadge: {
    alignItems: 'center',
    borderRadius: radii.full,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  verifiedBadge: { backgroundColor: colors.successBg },
  pendingBadge: { backgroundColor: colors.warningBg },
  statusText: { fontSize: fontSizes.sm, fontWeight: '700' },

  // Sections container
  sections: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.xl,
    padding: spacing.base,
    paddingTop: spacing.xl,
  },
  section: { gap: spacing.sm },
  sectionLabel: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.sm,
  },

  // Settings rows
  settingsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    backgroundColor: colors.border,
    height: 1,
    marginLeft: spacing.base + 40 + spacing.md,
  },
  rowIcon: {
    alignItems: 'center',
    borderRadius: radii.sm,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  rowLabel: { color: colors.textPrimary, fontSize: fontSizes.base, fontWeight: '600' },
  rowSub: { color: colors.textSecondary, fontSize: fontSizes.sm, marginTop: 1 },

  // Emergency contacts
  contactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  emptyContacts: { padding: spacing.base },
  emptyContactsText: { color: colors.textTertiary, fontSize: fontSizes.sm },
  addContactBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  addContactText: { color: colors.primary, fontSize: fontSizes.base, fontWeight: '600' },
  addContactForm: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.base,
    ...shadows.sm,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: fontSizes.base,
    minHeight: 48,
    paddingHorizontal: spacing.base,
  },
  saveContactBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  saveContactText: { color: colors.textInverse, fontSize: fontSizes.base, fontWeight: '700' },

  // Sign out
  signOutBtn: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.base,
    ...shadows.sm,
  },
  signOutText: { color: colors.danger, fontSize: fontSizes.base, fontWeight: '700' },
});
