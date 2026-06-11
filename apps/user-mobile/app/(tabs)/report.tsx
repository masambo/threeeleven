import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { getCurrentLocation } from '@/lib/location';
import { api } from '@311-security/backend/convex/_generated/api';
import type { Id } from '@311-security/backend/convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    icon: 'phone-portrait-outline',
    iconColor: colors.danger,
    iconBg: colors.dangerBg,
    label: 'Theft / Stolen Item',
    description: 'Phones, vehicles, documents, or serial-number items',
    value: 'theft',
  },
  {
    icon: 'home-outline',
    iconColor: '#D97706',
    iconBg: '#FFF6D8',
    label: 'Break-in / Burglary',
    description: 'House, shop, car, or office break-ins',
    value: 'break_in',
  },
  {
    icon: 'hand-left-outline',
    iconColor: '#7C3AED',
    iconBg: '#F0ECFF',
    label: 'Violence / Assault',
    description: 'Fighting, threats, domestic violence, or GBV',
    value: 'violence',
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
    icon: 'person-outline',
    iconColor: '#7C3AED',
    iconBg: '#F0ECFF',
    label: 'Missing Person',
    description: 'Last seen details and photo for review',
    value: 'missing_person',
  },
  {
    icon: 'car-outline',
    iconColor: '#0891B2',
    iconBg: '#EAF8FA',
    label: 'Traffic / Road Incident',
    description: 'Crashes, dangerous driving, or blocked roads',
    value: 'traffic',
  },
  {
    icon: 'card-outline',
    iconColor: colors.primary,
    iconBg: '#E8F1FF',
    label: 'Fraud / Scam',
    description: 'Online scams, fake sellers, or identity fraud',
    value: 'fraud',
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
  const router = useRouter();
  const params = useLocalSearchParams<{ scannedSerial?: string }>();
  const createReport = useMutation(api.crimeReports.create);
  const reportStolenItem = useMutation(api.stolenItems.report);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const insets = useSafeAreaInsets();

  // Wizard state
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<CrimeCategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('Khomas');
  const [city, setCity] = useState('Windhoek');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Phone');
  const [serialNumber, setSerialNumber] = useState('');
  const [brandOrModel, setBrandOrModel] = useState('');
  const [evidenceImage, setEvidenceImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTheftReport = selectedCategory?.value === 'theft';
  const isMissingPersonReport = selectedCategory?.value === 'missing_person';
  const canAdvanceStep1 = selectedCategory !== null;
  const canAdvanceStep2 =
    title.trim().length > 2 &&
    description.trim().length > 5 &&
    (!isTheftReport || itemName.trim().length > 1);

  useEffect(() => {
    if (typeof params.scannedSerial === 'string' && params.scannedSerial.trim().length > 0) {
      setSerialNumber(params.scannedSerial.trim());
    }
  }, [params.scannedSerial]);

  const handleSubmit = async () => {
    if (!selectedCategory || !title.trim() || isSubmitting) return;
    if (isMissingPersonReport && evidenceImage === null) {
      Alert.alert('Photo required', 'Please add a photo before submitting a missing-person report.');
      return;
    }

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

      const detailLines = [
        description.trim(),
        isTheftReport ? `Item: ${itemName.trim()}` : '',
        isTheftReport && itemCategory.trim() ? `Category: ${itemCategory.trim()}` : '',
        isTheftReport && brandOrModel.trim() ? `Brand/model: ${brandOrModel.trim()}` : '',
        isTheftReport && serialNumber.trim() ? `Serial/IMEI/VIN: ${serialNumber.trim()}` : '',
      ].filter(Boolean);

      await createReport({
        crimeType: selectedCategory.value,
        title: title.trim(),
        description: detailLines.join('\n\n'),
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

      if (isTheftReport && serialNumber.trim().length >= 4) {
        await reportStolenItem({
          itemName: itemName.trim(),
          itemCategory: itemCategory.trim() || 'Item',
          serialNumber: serialNumber.trim(),
          brand: brandOrModel.trim() || undefined,
          description: description.trim(),
          lastSeenLocation: city.trim() || undefined,
          isPublic: true,
        });
      }

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
              setItemName('');
              setItemCategory('Phone');
              setSerialNumber('');
              setBrandOrModel('');
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
      <View style={[screenStyles.header, { paddingTop: insets.top + spacing.md }]}>
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
            <Text style={screenStyles.stepTitle}>What happened?</Text>
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
            <View style={screenStyles.noteCard}>
              <Ionicons color={colors.primary} name="information-circle-outline" size={20} />
              <Text style={screenStyles.noteText}>
                Lost & Found works better as a separate non-urgent registry. Use this flow for
                incidents that need police or admin review.
              </Text>
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

            {isTheftReport ? (
              <View style={formStyles.smartBlock}>
                <View style={formStyles.smartHeader}>
                  <Ionicons color={colors.danger} name="barcode-outline" size={20} />
                  <Text style={formStyles.smartTitle}>Stolen item details</Text>
                </View>
                <View style={formStyles.fieldGroup}>
                  <Text style={formStyles.fieldLabel}>Item name *</Text>
                  <TextInput
                    onChangeText={setItemName}
                    placeholder="e.g. Samsung phone, laptop, bicycle"
                    placeholderTextColor={colors.textTertiary}
                    style={formStyles.input}
                    value={itemName}
                  />
                </View>
                <View style={formStyles.fieldGroup}>
                  <Text style={formStyles.fieldLabel}>Item category</Text>
                  <TextInput
                    onChangeText={setItemCategory}
                    placeholder="Phone, laptop, vehicle, document"
                    placeholderTextColor={colors.textTertiary}
                    style={formStyles.input}
                    value={itemCategory}
                  />
                </View>
                <View style={formStyles.fieldGroup}>
                  <Text style={formStyles.fieldLabel}>Serial number / IMEI / VIN</Text>
                  <View style={formStyles.serialRow}>
                    <TextInput
                      autoCapitalize="characters"
                      onChangeText={setSerialNumber}
                      placeholder="Scan or enter manually"
                      placeholderTextColor={colors.textTertiary}
                      style={[formStyles.input, formStyles.serialInput]}
                      value={serialNumber}
                    />
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: '/(tabs)/serial-scanner',
                          params: { returnTo: 'report' },
                        })
                      }
                      style={formStyles.scanButton}
                    >
                      <Ionicons color={colors.primary} name="scan-outline" size={20} />
                    </Pressable>
                  </View>
                </View>
                <View style={formStyles.fieldGroup}>
                  <Text style={formStyles.fieldLabel}>Brand or model</Text>
                  <TextInput
                    onChangeText={setBrandOrModel}
                    placeholder="e.g. iPhone 13, Toyota Corolla"
                    placeholderTextColor={colors.textTertiary}
                    style={formStyles.input}
                    value={brandOrModel}
                  />
                </View>
              </View>
            ) : null}

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
            <Text style={screenStyles.stepTitle}>
              {isMissingPersonReport ? 'Add missing-person photo' : 'Add evidence (optional)'}
            </Text>
            <View style={evidenceStyles.container}>
              <Pressable onPress={() => void pickEvidenceImage()} style={evidenceStyles.placeholder}>
                {evidenceImage ? (
                  <Image source={{ uri: evidenceImage.uri }} style={evidenceStyles.preview} />
                ) : (
                  <>
                    <Ionicons color={colors.textTertiary} name="camera-outline" size={48} />
                    <Text style={evidenceStyles.placeholderText}>
                      {isMissingPersonReport ? 'Upload person photo' : 'Upload evidence photo'}
                    </Text>
                    <Text style={evidenceStyles.placeholderSub}>
                      {isMissingPersonReport
                        ? 'A clear photo helps admins and police identify the missing person.'
                        : 'Add one photo to help admins review your report.'}
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
              {isTheftReport ? (
                <>
                  <View style={reviewStyles.divider} />
                  <ReviewRow
                    icon="barcode-outline"
                    label="Stolen item"
                    value={[
                      itemName,
                      itemCategory,
                      brandOrModel,
                      serialNumber ? `Serial: ${serialNumber}` : '',
                    ]
                      .filter(Boolean)
                      .join(' | ')}
                  />
                </>
              ) : null}
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
      <View style={[navStyles.bar, { paddingBottom: insets.bottom + spacing.md }]}>
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
  noteCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderColor: '#BFDBFE',
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  noteText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    lineHeight: 19,
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
  smartBlock: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(239,68,68,0.18)',
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.base,
    ...shadows.sm,
  },
  smartHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  smartTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.base,
    fontWeight: '900',
  },
  serialRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  serialInput: {
    flex: 1,
  },
  scanButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderColor: '#BFDBFE',
    borderRadius: radii.md,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
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
