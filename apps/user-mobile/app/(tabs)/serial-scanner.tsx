import { colors, fontSizes, radii, shadows, spacing } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BARCODE_TYPES = [
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
  'code93',
  'itf14',
  'codabar',
  'pdf417',
  'qr',
] as const;

export default function SerialScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanned, setIsScanned] = useState(false);

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (isScanned || !result.data) {
      return;
    }

    setIsScanned(true);
    router.replace({
      pathname: '/(tabs)/stolen',
      params: { scannedSerial: result.data },
    });
  };

  const hasPermission = permission?.granted === true;

  return (
    <View style={styles.screen}>
      {hasPermission ? (
        <CameraView
          barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
          facing="back"
          onBarcodeScanned={isScanned ? undefined : handleBarcodeScanned}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={styles.permissionBody}>
          <View style={styles.permissionIcon}>
            <Ionicons color={colors.primary} name="scan-outline" size={36} />
          </View>
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionText}>
            Allow camera access to scan product barcodes, IMEI stickers, labels, or serial number QR codes.
          </Text>
          <Pressable onPress={() => void requestPermission()} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Allow Camera</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons color={colors.textInverse} name="close" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Scan serial</Text>
        <View style={styles.closeButtonPlaceholder} />
      </View>

      {hasPermission ? (
        <View pointerEvents="none" style={styles.scanOverlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
            <View style={styles.scanLine} />
          </View>
          <View style={styles.helperCard}>
            <Ionicons color={colors.primary} name="barcode-outline" size={20} />
            <Text style={styles.helperText}>Place the product barcode, IMEI label, or QR code inside the frame.</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.textPrimary,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.base,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.62)',
    borderRadius: radii.full,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  closeButtonPlaceholder: {
    height: 42,
    width: 42,
  },
  headerTitle: {
    color: colors.textInverse,
    fontSize: fontSizes.lg,
    fontWeight: '900',
  },
  scanOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  scanFrame: {
    borderColor: 'rgba(255,255,255,0.42)',
    borderRadius: radii.xl,
    borderWidth: 1,
    height: 236,
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  corner: {
    borderColor: colors.textInverse,
    height: 42,
    position: 'absolute',
    width: 42,
  },
  cornerTopLeft: {
    borderLeftWidth: 4,
    borderTopWidth: 4,
    left: -1,
    top: -1,
  },
  cornerTopRight: {
    borderRightWidth: 4,
    borderTopWidth: 4,
    right: -1,
    top: -1,
  },
  cornerBottomLeft: {
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    bottom: -1,
    left: -1,
  },
  cornerBottomRight: {
    borderBottomWidth: 4,
    borderRightWidth: 4,
    bottom: -1,
    right: -1,
  },
  scanLine: {
    alignSelf: 'center',
    backgroundColor: colors.danger,
    borderRadius: radii.full,
    height: 3,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    width: '84%',
  },
  helperCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.base,
    ...shadows.md,
  },
  helperText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    lineHeight: 19,
  },
  permissionBody: {
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permissionIcon: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.full,
    height: 82,
    justifyContent: 'center',
    width: 82,
  },
  permissionTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.xl,
    fontWeight: '900',
  },
  permissionText: {
    color: colors.textSecondary,
    fontSize: fontSizes.base,
    lineHeight: 22,
    textAlign: 'center',
  },
  permissionButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.xl,
  },
  permissionButtonText: {
    color: colors.textInverse,
    fontSize: fontSizes.base,
    fontWeight: '900',
  },
});
