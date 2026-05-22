import * as satellite from 'satellite.js';

const BACKEND_URL = global.__DEV__ ? 'http://10.0.2.2:8000/api/v1' : 'https://your-backend.example.com/api/v1';
const N2YO_API_URL = 'https://api.n2yo.com/rest/v1/satellite';
// N2YO API key from backend .env - we'll use backend proxy

function safeNumber(v, fallback = 0) {
  return typeof v === 'number' && isFinite(v) ? v : fallback;
}

// Fetch live satellite position from N2YO
async function fetchN2YOPositions(satIds = [], observerLat = 0, observerLng = 0, observerAltKm = 0) {
  try {
    // Call backend proxy which will use N2YO API key
    const idList = satIds.join(',');
    const res = await fetch(`${BACKEND_URL}/satellites/n2yo-positions?ids=${idList}&lat=${observerLat}&lng=${observerLng}&alt=${observerAltKm}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    // fallback to TLE-based computation
  }
  return null;
}

async function fetchTLE(noradId) {
  try {
    const res = await fetch(`${BACKEND_URL}/satellites/${noradId}/tle`);
    if (!res.ok) throw new Error('no-tle');
    const json = await res.json();
    if (json && json.tle1 && json.tle2) return [json.tle1, json.tle2];
  } catch (e) {
    try {
      const r = await fetch(`https://celestrak.com/NORAD/elements/gp.php?CATNR=${noradId}`);
      const txt = await r.text();
      const lines = txt.trim().split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length >= 3) return [lines[1], lines[2]];
    } catch (er) {
      return null;
    }
  }
  return null;
}

function computeStateFromTLE(tleLines, when = new Date(), observer = null) {
  try {
    const satrec = satellite.twoline2satrec(tleLines[0], tleLines[1]);
    const posVel = satellite.propagate(satrec, when);
    const positionEci = posVel.position;
    const velocityEci = posVel.velocity;
    if (!positionEci) return null;

    const gmst = satellite.gstime(when);
    const geodetic = satellite.eciToGeodetic(positionEci, gmst);
    const longitude = satellite.degreesLong(geodetic.longitude);
    const latitude = satellite.degreesLat(geodetic.latitude);
    const altitude = geodetic.height; // km

    // speed magnitude (km/s)
    const vx = safeNumber(velocityEci.x);
    const vy = safeNumber(velocityEci.y);
    const vz = safeNumber(velocityEci.z);
    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);

    // simple orbit type heuristic
    const orbitType = altitude < 2000 ? 'LEO' : altitude < 35786 ? 'MEO' : 'GEO';

    // visibility: rough check using elevation angle
    let elevation = null;
    let visible = false;
    if (observer && typeof observer.latitude === 'number') {
      const observerGd = { longitude: satellite.degreesToRadians(observer.longitude), latitude: satellite.degreesToRadians(observer.latitude), height: observer.altitude || 0 };
      const lookAngles = satellite.ecfToLookAngles(observerGd, satellite.eciToEcf(positionEci, gmst));
      elevation = lookAngles.elevation && satellite.degreesLat(lookAngles.elevation);
      visible = elevation > 5; // visible if >5deg
    }

    return {
      latitude,
      longitude,
      altitude: safeNumber(altitude, 0),
      speed: safeNumber(speed, 0),
      orbitType,
      visibility: visible,
      elevation,
      when: when.toISOString(),
    };
  } catch (e) {
    return null;
  }
}

async function estimateNextPass(tleLines, observer, lookHours = 24) {
  // naive stepping algorithm: step 30s until elevation > 10 deg
  try {
    const stepSec = 30;
    const now = Date.now();
    for (let t = now; t < now + lookHours * 3600 * 1000; t += stepSec * 1000) {
      const state = computeStateFromTLE(tleLines, new Date(t), observer);
      if (state && state.elevation != null && state.elevation > 10) return { nextPass: new Date(t).toISOString(), elevation: state.elevation };
    }
  } catch (e) {
    // fallthrough
  }
  return null;
}

export default {
  fetchN2YOPositions,
  fetchTLE,
  computeStateFromTLE,
  estimateNextPass,
};
