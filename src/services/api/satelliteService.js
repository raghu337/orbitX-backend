import orbitxApi from './orbitxApi';

// =============================
// SATELLITE CATEGORIES
// =============================
export const SATELLITE_CATEGORIES = {
  COMMUNICATION: 1,
  SCIENCE: 26,
  NAVIGATION: 20,
  WEATHER: 3,
  ISS: 2,
};

// =============================
// COMMON SATELLITE IDs
// =============================
export const SATELLITE_IDS = {
  ISS: 25544,
  STARLINK: 25544, // NOTE: Starlink usually fetched via category/list API
};

// =============================
// ORBITX BACKEND API CALLS
// =============================

export const getAllSatellites = async (skip = 0, limit = 100) => {
  try {
    const response = await orbitxApi.get('/satellites/', {
      params: { skip, limit }
    });
    return { satellites: response.data, error: null };
  } catch (error) {
    return { satellites: [], error: error.message };
  }
};

export const getSatelliteById = async (id) => {
  try {
    const response = await orbitxApi.get(`/satellites/${id}`);
    return { satellite: response.data, error: null };
  } catch (error) {
    return { satellite: null, error: error.message };
  }
};

export const favoriteSatellite = async (satelliteId) => {
  try {
    const response = await orbitxApi.post('/satellites/favorite', null, {
      params: { satellite_id: satelliteId }
    });
    return { satellite: response.data, error: null };
  } catch (error) {
    return { satellite: null, error: error.message };
  }
};

export const getLiveTracking = async () => {
  try {
    const response = await orbitxApi.get('/tracking/live');
    return { tracking: response.data, error: null };
  } catch (error) {
    return { tracking: [], error: error.message };
  }
};

export const getSatelliteTracking = async (satelliteId) => {
  try {
    const response = await orbitxApi.get(`/tracking/${satelliteId}`);
    return { tracking: response.data, error: null };
  } catch (error) {
    return { tracking: [], error: error.message };
  }
};

/**
 * Fetches visual passes for a satellite.
 * Currently uses mock data as the backend endpoint is pending implementation.
 */
export const getVisualPasses = async (satelliteId, lat, lng) => {
  try {
    // In a production app, this would call:
    // await orbitxApi.get(`/tracking/${satelliteId}/passes`, { params: { lat, lng } });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const now = Math.floor(Date.now() / 1000);
    const mockPasses = [
      {
        startUTC: now + 600, // In 10 mins
        duration: 480,
        maxEl: 65,
        startAz: 310,
        mag: -2.1,
      },
      {
        startUTC: now + 3600 * 3, // In 3 hours
        duration: 320,
        maxEl: 35,
        startAz: 45,
        mag: -0.5,
      },
      {
        startUTC: now + 3600 * 24 + 1200, // Tomorrow
        duration: 540,
        maxEl: 82,
        startAz: 290,
        mag: -3.4,
      }
    ];
    
    return { passes: mockPasses, error: null };
  } catch (error) {
    return { passes: [], error: 'Failed to fetch visual passes' };
  }
};