/**
 * CrimeMap — Expo Go compatible version.
 *
 * Uses a static OpenStreetMap tile image so no native WebView module is
 * required. Danger zones and safety alerts are summarised as a colour-coded
 * legend and count chips overlaid on the image.
 *
 * To switch to the interactive Leaflet WebView version (dev build only),
 * replace this file with CrimeMap.webview.tsx.
 */

import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface MapZone {
  id: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  name: string;
}

export interface MapAlert {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  severity?: string;
}

interface CrimeMapProps {
  zones?: MapZone[];
  alerts?: MapAlert[];
  /** Centre of the static map image (Windhoek by default). */
  centerLat?: number;
  centerLng?: number;
  /** Zoom level 1–19. */
  zoom?: number;
  style?: StyleProp<ViewStyle>;
}

const RISK_COLORS: Record<MapZone['riskLevel'], string> = {
  low: colors.success,
  medium: colors.warning,
  high: '#f97316',
  critical: colors.danger,
};

function buildStaticMapUrl(lat: number, lng: number, zoom: number): string {
  // Free OpenStreetMap static map — no API key required.
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=600x280&maptype=mapnik`;
}

export function CrimeMap({
  alerts = [],
  centerLat = -22.56,
  centerLng = 17.08,
  style,
  zoom = 11,
  zones = [],
}: CrimeMapProps) {
  const mapUrl = buildStaticMapUrl(centerLat, centerLng, zoom);

  // Risk level counts for the overlay chips
  const riskCounts = zones.reduce<Record<MapZone['riskLevel'], number>>(
    (acc, z) => { acc[z.riskLevel] = (acc[z.riskLevel] ?? 0) + 1; return acc; },
    { low: 0, medium: 0, high: 0, critical: 0 },
  );
  const totalZones = zones.length;
  const totalAlerts = alerts.length;

  return (
    <View style={[mapStyles.container, style]}>
      {/* Static map tile */}
      <Image
        resizeMode="cover"
        source={{ uri: mapUrl }}
        style={mapStyles.image}
      />

      {/* Semi-transparent overlay strip at the bottom */}
      <View style={mapStyles.overlay}>
        {/* Left: summary chips */}
        <View style={mapStyles.chipRow}>
          {totalZones > 0 && (
            <View style={[mapStyles.chip, { backgroundColor: colors.danger + 'CC' }]}>
              <Ionicons color="#fff" name="warning-outline" size={12} />
              <Text style={mapStyles.chipText}>{totalZones} zone{totalZones !== 1 ? 's' : ''}</Text>
            </View>
          )}
          {totalAlerts > 0 && (
            <View style={[mapStyles.chip, { backgroundColor: colors.primary + 'CC' }]}>
              <Ionicons color="#fff" name="alert-circle-outline" size={12} />
              <Text style={mapStyles.chipText}>{totalAlerts} alert{totalAlerts !== 1 ? 's' : ''}</Text>
            </View>
          )}
          {totalZones === 0 && totalAlerts === 0 && (
            <View style={[mapStyles.chip, { backgroundColor: colors.success + 'CC' }]}>
              <Ionicons color="#fff" name="checkmark-circle-outline" size={12} />
              <Text style={mapStyles.chipText}>No active threats</Text>
            </View>
          )}
        </View>

        {/* Right: risk level dots */}
        <View style={mapStyles.dotRow}>
          {(Object.entries(riskCounts) as [MapZone['riskLevel'], number][])
            .filter(([, count]) => count > 0)
            .map(([level, count]) => (
              <View key={level} style={mapStyles.dotItem}>
                <View style={[mapStyles.dot, { backgroundColor: RISK_COLORS[level] }]} />
                <Text style={mapStyles.dotLabel}>{count}</Text>
              </View>
            ))}
        </View>
      </View>

      {/* Top-right: live indicator */}
      <View style={mapStyles.liveBadge}>
        <View style={mapStyles.liveDot} />
        <Text style={mapStyles.liveText}>Live</Text>
      </View>

      {/* Recent zone names (up to 3) */}
      {zones.slice(0, 3).map((zone, i) => (
        <View
          key={zone.id}
          style={[
            mapStyles.zoneBadge,
            { top: 10 + i * 28, backgroundColor: RISK_COLORS[zone.riskLevel] + 'DD' },
          ]}
        >
          <Text numberOfLines={1} style={mapStyles.zoneName}>{zone.name}</Text>
        </View>
      ))}
    </View>
  );
}

const mapStyles = StyleSheet.create({
  container: {
    backgroundColor: '#e8f4f8',
    borderRadius: radii.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    height: '100%',
    width: '100%',
  },

  // Bottom overlay
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'absolute',
    right: 0,
  },
  chipRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  chip: {
    alignItems: 'center',
    borderRadius: radii.full,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  chipText: { color: '#fff', fontSize: fontSizes.xs, fontWeight: '700' },

  dotRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  dotItem: { alignItems: 'center', flexDirection: 'row', gap: 3 },
  dot: { borderRadius: radii.full, height: 8, width: 8 },
  dotLabel: { color: '#fff', fontSize: fontSizes.xs, fontWeight: '700' },

  // Live badge (top right)
  liveBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radii.full,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
  },
  liveDot: {
    backgroundColor: colors.success,
    borderRadius: radii.full,
    height: 7,
    width: 7,
  },
  liveText: { color: '#fff', fontSize: fontSizes.xs, fontWeight: '700' },

  // Zone name labels (left side)
  zoneBadge: {
    borderRadius: radii.sm,
    left: spacing.sm,
    maxWidth: 160,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    position: 'absolute',
  },
  zoneName: { color: '#fff', fontSize: fontSizes.xs, fontWeight: '700' },
});
