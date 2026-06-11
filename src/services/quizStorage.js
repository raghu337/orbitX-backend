import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@orbitx_quiz_profile';

const LEVEL_TITLES = {
  1: 'Cadet',
  2: 'Explorer',
  3: 'Astronaut',
  4: 'Commander',
  5: 'Space Scientist',
  6: 'Galaxy Master',
};

const DEFAULT_PROFILE = {
  xp: 0,
  level: 1,
  levelName: LEVEL_TITLES[1],
  currentXp: 0,
  nextLevelXp: 1000,
  progress: 0,
  accuracy: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalQuizzes: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  badges: [],
  history: [],
  lastDailyChallenge: null,
};

const getLevelName = (level) => LEVEL_TITLES[level] || 'Galaxy Master';

const getLevelInfo = (xp) => {
  let level = 1;
  let remaining = xp;
  let threshold = 1000;

  while (remaining >= threshold) {
    remaining -= threshold;
    level += 1;
    threshold += level * 300;
  }

  return {
    level,
    levelName: getLevelName(level),
    currentXp: remaining,
    nextLevelXp: threshold,
    progress: Math.round((remaining / threshold) * 100),
  };
};

export const loadQuizProfile = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_PROFILE;
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_PROFILE;
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
    };
  } catch (error) {
    console.warn('[QuizStorage] Failed to load profile:', error);
    return DEFAULT_PROFILE;
  }
};

export const saveQuizProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn('[QuizStorage] Failed to save profile:', error);
  }
};

export const updateQuizProfile = async (updater) => {
  const profile = await loadQuizProfile();
  const updated = typeof updater === 'function' ? updater(profile) : { ...profile, ...updater };
  await saveQuizProfile(updated);
  return updated;
};

export const recordQuizResult = async ({
  category,
  score,
  total,
  xpEarned,
  isDaily,
  accuracy,
  currentStreak = 0,
  bestStreak = 0,
}) => {
  const profile = await loadQuizProfile();
  const newHistoryItem = {
    id: `${category?.id || 'unknown'}-${Date.now()}`,
    category: category?.title || 'Unknown',
    score,
    total,
    xpEarned,
    accuracy,
    completedAt: new Date().toISOString(),
  };

  const nextTotalCorrect = profile.totalCorrect + Math.round((accuracy / 100) * total);
  const nextTotalAnswered = profile.totalAnswered + total;
  const nextTotalQuizzes = profile.totalQuizzes + 1;

  const updatedProfile = {
    ...profile,
    xp: profile.xp + xpEarned,
    totalCorrect: nextTotalCorrect,
    totalAnswered: nextTotalAnswered,
    totalQuizzes: nextTotalQuizzes,
    history: [newHistoryItem, ...profile.history],
    lastDailyChallenge: isDaily ? new Date().toISOString() : profile.lastDailyChallenge,
    currentStreak,
    bestStreak: Math.max(profile.bestStreak, bestStreak),
  };

  const levelInfo = getLevelInfo(updatedProfile.xp);
  updatedProfile.level = levelInfo.level;
  updatedProfile.levelName = levelInfo.levelName;
  updatedProfile.currentXp = levelInfo.currentXp;
  updatedProfile.nextLevelXp = levelInfo.nextLevelXp;
  updatedProfile.progress = levelInfo.progress;
  updatedProfile.accuracy = nextTotalAnswered ? Math.round((nextTotalCorrect / nextTotalAnswered) * 100) : 0;

  const unlockedBadges = new Set(profile.badges || []);
  if (nextTotalQuizzes === 1) unlockedBadges.add('first_launch');
  if (isDaily) unlockedBadges.add('moon_walker');
  if (category?.title === 'ISS' && accuracy >= 80) unlockedBadges.add('iss_expert');
  if (category?.title === 'NASA Missions' && accuracy >= 80) unlockedBadges.add('nasa_enthusiast');
  if (['Solar System', 'Planets'].includes(category?.title) && accuracy >= 80) unlockedBadges.add('mars_explorer');
  if (category?.title === 'Black Holes' && accuracy >= 80) unlockedBadges.add('black_hole_hunter');
  if (updatedProfile.level >= 6 || updatedProfile.xp >= 5000) unlockedBadges.add('galaxy_master');

  updatedProfile.badges = Array.from(unlockedBadges);

  await saveQuizProfile(updatedProfile);
  return updatedProfile;
};

export const resetQuizProfile = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return DEFAULT_PROFILE;
  } catch (error) {
    console.warn('[QuizStorage] Failed to reset profile:', error);
    return DEFAULT_PROFILE;
  }
};
