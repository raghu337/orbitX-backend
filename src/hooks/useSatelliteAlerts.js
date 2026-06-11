import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { requestNotificationPermissions } from '../notifications/notificationService';
import { getVisualPasses, SATELLITE_IDS } from '../services/api/satelliteService';
import { registerBackgroundFetch, unregisterBackgroundFetch } from '../services/backgroundTask';
import satelliteProximityService from '../services/satelliteProximityService';

const CACHED_PASSES_KEY = 'CACHED_SATELLITE_PASSES';
const NOTIFICATIONS_ENABLED_KEY = 'SATELLITE_NOTIFICATIONS_ENABLED';
const PROXIMITY_ALERTS_ENABLED_KEY = 'PROXIMITY_ALERTS_ENABLED';

export const useSatelliteAlerts = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [proximityAlertsEnabled, setProximityAlertsEnabled] = useState(false);
  const [proximityTracking, setProximityTracking] = useState(null);

  const fetchPasses = useCallback(async (currentLat, currentLng) => {
    setLoading(true);
    const { passes: fetchedPasses, error: fetchError } = await getVisualPasses(
      SATELLITE_IDS.ISS,
      currentLat,
      currentLng
    );

    if (fetchError) {
      setError(fetchError);
      // Try to load from cache if offline
      const cached = await AsyncStorage.getItem(CACHED_PASSES_KEY);
      if (cached) setPasses(JSON.parse(cached));
    } else {
      setPasses(fetchedPasses);
      await AsyncStorage.setItem(CACHED_PASSES_KEY, JSON.stringify(fetchedPasses));
      setError(null);
    }
    setLoading(false);
  }, []);

  const initialize = useCallback(async () => {
    try {
      // 1. Get Location
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = 13.0827, lng = 80.2707; // Chennai fallback
      
      if (status === 'granted') {
        const currentLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
          maximumAge: 0,
          timeout: 15000,
          enableHighAccuracy: true,
        });
        lat = currentLoc.coords.latitude;
        lng = currentLoc.coords.longitude;
        setLocation(currentLoc.coords);
      } else {
        setError('Location permission denied. Satellite alerts cannot refresh without GPS access.');
      }

      // 3. Fetch Passes
      await fetchPasses(lat, lng);

      // 4. Check Notification Status
      const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      setNotificationsEnabled(enabled === 'true');
      
      if (enabled === 'true') {
        await registerBackgroundFetch();
      }

      // 5. Check Proximity Alerts Status
      const proximityEnabled = await AsyncStorage.getItem(PROXIMITY_ALERTS_ENABLED_KEY);
      setProximityAlertsEnabled(proximityEnabled === 'true');

      // 6. Start proximity monitoring if enabled
      if (proximityEnabled === 'true' && location) {
        startProximityMonitoring(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (err) {
      console.error('[Alerts Hook] Initialization error:', err);
      setError('Initialization failed');
      setLoading(false);
    }
  }, [fetchPasses, location]);

  const startProximityMonitoring = useCallback((lat, lng, locationName) => {
    try {
      // Clean up any existing monitoring
      if (proximityTracking) {
        proximityTracking();
      }

      // Start new monitoring
      const stopMonitoring = satelliteProximityService.startMonitoring(
        [SATELLITE_IDS.ISS, SATELLITE_IDS.HUBBLE, SATELLITE_IDS.NOAA].filter(Boolean),
        lat,
        lng,
        locationName,
        30000 // Check every 30 seconds
      );

      setProximityTracking(() => stopMonitoring);
      console.log('[Alerts Hook] Proximity monitoring started');
    } catch (error) {
      console.error('[Alerts Hook] Error starting proximity monitoring:', error);
    }
  }, [proximityTracking]);

  const toggleNotifications = async () => {
    const newState = !notificationsEnabled;
    if (newState) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        alert('Notification permission is required for alerts.');
        return;
      }

      alert('Notifications are enabled as local alerts only. Push notification registration has been disabled for Expo Go compatibility.');
      await registerBackgroundFetch();
    } else {
      await unregisterBackgroundFetch();
    }
    
    setNotificationsEnabled(newState);
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, newState.toString());
  };

  const toggleProximityAlerts = async () => {
    const newState = !proximityAlertsEnabled;
    
    if (newState) {
      // Verify notifications are enabled
      if (!notificationsEnabled) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          alert('Notification permission is required for proximity alerts.');
          return;
        }
        setNotificationsEnabled(true);
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
      }

      // Start monitoring if location available
      if (location) {
        startProximityMonitoring(
          location.latitude,
          location.longitude,
          `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
        );
      }

      // Enable in background task
      await AsyncStorage.setItem(PROXIMITY_ALERTS_ENABLED_KEY, 'true');
      alert('Real-time proximity alerts enabled! You\'ll get notifications when satellites are nearby.');
    } else {
      // Stop monitoring
      if (proximityTracking) {
        proximityTracking();
        setProximityTracking(null);
      }
      
      await AsyncStorage.setItem(PROXIMITY_ALERTS_ENABLED_KEY, 'false');
      alert('Proximity alerts disabled.');
    }
    
    setProximityAlertsEnabled(newState);
  };

  // Initialize on mount
  useEffect(() => {
    initialize();
    
    return () => {
      // Cleanup proximity monitoring on unmount
      if (proximityTracking) {
        proximityTracking();
      }
    };
  }, [initialize]);

  return {
    passes,
    loading,
    error,
    location,
    notificationsEnabled,
    proximityAlertsEnabled,
    trackedAlerts: satelliteProximityService.getTrackedAlerts(),
    toggleNotifications,
    toggleProximityAlerts,
    fetchPasses,
  };
};
    initialize();
  }, [initialize]);

  return {
    passes,
    loading,
    error,
    location,
    notificationsEnabled,
    toggleNotifications,
    refresh: () => location && fetchPasses(location.latitude, location.longitude)
  };
};
