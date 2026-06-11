import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { api } from '@311-security/backend/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IdType = 'namibianId' | 'passport';

const REGIONS = [
  'Khomas',
  'Erongo',
  'Oshana',
  'Kavango East',
  'Karas',
  'Otjozondjupa',
  'Hardap',
  'Kunene',
  'Omusati',
  'Ohangwena',
  'Zambezi',
  'Omaheke',
  'Kavango West',
  '//Kharas',
];

export default function ProfileCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useQuery(api.users.current);
  const syncProfile = useMutation(api.users.syncProfile);
  const upsertContact = useMutation(api.emergencyContacts.upsert);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [region, setRegion] = useState('Khomas');
  const [idType, setIdType] = useState<IdType>('namibianId');
  const [idNumber, setIdNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile === undefined || profile === null) {
      return;
    }

    setFullName((current) => current || profile.fullName || '');
    setPhoneNumber((current) => current || profile.phoneNumber || '');
    setRegion((current) => current || profile.region || 'Khomas');
    setIdNumber((current) => current || profile.idNumber || '');
    setIdType(profile.idType ?? 'namibianId');
  }, [profile]);

  const canSave = fullName.trim().length > 1 && phoneNumber.trim().length >= 6 && region.trim().length > 0;

  const handleSave = async () => {
    if (!canSave || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await syncProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        region: region.trim(),
        idNumber: idNumber.trim() || undefined,
        idType,
        appType: 'user-mobile',
      });

      if (contactName.trim() && contactPhone.trim()) {
        await upsertContact({
          name: contactName.trim(),
          phoneNumber: contactPhone.trim(),
          priority: 1,
          relationship: 'family',
        });
      }

      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Could not save profile', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (profile === undefined) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingBottom: insets.bottom + spacing['2xl'], paddingTop: insets.top + spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons color={colors.primary} name="person-circle-outline" size={34} />
        </View>
        <Text style={styles.title}>Complete your profile</Text>
        <Text style={styles.subtitle}>These details are sent to responders when you press PANIC.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your details</Text>
        <Input label="Full name" onChangeText={setFullName} placeholder="Full name" value={fullName} />
        <Input
          keyboardType="phone-pad"
          label="Phone number"
          onChangeText={setPhoneNumber}
          placeholder="+264..."
          value={phoneNumber}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Region</Text>
          <View style={styles.regionGrid}>
            {REGIONS.slice(0, 6).map((item) => (
              <Pressable
                key={item}
                onPress={() => setRegion(item)}
                style={[styles.regionChip, region === item ? styles.regionChipActive : null]}
              >
                <Text style={[styles.regionChipText, region === item ? styles.regionChipTextActive : null]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            onChangeText={setRegion}
            placeholder="Or type your region"
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            value={region}
          />
        </View>

        <View style={styles.segmentRow}>
          {(['namibianId', 'passport'] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setIdType(item)}
              style={[styles.segment, idType === item ? styles.segmentActive : null]}
            >
              <Text style={[styles.segmentText, idType === item ? styles.segmentTextActive : null]}>
                {item === 'namibianId' ? 'Namibian ID' : 'Passport'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Input label="ID / Passport number" onChangeText={setIdNumber} placeholder="Optional" value={idNumber} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Emergency contact</Text>
        <Text style={styles.helperText}>Optional, but recommended. This contact is included with panic alerts.</Text>
        <Input label="Contact name" onChangeText={setContactName} placeholder="Name" value={contactName} />
        <Input
          keyboardType="phone-pad"
          label="Contact phone"
          onChangeText={setContactPhone}
          placeholder="+264..."
          value={contactPhone}
        />
      </View>

      <Pressable disabled={!canSave || isSaving} onPress={() => void handleSave()} style={[styles.saveButton, (!canSave || isSaving) ? styles.saveButtonDisabled : null]}>
        {isSaving ? <ActivityIndicator color={colors.textInverse} /> : <Text style={styles.saveButtonText}>Save and continue</Text>}
      </Pressable>
    </ScrollView>
  );
}

function Input({
  keyboardType,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  keyboardType?: 'default' | 'phone-pad';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.full,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSizes['2xl'],
    fontWeight: '900',
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    lineHeight: 22,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(17, 24, 39, 0.07)',
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.base,
    ...shadows.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '900',
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    lineHeight: 19,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontSize: fontSizes.sm,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: fontSizes.base,
    minHeight: 52,
    paddingHorizontal: spacing.base,
  },
  regionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  regionChip: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  regionChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  regionChipText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontWeight: '800',
  },
  regionChipTextActive: {
    color: colors.primary,
  },
  segmentRow: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.xs,
  },
  segment: {
    alignItems: 'center',
    borderRadius: radii.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  segmentText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: colors.primary,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    justifyContent: 'center',
    minHeight: 56,
    ...shadows.md,
  },
  saveButtonDisabled: {
    opacity: 0.55,
  },
  saveButtonText: {
    color: colors.textInverse,
    fontSize: fontSizes.base,
    fontWeight: '900',
  },
});
