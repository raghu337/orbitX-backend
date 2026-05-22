import * as Location from 'expo-location';

export async function getCurrentLocationSafe() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude, altitude: pos.coords.altitude || 0 };
  } catch (e) {
    return null;
  }
}

export default { getCurrentLocationSafe };
