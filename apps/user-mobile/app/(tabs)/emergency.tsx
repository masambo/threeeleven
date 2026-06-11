import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { api } from '@311-security/backend/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import {
  Image,
  ImageSourcePropType,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ServiceType = 'police' | 'ambulance' | 'fire' | 'gbv' | 'child_protection' | 'other';
type EmergencyService = {
  _id: string;
  name: string;
  type: ServiceType;
  phoneNumber: string;
  notes?: string;
};

const DEFAULT_SERVICES: EmergencyService[] = [
  {
    _id: 'police-emergency',
    name: 'Police Emergency',
    notes: 'National police emergency line',
    phoneNumber: '10111',
    type: 'police',
  },
  {
    _id: 'ambulance-emergency',
    name: 'Ambulance',
    notes: 'Medical emergency response',
    phoneNumber: '211111',
    type: 'ambulance',
  },
  {
    _id: 'fire-emergency',
    name: 'Fire Brigade',
    notes: 'Fire and rescue services',
    phoneNumber: '211111',
    type: 'fire',
  },
  {
    _id: 'city-of-windhoek',
    name: 'City Police / Windhoek',
    notes: 'Municipal emergency support',
    phoneNumber: '061211111',
    type: 'other',
  },
];

const ambulanceIcon = require('../../assets/emergency_ambulance-removebg-preview.webp');
const fireTruckIcon = require('../../assets/emergency_fire_truck-removebg-preview.webp');
const policeIcon = require('../../assets/namibianpolice.webp');
const cityIcon = require('../../assets/final_emergency_numbers-removebg-preview.webp');

const SERVICE_COLORS: Record<ServiceType, { background: string; accent: string }> = {
  ambulance: { background: '#E7F7EF', accent: '#059669' },
  child_protection: { background: '#F0ECFF', accent: '#7C3AED' },
  fire: { background: '#FFE9EC', accent: '#DC2626' },
  gbv: { background: '#FFF6D8', accent: '#D97706' },
  other: { background: '#E8F1FF', accent: '#2563EB' },
  police: { background: '#E8F1FF', accent: '#1D4ED8' },
};

export default function EmergencyScreen() {
  const services = useQuery(api.emergencyServices.active, {});
  const insets = useSafeAreaInsets();
  const serviceList = (services ?? DEFAULT_SERVICES) as EmergencyService[];

  const callNumber = (phoneNumber: string) => {
    void Linking.openURL(`tel:${phoneNumber.replace(/\s/g, '')}`);
  };

  return (
    <ScrollView
      contentContainerStyle={[screenStyles.container, { paddingTop: insets.top + spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={screenStyles.hero}>
        <View style={screenStyles.heroIcon}>
          <Image resizeMode="contain" source={cityIcon} style={screenStyles.heroImage} />
        </View>
        <View style={screenStyles.heroText}>
          <Text style={screenStyles.eyebrow}>Emergency numbers</Text>
          <Text style={screenStyles.title}>Tap to dial</Text>
          <Text style={screenStyles.body}>Police, ambulance, fire, and city services.</Text>
        </View>
      </View>

      <View style={screenStyles.serviceList}>
        {serviceList.map((service) => {
          const colorsForService = getServiceColors(service);

          return (
            <Pressable
              key={service._id}
              onPress={() => callNumber(service.phoneNumber)}
              style={screenStyles.serviceCard}
            >
              <View
                style={[
                  screenStyles.serviceIconWrap,
                  { backgroundColor: colorsForService.background },
                ]}
              >
                <Image resizeMode="contain" source={getServiceIcon(service)} style={screenStyles.serviceIcon} />
              </View>

              <View style={screenStyles.serviceText}>
                <Text style={screenStyles.serviceTitle}>{service.name}</Text>
                <Text style={[screenStyles.serviceNumber, { color: colorsForService.accent }]}>
                  {formatPhoneNumber(service.phoneNumber)}
                </Text>
                {service.notes ? <Text style={screenStyles.serviceNotes}>{service.notes}</Text> : null}
              </View>

              <View style={[screenStyles.callButton, { backgroundColor: colorsForService.background }]}>
                <Ionicons color={colorsForService.accent} name="call" size={20} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function getServiceIcon(service: EmergencyService): ImageSourcePropType {
  const serviceName = service.name.toLowerCase();

  if (serviceName.includes('windhoek') || serviceName.includes('city')) {
    return cityIcon;
  }

  if (service.type === 'ambulance') {
    return ambulanceIcon;
  }

  if (service.type === 'fire') {
    return fireTruckIcon;
  }

  if (service.type === 'police') {
    return policeIcon;
  }

  return cityIcon;
}

function getServiceColors(service: EmergencyService) {
  const serviceName = service.name.toLowerCase();

  if (serviceName.includes('windhoek') || serviceName.includes('city')) {
    return SERVICE_COLORS.other;
  }

  return SERVICE_COLORS[service.type] ?? SERVICE_COLORS.other;
}

function formatPhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
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
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: radii.lg,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  heroImage: {
    height: 58,
    width: 58,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
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
    marginTop: spacing.xs,
  },
  serviceList: {
    gap: spacing.md,
  },
  serviceCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: 'rgba(17, 24, 39, 0.07)',
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 108,
    padding: spacing.md,
    ...shadows.md,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  serviceIconWrap: {
    alignItems: 'center',
    borderRadius: radii.lg,
    height: 72,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 72,
  },
  serviceIcon: {
    height: 62,
    width: 62,
  },
  serviceText: {
    flex: 1,
  },
  serviceTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '900',
  },
  serviceNumber: {
    fontSize: fontSizes['2xl'],
    fontWeight: '900',
    marginTop: 2,
  },
  serviceNotes: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    lineHeight: 18,
    marginTop: 3,
  },
  callButton: {
    alignItems: 'center',
    borderRadius: radii.full,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
