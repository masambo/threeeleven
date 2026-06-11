import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { api } from '@311-security/backend/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LIST_ARGS = {
  paginationOpts: { cursor: null, numItems: 10 },
} as const;

const serialCheckIcon = require('../../assets/final_serial_check-removebg-preview.webp');

function normalizeSerial(value: string) {
  return value.trim().replace(/[\s-]/g, '').toUpperCase();
}

export default function StolenScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ scannedSerial?: string }>();
  const reportItem = useMutation(api.stolenItems.report);
  const myItems = useQuery(api.stolenItems.mine, LIST_ARGS);
  const insets = useSafeAreaInsets();
  const [searchSerial, setSearchSerial] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Phone');
  const [serialNumber, setSerialNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [lastSeenLocation, setLastSeenLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof params.scannedSerial === 'string' && params.scannedSerial.trim().length > 0) {
      setSearchSerial(params.scannedSerial.trim());
    }
  }, [params.scannedSerial]);

  const normalizedSearch = normalizeSerial(searchSerial);
  const searchResults = useQuery(
    api.stolenItems.searchBySerial,
    normalizedSearch.length >= 4 ? { serialNumber: searchSerial } : 'skip',
  );

  const handleSubmit = async () => {
    if (!itemName.trim() || !serialNumber.trim() || !description.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await reportItem({
        itemName: itemName.trim(),
        itemCategory: itemCategory.trim() || 'Item',
        serialNumber: serialNumber.trim(),
        brand: brand.trim() || undefined,
        description: description.trim(),
        lastSeenLocation: lastSeenLocation.trim() || undefined,
      });
      setItemName('');
      setItemCategory('Phone');
      setSerialNumber('');
      setBrand('');
      setDescription('');
      setLastSeenLocation('');
      Alert.alert('Item posted', 'The stolen item has been added for police/admin review.');
    } catch (error) {
      Alert.alert('Could not post item', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSearch = normalizedSearch.length >= 4;
  const matches = searchResults ?? [];

  return (
    <ScrollView
      contentContainerStyle={[screenStyles.container, { paddingTop: insets.top + spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={screenStyles.hero}>
        <View style={screenStyles.heroIcon}>
          <Image resizeMode="contain" source={serialCheckIcon} style={screenStyles.heroImage} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={screenStyles.eyebrow}>Stolen registry</Text>
          <Text style={screenStyles.title}>Serial check</Text>
          <Text style={screenStyles.body}>Search phones, devices, vehicles, and other property.</Text>
        </View>
      </View>

      <View style={screenStyles.searchCard}>
        <Text style={screenStyles.sectionTitle}>Check before you buy</Text>
        <View style={screenStyles.searchInputWrap}>
          <Ionicons color={colors.textTertiary} name="barcode-outline" size={20} />
          <TextInput
            autoCapitalize="characters"
            onChangeText={setSearchSerial}
            placeholder="Serial number / IMEI / VIN"
            placeholderTextColor="#94a3b8"
            style={screenStyles.searchInput}
            value={searchSerial}
          />
        </View>
        <Pressable onPress={() => router.push('/(tabs)/serial-scanner')} style={screenStyles.scanButton}>
          <Ionicons color={colors.primary} name="scan-outline" size={20} />
          <Text style={screenStyles.scanButtonText}>Scan serial number or barcode</Text>
        </Pressable>

        <View style={[screenStyles.resultCard, matches.length > 0 ? screenStyles.resultDanger : null]}>
          <Ionicons
            color={matches.length > 0 ? colors.danger : hasSearch ? colors.success : colors.primary}
            name={matches.length > 0 ? 'warning' : hasSearch ? 'checkmark-circle' : 'search'}
            size={24}
          />
          <View style={{ flex: 1 }}>
            <Text style={screenStyles.resultTitle}>
              {!hasSearch
                ? 'Enter at least 4 characters'
                : matches.length > 0
                  ? 'Possible stolen item match'
                  : 'No match found'}
            </Text>
            <Text style={screenStyles.resultText}>
              {!hasSearch
                ? 'Use the serial number printed on the device, box, receipt, or settings screen.'
                : matches.length > 0
                  ? 'Do not buy this item until ownership is verified.'
                  : 'No record was found here. Still verify ownership before buying.'}
            </Text>
          </View>
        </View>

        {matches.map((item) => (
          <View key={item._id} style={screenStyles.matchCard}>
            <Text style={screenStyles.cardTitle}>{item.itemName}</Text>
            <Text style={screenStyles.cardMeta}>
              {item.itemCategory} | {item.serialNumber}
            </Text>
            <Text style={screenStyles.cardBody}>{item.description}</Text>
          </View>
        ))}
      </View>

      <View style={screenStyles.formCard}>
        <Text style={screenStyles.sectionTitle}>Post a stolen item</Text>
        <Input value={itemName} onChangeText={setItemName} placeholder="Item name" />
        <Input value={itemCategory} onChangeText={setItemCategory} placeholder="Category, e.g. Phone, Laptop" />
        <Input
          autoCapitalize="characters"
          value={serialNumber}
          onChangeText={setSerialNumber}
          placeholder="Serial number / IMEI / VIN"
        />
        <Input value={brand} onChangeText={setBrand} placeholder="Brand or model" />
        <Input value={lastSeenLocation} onChangeText={setLastSeenLocation} placeholder="Last seen location" />
        <Input multiline value={description} onChangeText={setDescription} placeholder="Description" />
        <Pressable
          disabled={isSubmitting}
          onPress={() => void handleSubmit()}
          style={[screenStyles.primaryButton, isSubmitting ? screenStyles.disabledButton : null]}
        >
          <Text style={screenStyles.primaryButtonText}>{isSubmitting ? 'Posting...' : 'Post stolen item'}</Text>
        </Pressable>
      </View>

      <View style={screenStyles.listBlock}>
        <Text style={screenStyles.sectionTitle}>Your posts</Text>
        {(myItems?.page ?? []).length === 0 ? (
          <Text style={screenStyles.mutedText}>No stolen items posted yet.</Text>
        ) : (
          (myItems?.page ?? []).map((item) => (
            <View key={item._id} style={screenStyles.smallCard}>
              <Text style={screenStyles.cardTitle}>{item.itemName}</Text>
              <Text style={screenStyles.cardMeta}>
                {item.serialNumber} | {item.status}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

type InputProps = {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

function Input({ autoCapitalize, multiline, onChangeText, placeholder, value }: InputProps) {
  return (
    <TextInput
      autoCapitalize={autoCapitalize}
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
  searchCard: {
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
  searchInputWrap: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: fontSizes.base,
    fontWeight: '700',
  },
  scanButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderColor: '#BFDBFE',
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  scanButtonText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: '900',
  },
  resultCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  resultDanger: {
    backgroundColor: colors.dangerBg,
  },
  resultTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.base,
    fontWeight: '900',
  },
  resultText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    lineHeight: 19,
    marginTop: 2,
  },
  matchCard: {
    backgroundColor: colors.dangerBg,
    borderColor: '#FCA5A5',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
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
  smallCard: {
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
  },
  cardBody: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  mutedText: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
  },
});
