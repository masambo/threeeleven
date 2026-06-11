import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ONBOARDING_KEY = '311-security.onboarding-complete';

const emergencyNumbersIcon = require('../assets/final_emergency_numbers-removebg-preview.webp');
const reportCrimeIcon = require('../assets/final_report_crime-removebg-preview.webp');
const serialCheckIcon = require('../assets/final_serial_check-removebg-preview.webp');
const safetyAlertsIcon = require('../assets/safety_alerts_icon-removebg-preview.webp');

const SLIDES: Array<{
  imageSource: ImageSourcePropType;
  title: string;
  body: string;
}> = [
  {
    imageSource: emergencyNumbersIcon,
    title: 'Fast emergency access',
    body: 'Dial police, ambulance, fire, and city support numbers from one clear directory.',
  },
  {
    imageSource: reportCrimeIcon,
    title: 'Report safely',
    body: 'Send crime reports with details, evidence, and anonymous reporting when needed.',
  },
  {
    imageSource: serialCheckIcon,
    title: 'Check before you buy',
    body: 'Search stolen phones, vehicles, and items by serial number before money changes hands.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const finish = async () => {
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  };

  const next = () => {
    if (isLast) {
      void finish();
      return;
    }

    setIndex((current) => current + 1);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryHeader} />

      <View style={styles.header}>
        <Image resizeMode="contain" source={safetyAlertsIcon} style={styles.headerIcon} />
        <Pressable onPress={() => void finish()} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.orbit}>
          <View style={styles.iconCard}>
            <Image resizeMode="contain" source={slide.imageSource} style={styles.slideImage} />
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>
        </View>

        <View style={styles.dots}>
          {SLIDES.map((item, dotIndex) => (
            <View
              key={item.title}
              style={[styles.dot, dotIndex === index ? styles.dotActive : null]}
            />
          ))}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
        <Pressable onPress={next} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{isLast ? 'Enter app' : 'Continue'}</Text>
          <Ionicons color={colors.textInverse} name="arrow-forward" size={18} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#EEF4FF',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.primaryHeader,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
  },
  headerIcon: {
    height: 46,
    width: 46,
  },
  skipButton: {
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipText: {
    color: colors.textInverse,
    fontSize: fontSizes.sm,
    fontWeight: '800',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  orbit: {
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderRadius: radii.full,
    height: 230,
    justifyContent: 'center',
    width: 230,
  },
  iconCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: 'rgba(17, 24, 39, 0.07)',
    borderRadius: radii['2xl'],
    borderWidth: 1,
    height: 150,
    justifyContent: 'center',
    width: 150,
    ...shadows.lg,
  },
  slideImage: {
    height: 116,
    width: 116,
  },
  copy: {
    marginTop: spacing['2xl'],
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSizes['3xl'],
    fontWeight: '900',
    textAlign: 'center',
  },
  body: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    lineHeight: 23,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing['2xl'],
  },
  dot: {
    backgroundColor: colors.border,
    borderRadius: radii.full,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 26,
  },
  footer: {
    paddingHorizontal: spacing.base,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 58,
    ...shadows.md,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: fontSizes.base,
    fontWeight: '900',
  },
});
