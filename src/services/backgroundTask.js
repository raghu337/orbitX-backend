import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { sendSatellitePassNotification } from '../notifications/notificationService';
import { getCompassDirection, isValidPassForAlert } from '../utils/visibilityFilter';
import { getVisualPasses, SATELLITE_IDS } from './api/satelliteService';
import liveService from './liveSatelliteService';
import satelliteProximityService from './satelliteProximityService';

const SATELLITE_CHECK_TASK = 'SATELLITE_CHECK_TASK';
const LAST_NOTIFIED_KEY = 'LAST_NOTIFIED_PASS_ID';
const CACHED_PASSES_KEY = 'CACHED_SATELLITE_PASSES';
const PROXIMITY_ALERTS_ENABLED_KEY = 'PROXIMITY_ALERTS_ENABLED';

// Define the background task
TaskManager.defineTask(SATELLITE_CHECK_TASK, async () => {
  try {
    console.log('[Background Task] Checking for satellite passes and proximity alerts...');
    
    // 1. Get Location
    const { status } = await Location.requestForegroundPermissionsAsync();
    let lat = 13.0827, lng = 80.2707; // Fallback to Chennai
    
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      lat = location.coords.latitude;
      lng = location.coords.longitude;
    }

    // 2. Check if proximity alerts are enabled
    const proximityEnabled = await AsyncStorage.getItem(PROXIMITY_ALERTS_ENABLED_KEY);
    
    if (proximityEnabled === 'true') {
      // Check proximity for key satellites
      const proximityCheckSatellites = [
        SATELLITE_IDS.ISS,
        SATELLITE_IDS.HUBBLE,
        SATELLITE_IDS.NOAA,
      ].filter(Boolean);

      for (const satId of proximityCheckSatellites) {
        try {
          const satellite = await liveService.fetchSatellite(satId);
          if (satellite && satellite.latitude && satellite.longitude) {
            await satelliteProximityService.checkSatelliteProximity(
              satellite,
              lat,
              lng,
              `${lat.toFixed(4)}, ${lng.toFixed(4)}`
            );
          }
        } catch (error) {
          console.warn('[Background Task] Error checking proximity for satellite:', satId, error);
        }
      }
    }

    // 3. Fetch Passes (ISS as priority)
    const { passes, error } = await getVisualPasses(SATELLITE_IDS.ISS, lat, lng);
    
    if (error || !passes || passes.length === 0) {
      console.log('[Background Task] No passes found or API error');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // 4. Cache passes for UI
    await AsyncStorage.setItem(CACHED_PASSES_KEY, JSON.stringify(passes));

    // 5. Check for imminent valid pass
    const now = Math.floor(Date.now() / 1000);
    const imminentPass = passes.find(pass => {
      const timeToPass = pass.startUTC - now;
      return timeToPass > 0 && timeToPass <= 600 && isValidPassForAlert(pass); // Within 10 mins
    });

    if (imminentPass) {
      const passId = `${SATELLITE_IDS.ISS}_${imminentPass.startUTC}`;
      const lastNotified = await AsyncStorage.getItem(LAST_NOTIFIED_KEY);

      if (lastNotified !== passId) {
        const minutesAway = Math.round((imminentPass.startUTC - now) / 60);
        const direction = getCompassDirection(imminentPass.startAz);
        
        await sendSatellitePassNotification('ISS', 'your location', minutesAway, direction);
        await AsyncStorage.setItem(LAST_NOTIFIED_KEY, passId);
        
        console.log('[Background Task] Notification sent for pass:', passId);
        return BackgroundFetch.BackgroundFetchResult.NewData;
      } else {
        console.log('[Background Task] Already notified for this pass');
      }
    }

    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (err) {
    console.error('[Background Task] Error:', err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundFetch = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(SATELLITE_CHECK_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(SATELLITE_CHECK_TASK, {
        minimumInterval: 5 * 60, // 5 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('[Background Task] Registered successfully');
    }
  } catch (err) {
    console.error('[Background Task] Registration failed:', err);
  }
};

export const unregisterBackgroundFetch = async () => {
  if (await TaskManager.isTaskRegisteredAsync(SATELLITE_CHECK_TASK)) {
    await BackgroundFetch.unregisterTaskAsync(SATELLITE_CHECK_TASK);
    console.log('[Background Task] Unregistered');
  }
};
