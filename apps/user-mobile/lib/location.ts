import * as Location from 'expo-location';

export type CurrentLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export async function getCurrentLocation(): Promise<CurrentLocation | null> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) {
    return null;
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    accuracy: position.coords.accuracy ?? undefined,
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}
