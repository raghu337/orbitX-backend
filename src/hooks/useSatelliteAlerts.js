import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getVisualPasses, SATELLITE_IDS } from '../services/api/satelliteService';
import { registerBackgroundFetch, unregisterBackgroundFetch } from '../services/backgroundTask';
import { requestNotificationPermissions } from '../notifications/notificationService';

const CACHED_PASSES_KEY = 'CACHED_SATELLITE_PASSES';
const NOTIFICATIONS_ENABLED_KEY = 'SATELLITE_NOTIFICATIONS_ENABLED';

export const useSatelliteAlerts = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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
        const currentLoc = await Location.getCurrentPositionAsync({});
        lat = currentLoc.coords.latitude;
        lng = currentLoc.coords.longitude;
        setLocation(currentLoc.coords);
      } else {
        setError('Location permission denied. Using fallback (Chennai).');
      }

      // 2. Fetch Passes
      await fetchPasses(lat, lng);

      // 3. Check Notification Status
      const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      setNotificationsEnabled(enabled === 'true');
      
      if (enabled === 'true') {
        await registerBackgroundFetch();
      }
    } catch (err) {
      setError('Initialization failed');
      setLoading(false);
    }
  }, [fetchPasses]);

  const toggleNotifications = async () => {
    const newState = !notificationsEnabled;
    if (newState) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        alert('Notification permission is required for alerts.');
        return;
      }

      // Check if we are in Expo Go for specific UX feedback
      const { isExpoGo } = require('../notifications/notificationService');
      if (isExpoGo) {
        alert('Note: In Expo Go, only local notifications are supported. Full push notifications require a development build.');
      }

      await registerBackgroundFetch();
    } else {
      await unregisterBackgroundFetch();
    }
    
    setNotificationsEnabled(newState);
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, newState.toString());
  };


  useEffect(() => {
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
