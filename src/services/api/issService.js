import axios from 'axios';

const ISS_URL = 'http://api.open-notify.org/iss-now.json';

/**
 * Fetches the current live position of the International Space Station (ISS).
 */
export const getISSLocation = async () => {
  try {
    const response = await axios.get(ISS_URL);
    if (response.data && response.data.message === 'success') {
      return {
        latitude: parseFloat(response.data.iss_position.latitude),
        longitude: parseFloat(response.data.iss_position.longitude),
        timestamp: response.data.timestamp,
        error: null
      };
    }
    return { latitude: null, longitude: null, error: 'Invalid API response' };
  } catch (error) {
    console.error('ISS API Error:', error);
    return { latitude: null, longitude: null, error: error.message };
  }
};
