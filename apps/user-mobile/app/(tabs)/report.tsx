import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { getCurrentLocation } from '@/lib/location';
import { api } from '@311-security/backend/convex/_generated/api';
import type { Id } from '@311-security/backend/convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

// ── Crime categories ───────────────────────────────────────────────────

interface CrimeCategory {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  description: string;
  value: string;
}

const CRIME_CATEGORIES: CrimeCategory[] = [
  {
    icon: 'person-outline',
    iconColor: '#7C3AED',
    iconBg: '#F0ECFF',
    label: 'Missing Person',
    description: 'Report a missing person to help locate them',
    value: 'missing_person',
  },
  {
    icon: 'search-outline',
    iconColor: '#0891B2',
    iconBg: '#EAF8FA',
    label: 'Lost & Found',
    description: 'Report lost items or help return found items',
    value: 'lost_and_found',
  },
  {
    icon: 'shield-outline',
    iconColor: colors.danger,
    iconBg: colors.dangerBg,
    label: 'Theft / Burglary',
    description: 'Report stolen property or break-ins',
    value: 'theft',
  },
  {
    icon: 'construct-outline',
    iconColor: '#D97706',
    iconBg: '#FFF6D8',
    label: 'Vandalism',
    description: 'Property damage or destruction',
    value: 'vandalism',
  },
  {
    icon: 'eye-outline',
    iconColor: colors.primary,
    iconBg: '#E8F1FF',
    label: 'Suspicious Activity',
    description: 'Unusual behavior or activities',
    value: 'suspicious',
  },
  {
    icon: 'medical-outline',
    iconColor: '#059669',
    iconBg: '#E7F7EF',
    label: 'Drug-related',
    description: 'Drug dealing or substance abuse',
    value: 'drug_related',
  },
  {
    icon: 'people-outline',
    iconColor: '#7C3AED',
    iconBg: '#F0ECFF',
    label: 'Gender-based Violence',
    description: 'Violence against women or children',
    value: 'gbv',
  },
  {
    icon: 'car-outline',
    iconColor: colors.primary,
    iconBg: '#E8F1FF',
    label: 'Traffic Violations',
    description: 'Dangerous driving or traffic incidents',
    value: 'traffic',
  },
  {
    icon: 'leaf-outline',
    iconColor: '#059669',
    iconBg: '#E7F7EF',
    label: 'Environmental Crimes',
    description: 'Illegal dumping or environmental damage',
    value: 'environmental',
  },
  {
    icon: 'briefcase-outline',
    iconColor: '#D97706',
    iconBg: '#FFF6D8',
    label: 'Corruption',
    description: 'Government or private sector misconduct',
    value: 'corruption',
  },
  {
    icon: 'ellipsis-horizontal-outline',
    iconColor: '#6B7280',
    iconBg: '#F3F4F6',
    label: 'Other',
    description: 'Other criminal activities',
    value: 'other',
  },
];

const SEVERITY_OPTIONS = [
  { label: 'Low', value: 'low', color: colors.success },
  { label: 'Medium', value: 'medium', color: colors.warning },
  { label: 'High', value: 'high', color: '#f97316' },
  { label: 'Critical', value: 'critical', color: colors.danger },
] as const;

type Severity = (typeof SEVERITY_OPTIONS)[number]['value'];

const STEPS = ['Type', 'Details', 'Evidence', 'Review'] as const;
const reportCrimeIcon = require('../../assets/final_report_crime-removebg-preview.webp');

// ── Main component ────────────────────────────────────────────────────

export default function ReportScreen() {
  const createReport = useMutation(api.crimeReports.create);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  // Wizard state
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<CrimeCategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('Khomas');
  const [city, setCity] = useState('Windhoek');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [evidenceImage, setEvidenceImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAdvanceStep1 = selectedCategory !== null;
  const canAdvanceStep2 = title.trim().length > 2 && description.trim().length > 5;

  const handleSubmit = async () => {
    if (!selectedCategory || !title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const currentLocation = await getCurrentLocation();
      const evidenceImageIds: Id<'_storage'>[] = [];

      if (evidenceImage !== null) {
        const uploadUrl = await generateUploadUrl({});
        const imageResponse = await fetch(evidenceImage.uri);
        const imageBlob = await imageResponse.blob();
        const uploadResponse = await fetch(uploadUrl, {
          body: imageBlob,
          headers: {
            'Content-Type': evidenceImage.mimeType ?? 'image/jpeg',
          },
          method: 'POST',
        });

        if (!uploadResponse.ok) {
          throw new Error('Evidence upload failed');
        }

        const { storageId } = (await uploadResponse.json()) as {
          storageId: Id<'_storage'>;
        };
        evidenceImageIds.push(storageId);
      }

      await createReport({
        crimeType: selectedCategory.value,
        title: title.trim(),
        description: description.trim(),
        region: region.trim(),
        city: city.trim(),
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
        locationDescription:
          currentLocation !== null ? `${city.trim()}, ${region.trim()}` : undefined,
        incidentAt: Date.now(),
        severity,
        isAnonymous,
        evidenceImageIds,
      });
      Alert.alert(
        'Report submitted',
        'Your crime report has been submitted and sent to regional admins for review.',
        [
          {
            text: 'OK',
            onPress: () => {
              setStep(0);
              setSelectedCategory(null);
              setTitle('');
              setDescription('');
              setEvidenceImage(null);
              setSeverity('medium');
              setIsAnonymous(false);
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert('Submission failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickEvidenceImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach evidence to your report.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ['images'],
      quality: 0.75,
    });

    if (!result.canceled) {
      setEvidenceImage(result.assets[0] ?? null);
    }
  };

  return (
    <SafeAreaView style={screenStyles.safe}>
      {/* ── Screen header ── */}
      <View style={screenStyles.header}>
        <View style={screenStyles.headerIconWrap}>
          <Image resizeMode="contain" source={reportCrimeIcon} style={screenStyles.headerIcon} />
        </View>
        <Text style={screenStyles.headerTitle}>Report Crime</Text>
      </View>

      {/* ── Step indicator ── */}
      <View style={screenStyles.stepRow}>
        {STEPS.map((label, i) => (
          <View key={label} style={stepStyles.stepWrap}>
            <View
              style={[
                stepStyles.stepCircle,
                i === step && stepStyles.stepActive,
                i < step && stepStyles.stepDone,
              ]}
            >
              {i < step ? (
                <Ionicons color={colors.textInverse} name="checkmark" size={14} />
              ) : (
                <Text
                  style={[stepStyles.stepNum, (i === step || i < step) && stepStyles.stepNumActive]}
                >
                  {i + 1}
                </Text>
              )}
            </View>
            <Text style={[stepStyles.stepLabel, i === step && stepStyles.stepLabelActive]}>
              {label}
            </Text>
            {i < STEPS.length - 1 && (
              <View style={[stepStyles.connector, i < step && stepStyles.connectorDone]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={screenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Step 1: Crime type ── */}
        {step === 0 && (
          <View style={screenStyles.stepContent}>
            <Text style={screenStyles.stepTitle}>What type of incident are you reporting?</Text>
            <View style={gridStyles.grid}>
              {CRIME_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.value}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    gridStyles.cell,
                    selectedCategory?.value === cat.value && gridStyles.cellSelected,
                  ]}
                >
                  <View style={[gridStyles.iconWrap, { backgroundColor: cat.iconBg }]}>
                    <Ionicons color={cat.iconColor} name={cat.icon} size={26} />
                  </View>
                  <Text style={gridStyles.cellLabel}>{cat.label}</Text>
                  <Text numberOfLines={2} style={gridStyles.cellDesc}>
                    {cat.description}
                  </Text>
                  {selectedCategory?.value === cat.value && (
                    <View style={gridStyles.checkMark}>
                      <Ionicons color={colors.textInverse} name="checkmark" size={12} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ── Step 2: Details ── */}
        {step === 1 && (
          <View style={screenStyles.stepContent}>
            <View style={formStyles.selectedCat}>
              <View style={[formStyles.catIcon, { backgroundColor: selectedCategory!.iconBg }]}>
                <Ionicons
                  color={selectedCategory!.iconColor}
                  name={selectedCategory!.icon}
                  size={20}
                />
              </View>
              <Text style={formStyles.catLabel}>{selectedCategory!.label}</Text>
            </View>

            <Text style={screenStyles.stepTitle}>Provide incident details</Text>

            <View style={formStyles.fieldGroup}>
              <Text style={formStyles.fieldLabel}>Incident title *</Text>
              <TextInput
                onChangeText={setTitle}
                placeholder="Brief title describing the incident"
                placeholderTextColor={colors.textTertiary}
                style={formStyles.input}
                value={title}
              />
            </View>

            <View style={formStyles.fieldGroup}>
              <Text style={formStyles.fieldLabel}>Description *</Text>
              <TextInput
                multiline
                numberOfLines={4}
                onChangeText={setDescription}
                placeholder="Describe what happened in detail..."
                placeholderTextColor={colors.textTertiary}
                style={[formStyles.input, formStyles.textArea]}
                textAlignVertical="top"
                value={description}
              />
            </View>

            <View style={formStyles.row}>
              <View style={[formStyles.fieldGroup, { flex: 1 }]}>
                <Text style={formStyles.fieldLabel}>Region</Text>
                <TextInput
                  onChangeText={setRegion}
                  placeholder="e.g. Khomas"
                  placeholderTextColor={colors.textTertiary}
                  style={formStyles.input}
                  value={region}
                />
              </View>
              <View style={[formStyles.fieldGroup, { flex: 1 }]}>
                <Text style={formStyles.fieldLabel}>City / Town</Text>
                <TextInput
                  onChangeText={setCity}
                  placeholder="e.g. Windhoek"
                  placeholderTextColor={colors.textTertiary}
                  style={formStyles.input}
                  value={city}
                />
              </View>
            </View>

            <View style={formStyles.fieldGroup}>
              <Text style={formStyles.fieldLabel}>Severity level</Text>
              <View style={formStyles.severityRow}>
                {SEVERITY_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setSeverity(opt.value)}
                    style={[
                      formStyles.severityBtn,
                      severity === opt.value && {
                        backgroundColor: opt.color + '1A',
                        borderColor: opt.color,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        formStyles.severityLabel,
                        severity === opt.value && { color: opt.color, fontWeight: '700' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={formStyles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={formStyles.fieldLabel}>Report anonymously</Text>
                <Text style={formStyles.helperText}>
                  Police/admins can review the incident without showing your identity in the report.
                </Text>
              </View>
              <Switch
                onValueChange={setIsAnonymous}
                thumbColor={isAnonymous ? colors.primary : colors.surface}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                value={isAnonymous}
              />
            </View>
          </View>
        )}

        {/* ── Step 3: Evidence ── */}
        {step === 2 && (
          <View style={screenStyles.stepContent}>
            <Text style={screenStyles.stepTitle}>Add evidence (optional)</Text>
            <View style={evidenceStyles.container}>
              <Pressable onPress={() => void pickEvidenceImage()} style={evidenceStyles.placeholder}>
                {evidenceImage ? (
                  <Image source={{ uri: evidenceImage.uri }} style={evidenceStyles.preview} />
                ) : (
                  <>
                    <Ionicons color={colors.textTertiary} name="camera-outline" size={48} />
                    <Text style={evidenceStyles.placeholderText}>Upload evidence photo</Text>
                    <Text style={evidenceStyles.placeholderSub}>
                      Add one photo to help admins review your report.
                    </Text>
                  </>
                )}
              </Pressable>
              {evidenceImage ? (
                <Pressable
                  onPress={() => setEvidenceImage(null)}
                  style={evidenceStyles.removeButton}
                >
                  <Ionicons color={colors.danger} name="trash-outline" size={16} />
                  <Text style={evidenceStyles.removeText}>Remove photo</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        )}

        {/* ── Step 4: Review ── */}
        {step === 3 && (
          <View style={screenStyles.stepContent}>
            <Text style={screenStyles.stepTitle}>Review your report</Text>
            <View style={reviewStyles.card}>
              <ReviewRow icon="shield-outline" label="Type" value={selectedCategory?.label ?? ''} />
              <View style={reviewStyles.divider} />
              <ReviewRow icon="text-outline" label="Title" value={title} />
              <View style={reviewStyles.divider} />
              <ReviewRow icon="document-outline" label="Description" value={description} />
              <View style={reviewStyles.divider} />
              <ReviewRow icon="location-outline" label="Location" value={`${city}, ${region}`} />
              <View style={reviewStyles.divider} />
              <ReviewRow icon="alert-outline" label="Severity" value={severity.toUpperCase()} />
              <View style={reviewStyles.divider} />
              <ReviewRow icon="eye-off-outline" label="Anonymous" value={isAnonymous ? 'Yes' : 'No'} />
              <View style={reviewStyles.divider} />
              <ReviewRow
                icon="camera-outline"
                label="Evidence"
                value={evidenceImage ? '1 photo attached' : 'No photo attached'}
              />
            </View>
            <Text style={reviewStyles.disclaimer}>
              By submitting, you confirm this report is accurate and will be reviewed by regional
              admins. False reports may affect your account standing.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Navigation buttons ── */}
      <View style={navStyles.bar}>
        {step > 0 && (
          <Pressable onPress={() => setStep((s) => s - 1)} style={navStyles.backBtn}>
            <Ionicons color={colors.textSecondary} name="chevron-back" size={18} />
            <Text style={navStyles.backText}>Back</Text>
          </Pressable>
        )}
        <View style={{ flex: 1 }} />
        {step < STEPS.length - 1 ? (
          <Pressable
            disabled={step === 0 ? !canAdvanceStep1 : step === 1 ? !canAdvanceStep2 : false}
            onPress={() => setStep((s) => s + 1)}
            style={[
              navStyles.nextBtn,
              ((step === 0 && !canAdvanceStep1) || (step === 1 && !canAdvanceStep2)) &&
                navStyles.nextBtnDisabled,
            ]}
          >
            <Text style={navStyles.nextText}>
              {step === 0 ? 'Continue' : step === 1 ? 'Add Evidence' : 'Review'}
            </Text>
            <Ionicons color={colors.textInverse} name="chevron-forward" size={18} />
          </Pressable>
        ) : (
          <Pressable
            disabled={isSubmitting}
            onPress={() => void handleSubmit()}
            style={[navStyles.nextBtn, isSubmitting && navStyles.nextBtnDisabled]}
          >
            <Text style={navStyles.nextText}>{isSubmitting ? 'Submitting...' : 'Submit Report'}</Text>
            <Ionicons color={colors.textInverse} name="send-outline" size={16} />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function ReviewRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={reviewStyles.row}>
      <Ionicons color={colors.primary} name={icon} size={18} />
      <View style={{ flex: 1 }}>
        <Text style={reviewStyles.rowLabel}>{label}</Text>
        <Text style={reviewStyles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const screenStyles = StyleSheet.create({
  safe: { backgroundColor: '#EEF4FF', flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: colors.primaryHeader,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
  },
  headerIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radii.lg,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  headerIcon: {
    height: 44,
    width: 44,
  },
  headerTitle: { color: colors.textInverse, fontSize: fontSizes.xl, fontWeight: '900' },
  stepRow: {
    alignItems: 'flex-start',
    backgroundColor: '#EEF4FF',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  scrollContent: { flexGrow: 1, paddingBottom: spacing['2xl'] },
  stepContent: { gap: spacing.base, padding: spacing.base },
  stepTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
});

const stepStyles = StyleSheet.create({
  stepWrap: { alignItems: 'center', flex: 1, position: 'relative' },
  stepCircle: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  stepActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepNum: { color: colors.textTertiary, fontSize: fontSizes.sm, fontWeight: '700' },
  stepNumActive: { color: colors.textInverse },
  stepLabel: { color: colors.textTertiary, fontSize: fontSizes.xs, fontWeight: '600', marginTop: 4 },
  stepLabelActive: { color: colors.primary },
  connector: {
    backgroundColor: colors.border,
    height: 2,
    position: 'absolute',
    right: '0%',
    top: 13,
    width: '45%',
  },
  connectorDone: { backgroundColor: colors.primary },
});

const gridStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cell: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: 'rgba(17, 24, 39, 0.07)',
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.base,
    position: 'relative',
    width: '47.5%',
    ...shadows.md,
  },
  cellSelected: { borderColor: colors.primary, borderWidth: 2 },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radii.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  cellLabel: { color: colors.textPrimary, fontSize: fontSizes.base, fontWeight: '700' },
  cellDesc: { color: colors.textSecondary, fontSize: fontSizes.xs, lineHeight: 16 },
  checkMark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    bottom: spacing.sm,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.sm,
    width: 20,
  },
});

const formStyles = StyleSheet.create({
  selectedCat: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  catIcon: { alignItems: 'center', borderRadius: radii.sm, height: 36, justifyContent: 'center', width: 36 },
  catLabel: { color: colors.primary, fontSize: fontSizes.base, fontWeight: '700' },
  fieldGroup: { gap: spacing.sm },
  fieldLabel: { color: colors.textPrimary, fontSize: fontSizes.sm, fontWeight: '600' },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: fontSizes.base,
    minHeight: 52,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  textArea: { height: 120, minHeight: 120, paddingTop: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  severityRow: { flexDirection: 'row', gap: spacing.sm },
  severityBtn: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1.5,
    flex: 1,
    paddingVertical: spacing.md,
  },
  severityLabel: { color: colors.textSecondary, fontSize: fontSizes.sm, fontWeight: '600' },
  helperText: { color: colors.textSecondary, fontSize: fontSizes.xs, lineHeight: 18 },
  toggleRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: 'rgba(17, 24, 39, 0.07)',
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
    ...shadows.sm,
  },
});

const evidenceStyles = StyleSheet.create({
  container: { paddingTop: spacing.xs },
  placeholder: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: spacing.md,
    paddingVertical: spacing['3xl'],
  },
  placeholderText: { color: colors.textSecondary, fontSize: fontSizes.md, fontWeight: '600' },
  placeholderSub: {
    color: colors.textTertiary,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    paddingHorizontal: spacing.xl,
    textAlign: 'center',
  },
  preview: {
    aspectRatio: 4 / 3,
    borderRadius: radii.md,
    width: '100%',
  },
  removeButton: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  removeText: { color: colors.danger, fontSize: fontSizes.sm, fontWeight: '700' },
});

const reviewStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.sm,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
  },
  divider: { backgroundColor: colors.border, height: 1 },
  rowLabel: { color: colors.textTertiary, fontSize: fontSizes.xs, marginBottom: 2 },
  rowValue: { color: colors.textPrimary, fontSize: fontSizes.base, fontWeight: '600' },
  disclaimer: {
    color: colors.textTertiary,
    fontSize: fontSizes.xs,
    lineHeight: 18,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

const navStyles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopColor: 'rgba(17, 24, 39, 0.07)',
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    ...shadows.md,
  },
  backBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backText: { color: colors.textSecondary, fontSize: fontSizes.base, fontWeight: '600' },
  nextBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  nextBtnDisabled: { backgroundColor: colors.textTertiary },
  nextText: { color: colors.textInverse, fontSize: fontSizes.base, fontWeight: '700' },
});
