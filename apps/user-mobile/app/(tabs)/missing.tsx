import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { api } from '@311-security/backend/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const LIST_ARGS = {
  paginationOpts: { cursor: null, numItems: 10 },
} as const;

const wantedPersonsIcon = require('../../assets/final_wanted_persons-removebg-preview.webp');

type MissingType = 'missing_person' | 'lost_item' | 'stolen_item';

const REPORT_TYPES: Array<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: MissingType;
}> = [
  { icon: 'person-outline', label: 'Person', value: 'missing_person' },
  { icon: 'cube-outline', label: 'Lost item', value: 'lost_item' },
  { icon: 'shield-outline', label: 'Stolen item', value: 'stolen_item' },
];

export default function MissingScreen() {
  const createReport = useMutation(api.missingReports.create);
  const publicReports = useQuery(api.missingReports.publicApproved, LIST_ARGS);
  const myReports = useQuery(api.missingReports.mine, LIST_ARGS);
  const [reportType, setReportType] = useState<MissingType>('missing_person');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [personName, setPersonName] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [lastSeenLocation, setLastSeenLocation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPerson = reportType === 'missing_person';

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createReport({
        reportType,
        title: title.trim(),
        description: description.trim(),
        personName: isPerson ? personName.trim() || undefined : undefined,
        itemName: !isPerson ? itemName.trim() || undefined : undefined,
        itemCategory: !isPerson ? itemCategory.trim() || undefined : undefined,
        serialNumber: !isPerson ? serialNumber.trim() || undefined : undefined,
        lastSeenLocation: lastSeenLocation.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
      });
      setTitle('');
      setDescription('');
      setPersonName('');
      setItemName('');
      setItemCategory('');
      setSerialNumber('');
      setLastSeenLocation('');
      setContactPhone('');
      Alert.alert('Report submitted', 'Your report is awaiting admin review.');
    } catch (error) {
      Alert.alert('Submission failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={screenStyles.container} showsVerticalScrollIndicator={false}>
      <View style={screenStyles.hero}>
        <View style={screenStyles.heroIcon}>
          <Image resizeMode="contain" source={wantedPersonsIcon} style={screenStyles.heroImage} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={screenStyles.eyebrow}>Missing registry</Text>
          <Text style={screenStyles.title}>People and items</Text>
          <Text style={screenStyles.body}>Post missing people, lost items, or stolen property.</Text>
        </View>
      </View>

      <View style={screenStyles.segmentRow}>
        {REPORT_TYPES.map((type) => {
          const isActive = reportType === type.value;

          return (
            <Pressable
              key={type.value}
              onPress={() => setReportType(type.value)}
              style={[screenStyles.segment, isActive ? screenStyles.segmentActive : null]}
            >
              <Ionicons
                color={isActive ? colors.primary : colors.textSecondary}
                name={type.icon}
                size={18}
              />
              <Text style={[screenStyles.segmentText, isActive ? screenStyles.segmentTextActive : null]}>
                {type.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={screenStyles.formCard}>
        <Text style={screenStyles.sectionTitle}>Create report</Text>
        <Input onChangeText={setTitle} placeholder="Report title" value={title} />
        {isPerson ? (
          <Input onChangeText={setPersonName} placeholder="Person name" value={personName} />
        ) : (
          <>
            <Input onChangeText={setItemName} placeholder="Item name" value={itemName} />
            <Input onChangeText={setItemCategory} placeholder="Item category" value={itemCategory} />
            <Input
              autoCapitalize="characters"
              onChangeText={setSerialNumber}
              placeholder="Serial number / IMEI / VIN"
              value={serialNumber}
            />
          </>
        )}
        <Input onChangeText={setLastSeenLocation} placeholder="Last seen location" value={lastSeenLocation} />
        <Input
          keyboardType="phone-pad"
          onChangeText={setContactPhone}
          placeholder="Contact phone"
          value={contactPhone}
        />
        <Input multiline onChangeText={setDescription} placeholder="Description" value={description} />
        <Pressable
          disabled={isSubmitting}
          onPress={() => void handleSubmit()}
          style={[screenStyles.primaryButton, isSubmitting ? screenStyles.disabledButton : null]}
        >
          <Text style={screenStyles.primaryButtonText}>{isSubmitting ? 'Submitting...' : 'Submit report'}</Text>
        </Pressable>
      </View>

      <CaseList title="Published cases" emptyText="No published cases yet.">
        {(publicReports?.page ?? []).map((report) => (
          <View key={report._id} style={screenStyles.caseCard}>
            <Text style={screenStyles.cardTitle}>{report.title}</Text>
            <Text style={screenStyles.cardMeta}>
              {report.reportType.replace(/_/g, ' ')} | {report.lastSeenLocation ?? 'Location unknown'}
            </Text>
            {report.serialNumber ? <Text style={screenStyles.cardMeta}>Serial: {report.serialNumber}</Text> : null}
          </View>
        ))}
      </CaseList>

      <CaseList title="Your submissions" emptyText="No submissions yet.">
        {(myReports?.page ?? []).map((report) => (
          <View key={report._id} style={screenStyles.caseCard}>
            <Text style={screenStyles.cardTitle}>{report.title}</Text>
            <Text style={screenStyles.cardMeta}>Status: {report.status}</Text>
          </View>
        ))}
      </CaseList>
    </ScrollView>
  );
}

type InputProps = {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'phone-pad';
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

function Input({
  autoCapitalize,
  keyboardType,
  multiline,
  onChangeText,
  placeholder,
  value,
}: InputProps) {
  return (
    <TextInput
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      multiline={multiline}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      style={[screenStyles.input, multiline ? screenStyles.textArea : null]}
      textAlignVertical={multiline ? 'top' : undefined}
      value={value}
    />
  );
}

function CaseList({
  children,
  emptyText,
  title,
}: {
  children: React.ReactNode;
  emptyText: string;
  title: string;
}) {
  const isEmpty = Array.isArray(children) && children.length === 0;

  return (
    <View style={screenStyles.listBlock}>
      <Text style={screenStyles.sectionTitle}>{title}</Text>
      {isEmpty ? <Text style={screenStyles.mutedText}>{emptyText}</Text> : children}
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
    backgroundColor: '#E8F1FF',
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
  segmentRow: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(17, 24, 39, 0.07)',
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
    ...shadows.md,
  },
  segment: {
    alignItems: 'center',
    borderRadius: radii.lg,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.xs,
  },
  segmentActive: {
    backgroundColor: colors.primaryLight,
  },
  segmentText: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: colors.primary,
  },
  formCard: {
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
    fontSize: fontSizes.md,
    fontWeight: '900',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: fontSizes.base,
    minHeight: 54,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  textArea: {
    minHeight: 110,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    justifyContent: 'center',
    minHeight: 54,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: fontSizes.base,
    fontWeight: '900',
  },
  listBlock: {
    gap: spacing.md,
  },
  caseCard: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(17, 24, 39, 0.07)',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.base,
    ...shadows.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.base,
    fontWeight: '900',
  },
  cardMeta: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    marginTop: 3,
    textTransform: 'capitalize',
  },
  mutedText: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
  },
});
