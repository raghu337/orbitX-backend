import * as satellite from 'satellite.js';
import { BASE_URL } from './api/orbitxApi';

const BACKEND_URL = BASE_URL;
const EARTH_RADIUS_KM = 6371;
const LIVE_SATELLITE_DECK = [
  { id: 'ISS', name: 'ISS', noradId: 25544, color: '#00E5FF' },
  { id: 'HUBBLE', name: 'Hubble', noradId: 20580, color: '#AFAFFF' },
  { id: 'NOAA', name: 'NOAA', noradId: 33591, color: '#7CFFB2' },
  { id: 'STARLINK', name: 'Starlink', noradId: 44238, color: '#42CFFF' },
  { id: 'GPS', name: 'GPS', noradId: 39227, color: '#BEFF6C' },
];
const SIMULATION_COLORS = [
  '#00E5FF',
  '#AFAFFF',
  '#7CFFB2',
  '#42CFFF',
  '#BEFF6C',
  '#FF6CFF',
  '#6CFF9A',
  '#FFD24D',
  '#8CE0FF',
  '#FF8C6C',
];
const SIMULATED_SATELLITE_COUNT = 30;

function normalizeLongitude(value) {
  return ((value + 180) % 360 + 360) % 360 - 180;
}

function validateCoordinate(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

function isValidSatellite(sat) {
  if (!sat) return false;
  return (
    validateCoordinate(sat.latitude) !== null &&
    validateCoordinate(sat.longitude) !== null
  );
}

function filterValidSatellites(data) {
  if (!Array.isArray(data)) return [];
  return data.filter(isValidSatellite);
}

function createSatelliteFleet() {
  const liveSats = LIVE_SATELLITE_DECK.map((sat, index) => ({
    ...sat,
    isLiveSource: true,
    isSimulated: false,
    orbitAltitudeKm: 420 + ((index % 3) * 12),
    orbitInclination: 51.6,
    orbitPhase: (index * 0.8) % (Math.PI * 2),
    orbitCenterLongitude: ((index * 60) % 360) - 180,
    orbitalPeriodMin: 92,
    orbitDirection: index % 2 === 0 ? 1 : -1,
  }));

  const simulated = Array.from(
    { length: SIMULATED_SATELLITE_COUNT - liveSats.length },
    (_, index) => ({
      id: `SIM-${index + 1}`,
      name: `Sat ${index + 1}`,
      noradId: null,
      color: SIMULATION_COLORS[index % SIMULATION_COLORS.length],
      isLiveSource: false,
      isSimulated: true,
      orbitInclination: 20 + ((index % 5) * 10),
      orbitAltitudeKm: 420 + ((index % 7) * 30),
      orbitalPeriodMin: 88 + ((index % 8) * 2),
      orbitPhase: ((index + 1) / SIMULATED_SATELLITE_COUNT) * Math.PI * 2,
      orbitCenterLongitude: ((index * 43) % 360) - 180,
      orbitDirection: index % 2 === 0 ? 1 : -1,
    })
  );

  return [...liveSats, ...simulated];
}

async function fetchN2YOPositions(
  satIds = [],
  observerLat = 0,
  observerLng = 0,
  observerAltKm = 0
) {
  try {
    const idList = satIds.join(',');
    const url =
      `${BACKEND_URL}/satellites/n2yo-positions` +
      `?ids=${encodeURIComponent(idList)}` +
      `&lat=${observerLat}` +
      `&lng=${observerLng}` +
      `&alt=${observerAltKm}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    let data = await res.json();
    if (!Array.isArray(data)) {
      data = data ? [data] : [];
    }

    const valid = filterValidSatellites(data);
    return valid.length ? valid : null;
  } catch (e) {
    console.warn('N2YO Error:', e?.message || e);
    return null;
  }
}

async function fetchTLE(noradId) {
  try {
    const res = await fetch(`${BACKEND_URL}/satellites/${noradId}/tle`);
    if (!res.ok) return null;

    const json = await res.json();
    if (json?.tle1 && json?.tle2) {
      return [json.tle1, json.tle2];
    }

    return null;
  } catch {
    return null;
  }
}

function computeVisibility(latitude, longitude, altitude, observer) {
  if (
    !observer ||
    typeof observer.latitude !== 'number' ||
    typeof observer.longitude !== 'number'
  ) {
    return false;
  }

  const rad = Math.PI / 180;
  const lat1 = latitude * rad;
  const lon1 = longitude * rad;
  const lat2 = observer.latitude * rad;
  const lon2 = observer.longitude * rad;

  const cosCentralAngle =
    Math.sin(lat1) * Math.sin(lat2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2);
  const centralAngle = Math.acos(Math.min(1, Math.max(-1, cosCentralAngle)));
  const horizonAngle = Math.acos(
    EARTH_RADIUS_KM / (EARTH_RADIUS_KM + (altitude || 0))
  );

  return centralAngle <= horizonAngle;
}

function estimateNextPassString(when, sat) {
  const periodMs = (sat?.orbitalPeriodMin || 90) * 60 * 1000;
  const minimumDelay = 5 * 60 * 1000;
  const next = new Date(when.getTime() + Math.max(minimumDelay, periodMs * 0.18));
  return next.toISOString();
}

function simulateSatelliteState(
  sat,
  when = new Date(),
  observer = { latitude: 20, longitude: 0 }
) {
  const phase = typeof sat.orbitPhase === 'number' ? sat.orbitPhase : 0;
  const direction = sat.orbitDirection || 1;
  const periodSeconds = (sat.orbitalPeriodMin || 90) * 60;
  const angle =
    phase + ((2 * Math.PI) / periodSeconds) * (when.getTime() / 1000) * direction;
  const inclinationRad = ((sat.orbitInclination || 55) * Math.PI) / 180;
  const latitude = Math.sin(angle) * Math.sin(inclinationRad) * 68;
  const longitude = normalizeLongitude(
    (angle * 180) / Math.PI +
      (typeof sat.orbitCenterLongitude === 'number'
        ? sat.orbitCenterLongitude
        : 0)
  );
  const altitude = sat.orbitAltitudeKm ?? 520;
  const velocity = 7.7 + ((450 - altitude) / 450) * 0.24;
  const visibility = computeVisibility(latitude, longitude, altitude, observer);

  return {
    latitude,
    longitude,
    altitude,
    velocity,
    visibility,
    nextPass: estimateNextPassString(when, sat),
    orbitType:
      altitude < 2000
        ? 'LEO'
        : altitude < 35786
        ? 'MEO'
        : 'GEO',
    lastUpdated: when.toISOString(),
  };
}

function mergeLiveAndSimulatedPositions(fleet, liveData, observer) {
  const now = new Date();
  return fleet.map((sat) => {
    const live =
      sat.noradId && Array.isArray(liveData)
        ? liveData.find((x) => Number(x.satid) === Number(sat.noradId))
        : null;

    const fallback = simulateSatelliteState(sat, now, observer);

    if (
      live &&
      validateCoordinate(Number(live.satlatitude)) !== null &&
      validateCoordinate(Number(live.satlongitude)) !== null
    ) {
      const latitude = Number(live.satlatitude);
      const longitude = Number(live.satlongitude);
      const altitude = Number(live.sataltitude) || fallback.altitude;
      const velocity = Number(live.velocity) || fallback.velocity;
      const visibility = computeVisibility(latitude, longitude, altitude, observer);

      return {
        ...sat,
        latitude,
        longitude,
        altitude,
        velocity,
        visibility,
        nextPass: estimateNextPassString(now, sat),
        orbitType:
          altitude < 2000
            ? 'LEO'
            : altitude < 35786
            ? 'MEO'
            : 'GEO',
        isLive: true,
        lastUpdated: now.toISOString(),
      };
    }

    return {
      ...sat,
      ...fallback,
      isLive: false,
      lastUpdated: now.toISOString(),
    };
  });
}

function computeStateFromTLE(
  tleLines,
  when = new Date(),
  observer = null
) {
  try {
    const satrec = satellite.twoline2satrec(tleLines[0], tleLines[1]);
    const posVel = satellite.propagate(satrec, when);

    if (!posVel.position) return null;

    const gmst = satellite.gstime(when);
    const geo = satellite.eciToGeodetic(posVel.position, gmst);

    const latitude = satellite.degreesLat(geo.latitude);
    const longitude = satellite.degreesLong(geo.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    const altitude = geo.height;
    const v = posVel.velocity;
    const speed = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

    return {
      latitude,
      longitude,
      altitude,
      speed,
      orbitType:
        altitude < 2000
          ? 'LEO'
          : altitude < 35786
          ? 'MEO'
          : 'GEO',
      when: when.toISOString(),
    };
  } catch {
    return null;
  }
}

async function estimateNextPass(
  tleLines,
  observer,
  lookHours = 24
) {
  const now = Date.now();

  for (
    let t = now;
    t < now + lookHours * 3600 * 1000;
    t += 30000
  ) {
    const state = computeStateFromTLE(tleLines, new Date(t), observer);
    if (state) {
      return {
        nextPass: new Date(t).toISOString(),
      };
    }
  }

  return null;
}

export default {
  fetchN2YOPositions,
  fetchTLE,
  computeStateFromTLE,
  estimateNextPass,
  createSatelliteFleet,
  simulateSatelliteState,
  mergeLiveAndSimulatedPositions,
};