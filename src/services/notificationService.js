import * as Notifications from 'expo-notifications';

export async function registerForPushNotificationsAsync() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch (e) {
    return null;
  }
}

export function scheduleLocalNotification(title, body, seconds = 1) {
  Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { seconds, repeats: false },
  });
}

export default { registerForPushNotificationsAsync, scheduleLocalNotification };
