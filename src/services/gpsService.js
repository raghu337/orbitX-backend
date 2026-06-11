import * as Location from 'expo-location';

export async function getCurrentLocationSafe() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { status, latitude: null, longitude: null, altitude: null };
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
      maximumAge: 0,
      timeout: 15000,
      enableHighAccuracy: true,
    });

    return {
      status,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      altitude: pos.coords.altitude || 0,
      timestamp: pos.timestamp,
    };
  } catch (e) {
    console.log('[GPS SERVICE] location fetch failed', e?.message || e);
    return { status: 'error', latitude: null, longitude: null, altitude: null };
  }
}

export default { getCurrentLocationSafe };
