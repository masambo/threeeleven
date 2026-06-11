import * as Location from 'expo-location';

export type CurrentLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export function formatCurrentLocation(location: CurrentLocation, fallbackLabel?: string) {
  const coordinates = `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;

  return fallbackLabel !== undefined && fallbackLabel.length > 0
    ? `${fallbackLabel} - GPS ${coordinates}`
    : `GPS ${coordinates}`;
}

export async function getLocationPermissionStatus() {
  const permission = await Location.getForegroundPermissionsAsync();
  return permission.status;
}

export async function getKnownLocation(): Promise<CurrentLocation | null> {
  const permission = await Location.getForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) {
    return null;
  }

  const position =
    (await Location.getLastKnownPositionAsync({
      maxAge: 300000,
      requiredAccuracy: 1000,
    })) ??
    (await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    }).catch(() => null));

  if (position === null) {
    return null;
  }

  return {
    accuracy: position.coords.accuracy ?? undefined,
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export async function getCurrentLocation(): Promise<CurrentLocation | null> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) {
    return null;
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  }).catch(async () => {
    return await Location.getLastKnownPositionAsync({
      maxAge: 120000,
      requiredAccuracy: 500,
    });
  });

  if (position === null) {
    return null;
  }

  return {
    accuracy: position.coords.accuracy ?? undefined,
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}
