import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Satellite ETA Service
 * Calculates real-time ETAs, orbital predictions, and closest approach metrics
 */

const EARTH_RADIUS_KM = 6371;
const SATELLITE_VELOCITY = {
  ISS: 7.66,        // km/s
  HUBBLE: 7.59,     // km/s
  NOAA: 7.45,       // km/s
  DEFAULT: 7.5,     // km/s (average LEO)
};

class SatelliteETAService {
  constructor() {
    this.etaCache = {};
    this.passHistory = {};
  }

  /**
   * Calculate bearing between two coordinates (0-360 degrees)
   * 0 = North, 90 = East, 180 = South, 270 = West
   */
  calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }

  /**
   * Get compass direction from bearing
   */
  getDirection(bearing) {
    const directions = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];
    const index = Math.round(bearing / 22.5) % 16;
    return directions[index];
  }

  /**
   * Calculate if satellite is moving toward or away from user
   * Returns: 'APPROACHING', 'RECEDING', or 'PERPENDICULAR'
   */
  calculateMovementDirection(
    prevLat, prevLon,
    currLat, currLon,
    userLat, userLon
  ) {
    // Vector from user to current satellite position
    const toSatX = currLon - userLon;
    const toSatY = currLat - userLat;

    // Satellite's movement vector
    const moveX = currLon - prevLon;
    const moveY = currLat - prevLat;

    // Dot product (positive = approaching, negative = receding)
    const dotProduct = toSatX * moveX + toSatY * moveY;

    if (dotProduct < -0.1) return 'APPROACHING';
    if (dotProduct > 0.1) return 'RECEDING';
    return 'PERPENDICULAR';
  }

  /**
   * Calculate ETA (Estimated Time of Arrival) based on:
   * - Current distance
   * - Satellite velocity
   * - Satellite movement direction
   * - Orbital path geometry
   */
  calculateETA(satellite, userLat, userLon) {
    try {
      if (!satellite || satellite.latitude === null || satellite.longitude === null) {
        return null;
      }

      // Calculate great-circle distance
      const distance = this.haversineDistance(
        userLat, userLon,
        satellite.latitude, satellite.longitude
      );

      // Get satellite velocity
      const velocity = SATELLITE_VELOCITY[satellite.name?.toUpperCase()] || SATELLITE_VELOCITY.DEFAULT;

      // Calculate bearing (direction from user to satellite)
      const bearing = this.calculateBearing(
        userLat, userLon,
        satellite.latitude, satellite.longitude
      );

      // Estimate if satellite is overhead or approaching
      // Satellites at > 1000km are not a realistic concern
      if (distance > 1000) {
        return {
          distance,
          bearing,
          direction: this.getDirection(bearing),
          eta: null,
          etaSeconds: null,
          state: 'FAR',
          isApproaching: true,
          isOverhead: false,
          closest: false,
          message: 'Far from your location',
        };
      }

      // Calculate ETA assuming satellite moves in straight line at current velocity
      // Actual orbital mechanics are complex, but this gives reasonable estimate
      const etaSeconds = Math.max(0, (distance / velocity) - 10); // -10s buffer for orbital curve

      // Determine state based on distance and ETA
      let state = 'FAR';
      if (distance < 10) state = 'NEARBY';
      if (distance < 5) state = 'OVERHEAD';
      if (distance < 2) state = 'DIRECTLY_OVERHEAD';
      if (etaSeconds > 300) state = 'APPROACHING'; // > 5 minutes away

      // Format ETA for display
      const minutes = Math.floor(etaSeconds / 60);
      const seconds = Math.floor(etaSeconds % 60);
      const etaDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      return {
        distance: distance.toFixed(2),
        distanceNum: distance,
        bearing: bearing.toFixed(1),
        direction: this.getDirection(bearing),
        eta: etaDisplay,
        etaSeconds: Math.floor(etaSeconds),
        state,
        isApproaching: etaSeconds > 0,
        isOverhead: distance < 5,
        isDirectlyOverhead: distance < 2,
        message: this.getStateMessage(state, distance, minutes, seconds),
      };
    } catch (error) {
      console.error('[ETA Service] Error calculating ETA:', error);
      return null;
    }
  }

  /**
   * Haversine distance calculation
   */
  haversineDistance(lat1, lon1, lat2, lon2) {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }

  /**
   * Get human-readable state message
   */
  getStateMessage(state, distance, minutes, seconds) {
    switch (state) {
      case 'FAR':
        return 'No satellites approaching';
      case 'APPROACHING':
        return `${minutes}m ${seconds}s away`;
      case 'NEARBY':
        return `${minutes}m ${seconds}s - Getting close!`;
      case 'OVERHEAD':
        return `${minutes}m ${seconds}s - Will pass above you`;
      case 'DIRECTLY_OVERHEAD':
        return `${seconds}s - DIRECTLY OVERHEAD!`;
      default:
        return `${distance.toFixed(1)}km away`;
    }
  }

  /**
   * Calculate next pass details for a satellite
   * Given current data and orbital velocity
   */
  calculateNextPass(satellite, userLat, userLon) {
    const eta = this.calculateETA(satellite, userLat, userLon);
    if (!eta) return null;

    const now = Date.now();
    const nextPassTime = new Date(now + (eta.etaSeconds * 1000));

    return {
      satellite: satellite.name,
      distance: eta.distance,
      bearing: eta.bearing,
      direction: eta.direction,
      eta: eta.eta,
      etaSeconds: eta.etaSeconds,
      nextPassTime: nextPassTime.toISOString(),
      nextPassTimeMs: nextPassTime.getTime(),
      state: eta.state,
      isOverhead: eta.isOverhead,
    };
  }

  /**
   * Store pass history for a satellite
   */
  async recordPass(satellite, data) {
    try {
      const key = `PASS_HISTORY_${satellite.name}`;
      const existing = await AsyncStorage.getItem(key);
      const history = existing ? JSON.parse(existing) : [];

      history.push({
        timestamp: Date.now(),
        distance: data.distance,
        bearing: data.bearing,
        direction: data.direction,
        eta: data.eta,
        state: data.state,
      });

      // Keep only last 50 passes
      if (history.length > 50) {
        history.shift();
      }

      await AsyncStorage.setItem(key, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('[ETA Service] Error recording pass:', error);
      return false;
    }
  }

  /**
   * Get pass history
   */
  async getPassHistory(satelliteName, limit = 10) {
    try {
      const key = `PASS_HISTORY_${satelliteName}`;
      const data = await AsyncStorage.getItem(key);
      if (!data) return [];

      const history = JSON.parse(data);
      return history.slice(-limit).reverse();
    } catch (error) {
      console.error('[ETA Service] Error getting pass history:', error);
      return [];
    }
  }

  /**
   * Get notification trigger times for a pass
   */
  getNotificationTriggerTimes(etaSeconds) {
    return {
      trigger_5min: etaSeconds <= 300 && etaSeconds > 260,    // 5:00 - 4:20
      trigger_2min: etaSeconds <= 120 && etaSeconds > 80,     // 2:00 - 1:20
      trigger_overhead: etaSeconds <= 60 && etaSeconds > -30, // 1:00 to 30s after
      trigger_exiting: etaSeconds < -30,                       // More than 30s past
    };
  }

  /**
   * Cache ETA results temporarily
   */
  cacheETA(satelliteName, eta) {
    this.etaCache[satelliteName] = {
      data: eta,
      timestamp: Date.now(),
    };
  }

  /**
   * Get cached ETA if still valid (within 5 seconds)
   */
  getCachedETA(satelliteName) {
    const cached = this.etaCache[satelliteName];
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age < 5000) {
      return cached.data;
    }

    delete this.etaCache[satelliteName];
    return null;
  }

  /**
   * Clear all caches
   */
  clearCaches() {
    this.etaCache = {};
  }
}

export default new SatelliteETAService();
export { SatelliteETAService };

