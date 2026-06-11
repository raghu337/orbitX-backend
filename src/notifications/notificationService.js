import { Alert, Vibration } from 'react-native';

const vibrate = (pattern = [0, 250, 250]) => {
    Vibration.vibrate(pattern);
};

const showLocalAlert = (title, message) => {
    Alert.alert(title, message);
};

export const initNotifications = async () => {
    console.log('[Notifications] Expo notifications removed; local alerts remain available.');
    return true;
};

export const registerForPushNotificationsAsync = async () => {
    console.log('[Notifications] Push notification registration removed.');
    return null;
};

export const sendSatellitePassNotification = async (
    satelliteName,
    city,
    minutesAway,
    direction
) => {
    vibrate([0, 250, 250]);
    showLocalAlert(
        `${satelliteName} Approaching!`,
        `${satelliteName} will pass over ${city} in ${minutesAway} minutes. Look towards the ${direction} sky!`
    );
    return true;
};

export const requestNotificationPermissions = async () => true;

export const sendETANotification = async (
    satelliteName,
    etaSeconds,
    distance,
    bearing,
    direction
) => {
    const minutes = Math.floor(etaSeconds / 60);
    const seconds = Math.floor(etaSeconds % 60);
    let title = `${satelliteName} update`;
    let body = `${satelliteName} update is available.`;

    if (etaSeconds < 0) {
        title = 'Satellite exiting';
        body = `${satelliteName} is moving away from your location.`;
    } else if (etaSeconds < 30) {
        title = 'DIRECTLY OVERHEAD!';
        body = `${satelliteName} is now passing directly above you! Look up!`;
    } else if (etaSeconds < 120) {
        title = `${satelliteName} overhead in 1-2 min`;
        body = `${satelliteName} will pass above you in ${minutes}:${String(seconds).padStart(2, '0')}. Look ${direction}!`;
    } else if (etaSeconds < 300) {
        title = `${satelliteName} in ${minutes} minutes`;
        body = `${satelliteName} is approaching from ${direction} (${distance}km). ETA: ${minutes}:${String(seconds).padStart(2, '0')}`;
    } else if (etaSeconds < 600) {
        title = `${satelliteName} approaching`;
        body = `${satelliteName} will pass nearby in ~${minutes} minutes. ${distance}km away, moving ${direction}.`;
    } else {
        return false;
    }

    vibrate([0, 250, 250]);
    showLocalAlert(title, body);
    return true;
};

export const send5MinutesBeforeNotification = async (satelliteName, direction) => {
    vibrate([0, 200, 100, 200]);
    showLocalAlert(
        `${satelliteName} in 5 minutes`,
        `${satelliteName} will pass above your location from the ${direction}. Get ready!`
    );
    return true;
};

export const send2MinutesBeforeNotification = async (
    satelliteName,
    direction,
    distance
) => {
    vibrate([0, 300, 200, 300, 200, 300]);
    showLocalAlert(
        `${satelliteName} in 2 minutes!`,
        `${satelliteName} will pass above you in 2 minutes from the ${direction} (${distance}km)!`
    );
    return true;
};

export const sendOverheadNotification = async (satelliteName) => {
    vibrate([0, 100, 50, 100, 50, 100, 50, 100]);
    showLocalAlert(
        `${satelliteName} OVERHEAD!`,
        `${satelliteName} is now directly above you! Look up immediately!`
    );
    return true;
};

export const sendExitingNotification = async (satelliteName) => {
    vibrate([0, 200]);
    showLocalAlert(
        `${satelliteName} Exiting`,
        `${satelliteName} has passed and is moving away from your location.`
    );
    return true;
};
