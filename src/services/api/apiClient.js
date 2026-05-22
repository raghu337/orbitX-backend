const N2YO_BASE_URL = 'https://api.n2yo.com/rest/v1/satellite';
const OPEN_NOTIFY_BASE_URL = 'http://api.open-notify.org';

export const fetchN2YO = async (endpoint) => {
  // TODO: Secure your API key in an .env file
  const API_KEY = process.env.EXPO_PUBLIC_N2YO_API_KEY || 'YOUR_N2YO_API_KEY';
  const url = `${N2YO_BASE_URL}${endpoint}&apiKey=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const fetchOpenNotify = async (endpoint) => {
  const url = `${OPEN_NOTIFY_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};
