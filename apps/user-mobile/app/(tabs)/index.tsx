import { formatCurrentLocation, getCurrentLocation } from '@/lib/location';
import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { api } from '@311-security/backend/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Alert,
  Easing,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PAGINATION = { paginationOpts: { cursor: null, numItems: 20 } } as const;

const safetyAlertsIcon = require('../../assets/safety_alerts_icon-removebg-preview.webp');
const reportCrimeIcon = require('../../assets/final_report_crime-removebg-preview.webp');
const emergencyNumbersIcon = require('../../assets/final_emergency_numbers-removebg-preview.webp');
const serialCheckIcon = require('../../assets/final_serial_check-removebg-preview.webp');
const wantedPersonsIcon = require('../../assets/final_wanted_persons-removebg-preview.webp');
const missingPersonIcon = require('../../assets/missing person.png');
const alarmSound = require('../../assets/alarmsound.m4a');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const triggerAlert = useMutation(api.emergencyAlerts.trigger);
  const alarmPlayer = useAudioPlayer(alarmSound);

  const profile = useQuery(api.users.current);
  const alerts = useQuery(api.safetyAlerts.active, PAGINATION);
  const [isPanicSending, setIsPanicSending] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const alarmFlash = useRef(new Animated.Value(0)).current;
  const alarmPulse = useRef(new Animated.Value(0)).current;

  const locationDisplay = profile?.region ?? 'Namibia';
  const alertCount = alerts?.page.length ?? 0;

  useEffect(() => {
    if (!alarmActive) {
      alarmFlash.stopAnimation();
      alarmPulse.stopAnimation();
      alarmFlash.setValue(0);
      alarmPulse.setValue(0);
      return;
    }

    alarmPlayer.loop = true;
    alarmPlayer.volume = 1;
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
    void alarmPlayer.seekTo(0).then(() => {
      alarmPlayer.play();
    });

    const flashLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(alarmFlash, {
          duration: 210,
          easing: Easing.linear,
          toValue: 1,
          useNativeDriver: false,
        }),
        Animated.timing(alarmFlash, {
          duration: 210,
          easing: Easing.linear,
          toValue: 0,
          useNativeDriver: false,
        }),
      ]),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(alarmPulse, {
          duration: 520,
          easing: Easing.out(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(alarmPulse, {
          duration: 520,
          easing: Easing.in(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    flashLoop.start();
    pulseLoop.start();
    Vibration.vibrate([0, 260, 120, 260, 120, 420], false);

    return () => {
      flashLoop.stop();
      pulseLoop.stop();
      alarmPlayer.pause();
      void alarmPlayer.seekTo(0);
      Vibration.cancel();
    };
  }, [alarmActive, alarmFlash, alarmPlayer, alarmPulse]);

  const quickActions = [
    {
      backgroundColor: '#FFF6D8',
      imageSource: safetyAlertsIcon,
      label: 'Police Notices',
      onPress: () => router.push('/(tabs)/alerts'),
    },
    {
      backgroundColor: '#FFE9EC',
      imageSource: reportCrimeIcon,
      label: 'Report Crime',
      onPress: () => router.push('/(tabs)/report'),
    },
    {
      backgroundColor: '#E7F7EF',
      imageSource: emergencyNumbersIcon,
      label: 'Emergency Numbers',
      onPress: () => router.push('/(tabs)/emergency'),
    },
    {
      backgroundColor: '#E8F1FF',
      imageSource: serialCheckIcon,
      label: 'Serial Check',
      onPress: () => router.push('/(tabs)/stolen'),
    },
    {
      backgroundColor: '#F0ECFF',
      imageSource: wantedPersonsIcon,
      label: 'Wanted Persons',
      onPress: () => router.push('/(tabs)/wanted'),
    },
    {
      backgroundColor: '#EAF8FA',
      imageSource: missingPersonIcon,
      label: 'Missing',
      onPress: () => router.push('/(tabs)/missing'),
    },
  ];

  const sendPanicAlert = async () => {
    if (isPanicSending) {
      return;
    }

    setIsPanicSending(true);
    setAlarmActive(true);
    try {
      const currentLocation = await getCurrentLocation();
      await triggerAlert({
        type: 'panic',
        description: 'Panic button triggered from the mobile home screen.',
        locationDescription: currentLocation
          ? formatCurrentLocation(currentLocation, locationDisplay)
          : 'Location permission not granted',
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
      });

      Alert.alert(
        'Panic alert sent',
        currentLocation
          ? 'Your current location was included.'
          : 'The alert was sent without GPS coordinates.',
      );
    } catch (error) {
      Alert.alert('Panic alert failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsPanicSending(false);
      setAlarmActive(false);
    }
  };

  const confirmPanicAlert = () => {
    Alert.alert('Send panic alert?', 'This will notify regional responders immediately.', [
      { style: 'cancel', text: 'Cancel' },
      { onPress: () => void sendPanicAlert(), style: 'destructive', text: 'Send alert' },
    ]);
  };

  return (
      <View style={[styles.screen, { paddingTop: Math.max(insets.top, spacing.md) }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryHeader} />
      <View pointerEvents="none" style={styles.topBackdrop} />

      <View style={styles.header}>
        <View style={styles.headerMain}>
          <View style={styles.locationIcon}>
            <Ionicons color={colors.textInverse} name="location" size={18} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.locationLabel}>Current area</Text>
            <Text numberOfLines={1} style={styles.locationValue}>
              {locationDisplay}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Notifications"
            onPress={() => router.push('/(tabs)/notifications')}
            style={styles.headerIconButton}
          >
            <Ionicons color={colors.textInverse} name="notifications-outline" size={22} />
            {alertCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{alertCount > 9 ? '9+' : alertCount}</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            accessibilityLabel="Profile"
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.avatarButton}
          >
            <Ionicons color={colors.primaryHeader} name="person" size={20} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.panicPanel}>
          {alarmActive ? (
            <>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.alarmGlow,
                  styles.alarmGlowLeft,
                  {
                    backgroundColor: alarmFlash.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['rgba(37,99,235,0.25)', 'rgba(239,68,68,0.55)'],
                    }),
                    opacity: alarmFlash.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.45, 0.95],
                    }),
                    transform: [
                      {
                        scale: alarmPulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.16],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.alarmGlow,
                  styles.alarmGlowRight,
                  {
                    backgroundColor: alarmFlash.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['rgba(239,68,68,0.5)', 'rgba(37,99,235,0.55)'],
                    }),
                    opacity: alarmFlash.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 0.5],
                    }),
                    transform: [
                      {
                        scale: alarmPulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1.14, 1],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </>
          ) : null}
          <Pressable
            accessibilityLabel="Send panic alert"
            disabled={isPanicSending}
            onPress={confirmPanicAlert}
            style={({ pressed }) => [
              styles.panicOuter,
              pressed && !isPanicSending ? styles.panicOuterPressed : null,
            ]}
          >
            <View style={styles.panicHighlight} />
            <View style={styles.panicFace}>
              {isPanicSending ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.panicButtonText}>PANIC</Text>
              )}
            </View>
            <View style={styles.panicBottomShade} />
          </Pressable>
        </View>

        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <ActionCard
              backgroundColor={action.backgroundColor}
              imageSource={action.imageSource}
              key={action.label}
              label={action.label}
              onPress={action.onPress}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ActionCard({
  backgroundColor,
  imageSource,
  label,
  onPress,
}: {
  backgroundColor: string;
  imageSource: ImageSourcePropType;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[actionStyles.card, { backgroundColor }]}>
      <View style={actionStyles.iconWrap}>
        <Image resizeMode="contain" source={imageSource} style={actionStyles.iconImage} />
      </View>
      <Text style={actionStyles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#EEF4FF',
    flex: 1,
  },
  topBackdrop: {
    backgroundColor: colors.primaryHeader,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    height: 188,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
  },
  headerMain: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  locationIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.full,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerText: { flex: 1 },
  locationLabel: {
    color: colors.blue200,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  locationValue: {
    color: colors.textInverse,
    fontSize: fontSizes['2xl'],
    fontWeight: '900',
    maxWidth: 230,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerIconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.full,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    position: 'relative',
    width: 42,
  },
  notificationBadge: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderColor: colors.primaryHeader,
    borderRadius: radii.full,
    borderWidth: 1.5,
    height: 16,
    justifyContent: 'center',
    minWidth: 16,
    paddingHorizontal: 2,
    position: 'absolute',
    right: -2,
    top: -2,
  },
  notificationBadgeText: {
    color: colors.textInverse,
    fontSize: 9,
    fontWeight: '800',
  },
  avatarButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    height: 42,
    justifyContent: 'center',
    width: 42,
    ...shadows.sm,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.base,
    paddingHorizontal: spacing.base,
    paddingTop: 2,
  },
  panicPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.sm,
    paddingTop: 0,
    position: 'relative',
  },
  alarmGlow: {
    borderRadius: radii.full,
    height: 236,
    position: 'absolute',
    top: -17,
    width: 154,
  },
  alarmGlowLeft: {
    left: 26,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
  },
  alarmGlowRight: {
    right: 26,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.58,
    shadowRadius: 28,
  },
  panicOuter: {
    alignItems: 'center',
    backgroundColor: '#B91C1C',
    borderColor: '#FECACA',
    borderWidth: 7,
    borderRadius: radii.full,
    height: 202,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#7F1D1D',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.42,
    shadowRadius: 26,
    width: 202,
    elevation: 14,
  },
  panicOuterPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  panicButtonText: {
    color: colors.textInverse,
    fontSize: fontSizes['2xl'],
    fontWeight: '900',
    letterSpacing: 1,
  },
  panicHighlight: {
    backgroundColor: 'rgba(255,255,255,0.32)',
    borderRadius: radii.full,
    height: 48,
    left: 44,
    position: 'absolute',
    top: 24,
    width: 92,
    zIndex: 2,
  },
  panicFace: {
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderColor: '#F87171',
    borderRadius: radii.full,
    borderWidth: 2,
    height: 166,
    justifyContent: 'center',
    width: 166,
    zIndex: 3,
  },
  panicBottomShade: {
    backgroundColor: 'rgba(127,29,29,0.34)',
    bottom: 0,
    height: 86,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});

const actionStyles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderColor: 'rgba(17, 24, 39, 0.07)',
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 106,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    width: '48.7%',
    ...shadows.md,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  iconWrap: {
    alignItems: 'center',
    height: 64,
    justifyContent: 'center',
    width: 76,
  },
  iconImage: {
    height: 62,
    width: 70,
  },
  label: {
    color: colors.textPrimary,
    fontSize: fontSizes.sm,
    fontWeight: '900',
    lineHeight: 17,
    minHeight: 34,
    textAlign: 'center',
  },
});
