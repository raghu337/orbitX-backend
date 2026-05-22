import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

// Detect if running in Expo Go
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications;
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
  } catch (e) {
    console.warn('[Notifications] Could not require expo-notifications');
  }
}


// Lazy initialization to prevent top-level crashes in Expo Go
export const initNotifications = () => {
  if (isExpoGo) {
    console.log('[Notifications] Skipping initialization in Expo Go (SDK 53+ restriction)');
    return;
  }

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    console.log('[Notifications] Handler configured successfully');
  } catch (error) {
    console.warn('[Notifications] Failed to set notification handler:', error);
  }
};



/**
 * Registers the device for push notifications and returns the Expo Push Token.
 * Gracefully handles Expo Go by skipping push-specific registration.
 */
export const registerForPushNotificationsAsync = async () => {
  if (isExpoGo) {
    console.log('[Notifications] Skipping push notification registration entirely in Expo Go (SDK 53+ restriction)');
    return 'expo-go-limit';
  }

  let token;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('satellite-alerts', {
        name: 'Satellite Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00FFFF',
        description: 'Alerts for upcoming satellite passes',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      const projectId = 
        Constants?.expoConfig?.extra?.eas?.projectId ?? 
        Constants?.easConfig?.projectId;
        
      if (!projectId) {
        console.warn('Project ID not found in config. Push notifications may fail.');
        return 'missing-project-id';
      }

      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Expo Push Token:', token);
    } else {
      console.log('Must use physical device for Push Notifications');
      return 'emulator';
    }
  } catch (e) {
    console.error('Error during notification registration:', e);
    return 'error';
  }

  return token;
};


/**
 * Sends a local notification immediately.
 */
export const sendSatellitePassNotification = async (satelliteName, city, minutesAway, direction) => {
  if (isExpoGo) {
    console.log('[Notifications] Skipping local notification in Expo Go');
    return;
  }
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🚀 ${satelliteName} Approaching!`,
        body: `${satelliteName} will pass over ${city} in ${minutesAway} minutes. Look towards the ${direction} sky!`,
        data: { satelliteName, type: 'pass_alert' },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

/**
 * Request basic notification permissions (useful for local alerts)
 */
export const requestNotificationPermissions = async () => {
  if (isExpoGo) {
    return false;
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};
