import axios from 'axios';

// Replace with your local machine's IP address (not localhost) when testing on a physical device via Expo
const BASE_URL = 'http://192.168.X.X:5000/api'; 

export const fetchSatelliteTelemetry = async (satelliteId) => {
  try {
    const response = await axios.get(`${BASE_URL}/satellites/${satelliteId}`, {
      timeout: 5000 // 5-second timeout protects the app from freezing if the server is down
    });
    return response.data;
  } catch (error) {
    console.error("Backend fetch failed, returning fallback mock data:", error.message);
    // Returning fallback data ensures the app never crashes if the backend goes offline
    return null; 
  }
};