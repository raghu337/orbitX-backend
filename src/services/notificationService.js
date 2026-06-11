import { Alert, Vibration } from 'react-native';

const vibrate = (pattern = [0, 250, 250]) => {
  Vibration.vibrate(pattern);
};

const showLocalAlert = (title, message) => {
  Alert.alert(title, message);
};

export async function initNotifications() {
  console.log('[Notifications] Expo notification support removed; local alerts remain enabled.');
  return true;
}

export async function requestNotificationPermissions() {
  return true;
}

export async function scheduleLocalNotification(title, body, seconds = 1) {
  vibrate([0, 250, 250]);
  showLocalAlert(title, body);
}

export default {
  initNotifications,
  requestNotificationPermissions,
  scheduleLocalNotification,
};
