import { LIVE_SATELLITES as DEFAULT_SATELLITES } from '../data/liveSatellites';
import gpsService from './gpsService';
import satelliteService from './satelliteService';

const BACKEND_URL = global.__DEV__ ? 'http://10.0.2.2:8000/api/v1' : 'https://your-backend.example.com/api/v1';

// Simple polling subscription with N2YO data fallback to TLE
function subscribe(noradIds = [], onUpdate = () => {}, intervalMs = 5000) {
  let running = true;

  async function tick() {
    if (!running) return;
    try {
      const updates = [];
      const obs = await getObserverLocationSafe();
      
      // Try to fetch N2YO positions for all satellites at once
      let n2yoData = null;
      if (noradIds.length > 0 && obs) {
        try {
          n2yoData = await satelliteService.fetchN2YOPositions(noradIds, obs.latitude, obs.longitude, obs.altitude || 0);
        } catch (e) {
          // N2YO failed, will fall back to TLE
        }
      }

      // Process each satellite
      for (const id of noradIds) {
        try {
          const defaultSat = DEFAULT_SATELLITES.find((sat) => sat.noradId === id);
          
          // Check if N2YO has data for this satellite
          let satData = null;
          if (n2yoData && Array.isArray(n2yoData)) {
            satData = n2yoData.find((s) => s.noradId === id || s.satid === id);
          }
          
          if (satData && satData.latitude !== undefined && satData.longitude !== undefined) {
            // Use N2YO data directly
            updates.push({
              noradId: id,
              name: satData.satname || defaultSat?.name || `SAT ${id}`,
              latitude: safeNumber(satData.latitude),
              longitude: safeNumber(satData.longitude),
              altitude: safeNumber(satData.altitude, defaultSat?.altitude ?? 400),
              speed: safeNumber(satData.velocity, defaultSat?.speed ?? 7.66),
              orbitType: satData.orbitType || defaultSat?.orbitType || 'LEO',
              visibility: satData.visibility !== undefined ? satData.visibility : (defaultSat?.visibility ?? false),
              nextPass: satData.nextPass || defaultSat?.nextPass || null,
              signalStrength: safeNumber(satData.signalStrength, 0.7),
              elevation: safeNumber(satData.elevation),
              source: 'n2yo',
            });
          } else {
            // Fallback to TLE-based computation
            const tle = await satelliteService.fetchTLE(id);
            if (!tle) {
              // Use default/mock data as last resort
              updates.push({
                noradId: id,
                name: defaultSat?.name || `SAT ${id}`,
                latitude: defaultSat?.latitude ?? 0,
                longitude: defaultSat?.longitude ?? 0,
                altitude: defaultSat?.altitude ?? 400,
                speed: defaultSat?.speed ?? 7.66,
                orbitType: defaultSat?.orbitType ?? 'LEO',
                visibility: defaultSat?.visibility ?? false,
                nextPass: defaultSat?.nextPass ?? null,
                signalStrength: defaultSat?.signalStrength ?? 0.2,
                error: 'No real-time data available',
                source: 'fallback',
              });
              continue;
            }
            const state = satelliteService.computeStateFromTLE(tle, new Date(), obs);
            const next = await satelliteService.estimateNextPass(tle, obs, 12);
            updates.push({
              noradId: id,
              name: defaultSat?.name || `SAT ${id}`,
              ...(state || {}),
              nextPass: next?.nextPass,
              signalStrength: Math.random() * 0.5 + 0.5,
              source: 'tle',
            });
          }
        } catch (e) {
          // Ignore per-satellite errors
        }
      }
      
      if (updates.length) onUpdate(updates);
    } catch (err) {
      // Ignore top-level polling errors
    } finally {
      if (running) setTimeout(tick, intervalMs);
    }
  }

  tick();
  return () => { running = false; };
}

function safeNumber(v, fallback = 0) {
  return typeof v === 'number' && isFinite(v) ? v : fallback;
}

async function getObserverLocationSafe() {
  try {
    return await gpsService.getCurrentLocationSafe();
  } catch (e) {
    return null;
  }
}

async function getLiveTelemetry(noradId) {
  try {
    const obs = await getObserverLocationSafe();
    if (!obs) return { noradId, error: 'Location unavailable' };
    
    const n2yoData = await satelliteService.fetchN2YOPositions([noradId], obs.latitude, obs.longitude, obs.altitude || 0);
    if (n2yoData && Array.isArray(n2yoData) && n2yoData.length > 0) {
      return { noradId, ...n2yoData[0], source: 'n2yo' };
    }
    
    const tle = await satelliteService.fetchTLE(noradId);
    const state = tle ? satelliteService.computeStateFromTLE(tle, new Date(), obs) : null;
    return { noradId, ...(state || {}), source: 'tle' };
  } catch (e) {
    return { noradId, error: e.message };
  }
}

export default { subscribe, getLiveTelemetry };
export { DEFAULT_SATELLITES as LIVE_SATELLITES };

