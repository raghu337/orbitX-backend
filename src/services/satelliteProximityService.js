import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    send2MinutesBeforeNotification,
    send5MinutesBeforeNotification,
    sendETANotification,
    sendExitingNotification,
    sendOverheadNotification
} from '../notifications/notificationService';
import audioWarningService from './audioWarningService';
import liveService from './liveSatelliteService';
import satelliteETAService from './satelliteETAService';

// Configuration
const PROXIMITY_THRESHOLDS = {
  CRITICAL: 5,    // < 5 km: Show urgent alert every 1 minute
  WARNING: 15,    // 5-15 km: Show alert every 5 minutes
  INFO: 30,       // 15-30 km: Show alert every 10 minutes
};

const ALERT_COOLDOWN = {
  CRITICAL: 60000,   // 1 minute
  WARNING: 300000,   // 5 minutes
  INFO: 600000,      // 10 minutes
};

// Smart notification trigger points
const NOTIFICATION_TRIGGERS = {
  '5_MINUTES': 300,   // 5:00
  '2_MINUTES': 120,   // 2:00
  'OVERHEAD': 60,     // 1:00
  'EXITING': -30,     // 30 seconds after
};

const LAST_ALERT_KEY = 'LAST_PROXIMITY_ALERT_';
const LAST_NOTIFICATION_KEY = 'LAST_NOTIFICATION_TRIGGER_';
const PASS_HISTORY_KEY = 'SATELLITE_PASS_HISTORY_';

class SatelliteProximityService {
  constructor() {
    this.liveService = liveService;
    this.trackedAlerts = {};
    this.monitoringActive = false;
    this.previousSatelliteStates = {}; // Track state changes
    this.notificationStates = {}; // Track which notifications have been sent
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get the alert level based on distance
   */
  getAlertLevel(distance) {
    if (distance < PROXIMITY_THRESHOLDS.CRITICAL) return 'CRITICAL';
    if (distance < PROXIMITY_THRESHOLDS.WARNING) return 'WARNING';
    if (distance < PROXIMITY_THRESHOLDS.INFO) return 'INFO';
    return null;
  }

  /**
   * Check if we should send notification at this trigger point
   */
  async shouldSendNotification(satelliteName, triggerPoint) {
    const key = LAST_NOTIFICATION_KEY + satelliteName + '_' + triggerPoint;
    const lastSent = await AsyncStorage.getItem(key);
    
    if (!lastSent) {
      return true;
    }

    const timeSinceLastSent = Date.now() - parseInt(lastSent);
    // Don't re-trigger same notification within 5 minutes
    return timeSinceLastSent > 300000;
  }

  /**
   * Record that we sent a notification
   */
  async recordNotification(satelliteName, triggerPoint) {
    const key = LAST_NOTIFICATION_KEY + satelliteName + '_' + triggerPoint;
    await AsyncStorage.setItem(key, Date.now().toString());
  }

  /**
   * Check ETA and send smart notifications
   */
  async handleSmartNotifications(satellite, eta, userLocationName) {
    if (!eta || eta.etaSeconds === null || eta.etaSeconds === undefined) {
      return;
    }

    const satName = satellite.name;
    const etaSec = eta.etaSeconds;

    try {
      // 5 minutes before
      if (etaSec <= NOTIFICATION_TRIGGERS['5_MINUTES'] && etaSec > 260) {
        if (await this.shouldSendNotification(satName, '5_MINUTES')) {
          console.log(`[Smart Notifications] 5-minute warning for ${satName}`);
          await send5MinutesBeforeNotification(satName, eta.direction);
          await this.recordNotification(satName, '5_MINUTES');
          await audioWarningService.playAlertSound(etaSec);
        }
      }

      // 2 minutes before
      if (etaSec <= NOTIFICATION_TRIGGERS['2_MINUTES'] && etaSec > 80) {
        if (await this.shouldSendNotification(satName, '2_MINUTES')) {
          console.log(`[Smart Notifications] 2-minute warning for ${satName}`);
          await send2MinutesBeforeNotification(satName, eta.direction, eta.distance);
          await this.recordNotification(satName, '2_MINUTES');
          await audioWarningService.playAlertSound(etaSec);
        }
      }

      // 1 minute (Overhead imminent)
      if (etaSec <= 60 && etaSec > 0) {
        if (await this.shouldSendNotification(satName, 'OVERHEAD')) {
          console.log(`[Smart Notifications] OVERHEAD warning for ${satName}`);
          await sendOverheadNotification(satName);
          await this.recordNotification(satName, 'OVERHEAD');
          await audioWarningService.playAlertSound(etaSec);
        }
      }

      // Exiting (30 seconds after closest approach)
      if (etaSec < NOTIFICATION_TRIGGERS['EXITING'] && etaSec > -60) {
        if (await this.shouldSendNotification(satName, 'EXITING')) {
          console.log(`[Smart Notifications] Exiting warning for ${satName}`);
          await sendExitingNotification(satName);
          await this.recordNotification(satName, 'EXITING');
          
          // Record pass history
          await this.recordPass(satellite, eta);
        }
      }

      // General ETA notification
      await sendETANotification(
        satName,
        etaSec,
        eta.distance,
        eta.bearing,
        eta.direction
      );
    } catch (error) {
      console.error('[Smart Notifications] Error:', error);
    }
  }

  /**
   * Record pass to history
   */
  async recordPass(satellite, eta) {
    try {
      const key = PASS_HISTORY_KEY + satellite.name;
      const existing = await AsyncStorage.getItem(key);
      const history = existing ? JSON.parse(existing) : [];

      history.push({
        timestamp: Date.now(),
        distance: eta.distance,
        bearing: eta.bearing,
        direction: eta.direction,
        state: eta.state,
      });

      if (history.length > 50) {
        history.shift();
      }

      await AsyncStorage.setItem(key, JSON.stringify(history));
    } catch (error) {
      console.error('[Proximity Service] Error recording pass:', error);
    }
  }

  /**
   * Check a single satellite with full ETA processing
   */
  async checkSatelliteProximity(satellite, userLat, userLon, userLocationName) {
    try {
      if (!satellite || satellite.latitude === null || satellite.longitude === null) {
        return;
      }

      // Calculate ETA using ETA service
      const eta = satelliteETAService.calculateETA(satellite, userLat, userLon);
      
      if (!eta) {
        return;
      }

      // Cache ETA
      satelliteETAService.cacheETA(satellite.name, eta);

      // Update tracked alerts with full ETA data
      this.trackedAlerts[satellite.name] = {
        distance: eta.distance,
        distanceNum: eta.distanceNum,
        bearing: eta.bearing,
        direction: eta.direction,
        eta: eta.eta,
        etaSeconds: eta.etaSeconds,
        state: eta.state,
        message: eta.message,
        timestamp: Date.now(),
      };

      // Handle smart notifications
      await this.handleSmartNotifications(satellite, eta, userLocationName);

      console.log(
        `[Proximity Service] ${satellite.name}: ${eta.distance}km, ETA: ${eta.eta}, State: ${eta.state}`
      );
    } catch (error) {
      console.error('[Proximity Service] Error checking satellite:', error);
    }
  }

  /**
   * Monitor multiple satellites with ETA tracking
   */
  async startMonitoring(satelliteIds, userLat, userLon, userLocationName, interval = 30000) {
    if (this.monitoringActive) {
      console.warn('[Proximity Service] Monitoring already active');
      return null;
    }

    this.monitoringActive = true;
    console.log('[Proximity Service] Starting ETA monitoring...');

    const monitoringInterval = setInterval(async () => {
      try {
        const satellitePromises = satelliteIds.map(id => 
          this.liveService.fetchSatellite(id)
        );

        const satellites = await Promise.all(satellitePromises);

        for (const satellite of satellites) {
          if (satellite) {
            await this.checkSatelliteProximity(satellite, userLat, userLon, userLocationName);
          }
        }
      } catch (error) {
        console.error('[Proximity Service] Monitoring error:', error);
      }
    }, interval);

    return () => {
      clearInterval(monitoringInterval);
      this.monitoringActive = false;
      this.trackedAlerts = {};
      console.log('[Proximity Service] Monitoring stopped');
    };
  }

  /**
   * Get current tracked alerts
   */
  getTrackedAlerts() {
    return this.trackedAlerts;
  }

  /**
   * Get pass history
   */
  async getPassHistory(satelliteName, limit = 10) {
    try {
      const key = PASS_HISTORY_KEY + satelliteName;
      const data = await AsyncStorage.getItem(key);
      if (!data) return [];
      
      const history = JSON.parse(data);
      return history.slice(-limit).reverse();
    } catch (error) {
      console.error('[Proximity Service] Error getting pass history:', error);
      return [];
    }
  }

  /**
   * Clear all caches and cooldowns
   */
  async clearAllAlerts() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const alertKeys = keys.filter(k => 
        k.startsWith(LAST_ALERT_KEY) || k.startsWith(LAST_NOTIFICATION_KEY)
      );
      await AsyncStorage.multiRemove(alertKeys);
      this.trackedAlerts = {};
      satelliteETAService.clearCaches();
      console.log('[Proximity Service] All alerts cleared');
    } catch (error) {
      console.error('[Proximity Service] Error clearing alerts:', error);
    }
  }
}

// Export singleton instance
export default new SatelliteProximityService();
export { SatelliteProximityService };

