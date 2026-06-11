import AsyncStorage from '@react-native-async-storage/async-storage';

const APOD_FAVORITES_KEY = '@orbitx_apod_favorites';
const NASA_APOD_URL = 'https://api.nasa.gov/planetary/apod';
const DEFAULT_API_KEY = 'DEMO_KEY';

const getApiKey = () => {
  const extra = (typeof Expo !== 'undefined' && Expo.Constants?.manifest?.extra) || null;
  const expoConfig = extra || null;
  const configKey = expoConfig?.NASA_API_KEY || process?.env?.NASA_API_KEY;
  if (typeof configKey === 'string' && configKey.trim().length > 0) {
    return configKey.trim();
  }
  return DEFAULT_API_KEY;
};

const buildApodUrl = (date) => {
  const apiKey = getApiKey();
  let url = `${NASA_APOD_URL}?api_key=${encodeURIComponent(apiKey)}`;
  if (date) {
    url += `&date=${encodeURIComponent(date)}`;
  }
  return url;
};

export const fetchApod = async (date) => {
  const url = buildApodUrl(date);
  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unable to load NASA APOD.');
    throw new Error(`NASA API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  if (!data || typeof data !== 'object') {
    throw new Error('Unexpected NASA APOD response.');
  }
  return data;
};

export const loadApodFavorites = async () => {
  try {
    const stored = await AsyncStorage.getItem(APOD_FAVORITES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('[apodService] Failed to load favorites', error);
    return [];
  }
};

export const saveApodFavorites = async (favorites) => {
  try {
    const sanitized = Array.isArray(favorites) ? favorites : [];
    await AsyncStorage.setItem(APOD_FAVORITES_KEY, JSON.stringify(sanitized));
    return sanitized;
  } catch (error) {
    console.warn('[apodService] Failed to save favorites', error);
    return favorites;
  }
};

export const toggleApodFavorite = async (apodData) => {
  if (!apodData || !apodData.date) {
    throw new Error('Invalid APOD data.');
  }

  const favorites = await loadApodFavorites();
  const exists = favorites.some((item) => item.date === apodData.date);
  let updatedFavorites;

  if (exists) {
    updatedFavorites = favorites.filter((item) => item.date !== apodData.date);
  } else {
    const favorite = {
      date: apodData.date,
      title: apodData.title,
      url: apodData.url,
      hdurl: apodData.hdurl || apodData.url,
      media_type: apodData.media_type,
      explanation: apodData.explanation,
      copyright: apodData.copyright || 'NASA',
    };
    updatedFavorites = [favorite, ...favorites];
  }

  return saveApodFavorites(updatedFavorites);
};
