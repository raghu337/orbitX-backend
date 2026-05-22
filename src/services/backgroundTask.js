import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getVisualPasses, SATELLITE_IDS } from './api/satelliteService';
import { isValidPassForAlert, getCompassDirection } from '../utils/visibilityFilter';
import { sendSatellitePassNotification } from '../notifications/notificationService';

const SATELLITE_CHECK_TASK = 'SATELLITE_CHECK_TASK';
const LAST_NOTIFIED_KEY = 'LAST_NOTIFIED_PASS_ID';
const CACHED_PASSES_KEY = 'CACHED_SATELLITE_PASSES';

// Define the background task
TaskManager.defineTask(SATELLITE_CHECK_TASK, async () => {
  try {
    console.log('[Background Task] Checking for satellite passes...');
    
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

    // 2. Fetch Passes (ISS as priority)
    const { passes, error } = await getVisualPasses(SATELLITE_IDS.ISS, lat, lng);
    
    if (error || !passes || passes.length === 0) {
      console.log('[Background Task] No passes found or API error');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // 3. Cache passes for UI
    await AsyncStorage.setItem(CACHED_PASSES_KEY, JSON.stringify(passes));

    // 4. Check for imminent valid pass
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
