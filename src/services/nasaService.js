import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const APOD_FAVORITES_KEY = '@orbitx_apod_favorites';
const NASA_APOD_URL = 'https://api.nasa.gov/planetary/apod';

const NASA_API_KEY = Constants.expoConfig?.extra?.NASA_API_KEY || 'DEMO_KEY';

const buildApodUrl = (date) => {
  const query = new URLSearchParams({
    api_key: NASA_API_KEY,
  });
  if (date) {
    query.append('date', date);
  }
  return `${NASA_APOD_URL}?${query.toString()}`;
};

export const fetchAPOD = async (date) => {
  const url = buildApodUrl(date);
  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unable to load NASA APOD.');
    throw new Error(`NASA API error: ${response.status} ${text}`);
  }

  const payload = await response.json();
  if (!payload || typeof payload !== 'object') {
    throw new Error('Unexpected NASA APOD response format.');
  }
  return payload;
};

export const loadApodFavorites = async () => {
  try {
    const saved = await AsyncStorage.getItem(APOD_FAVORITES_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('[NasaService] Failed to load favorites:', error);
    return [];
  }
};

export const saveApodFavorites = async (favorites) => {
  try {
    await AsyncStorage.setItem(APOD_FAVORITES_KEY, JSON.stringify(favorites));
    return favorites;
  } catch (error) {
    console.warn('[NasaService] Failed to save favorites:', error);
    return favorites;
  }
};

export const toggleApodFavorite = async (apodData) => {
  if (!apodData?.date) {
    throw new Error('Invalid APOD data.');
  }

  const favorites = await loadApodFavorites();
  const exists = favorites.find((item) => item.date === apodData.date);
  let updatedFavorites;

  if (exists) {
    updatedFavorites = favorites.filter((item) => item.date !== apodData.date);
  } else {
    const favoriteEntry = {
      date: apodData.date,
      title: apodData.title,
      url: apodData.url,
      hdurl: apodData.hdurl || apodData.url,
      media_type: apodData.media_type,
      explanation: apodData.explanation,
      copyright: apodData.copyright || 'NASA',
    };
    updatedFavorites = [favoriteEntry, ...favorites];
  }

  await saveApodFavorites(updatedFavorites);
  return updatedFavorites;
};
