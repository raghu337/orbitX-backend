import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import BackgroundGradient from '../../components/BackgroundGradient';
import GlassCard from '../../components/GlassCard';
import AchievementBadge from '../../components/quiz/AchievementBadge';
import QuizCard from '../../components/quiz/QuizCard';
import QuizStatTile from '../../components/quiz/QuizStatTile';
import { DIFFICULTY_LEVELS, QUIZ_BADGES, QUIZ_CATEGORIES } from '../../data/mockQuiz';
import { loadQuizProfile } from '../../services/quizStorage';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const { width } = Dimensions.get('window');

const DAILY_CHALLENGE = {
  id: 'daily_challenge',
  title: 'Daily Challenge',
  icon: 'calendar-star',
  questions: 10,
  difficulty: 'EXPERT',
  color: COLORS.accent,
  xp: 1500,
  missionType: 'Daily',
  requiredRank: 'Explorer',
};

const QuizHomeScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  const loadProfile = async () => {
    const data = await loadQuizProfile();
    setProfile(data);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const filteredCategories = selectedDifficulty === 'ALL'
    ? QUIZ_CATEGORIES
    : QUIZ_CATEGORIES.filter((category) => category.difficulty === selectedDifficulty);

  const handleStartMission = (category, mode = 'classic') => {
    navigation.navigate('QuizPlay', {
      category,
      mode,
      difficulty: category.difficulty,
    });
  };

  const profileReady = profile || {
    xp: 0,
    level: 1,
    levelName: 'Cadet',
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
  };

  return (
    <BackgroundGradient>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <View>
            <Text style={styles.screenTitle}>Space Quiz Command</Text>
            <Text style={styles.screenSubTitle}>Mission control for levels, streaks, badges and daily challenges.</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')} style={styles.leaderboardButton}>
            <MaterialCommunityIcons name="crown" size={20} color={COLORS.accent} />
            <Text style={styles.leaderboardButtonText}>Leaderboard</Text>
          </TouchableOpacity>
        </View>

        <GlassCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View>
              <Text style={styles.profileLabel}>Current XP</Text>
              <Text style={styles.profileValue}>{profileReady.xp.toLocaleString()}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>LEVEL {profileReady.level}</Text>
              <Text style={styles.subtleBadge}>{profileReady.levelName}</Text>
            </View>
          </View>
          <View style={styles.progressLine}>
            <View style={[styles.progressFill, { width: `${profileReady.progress}%` }]} />
          </View>
          <View style={styles.profileFooter}>
            <Text style={styles.progressLabel}>{profileReady.currentXp} XP / {profileReady.nextLevelXp} XP</Text>
            <Text style={styles.streakText}>Best streak: {profileReady.bestStreak}</Text>
          </View>
          <View style={styles.profileFooterBottom}>
            <Text style={styles.progressLabel}>Badges earned: {profileReady.badges.length}</Text>
            <Text style={styles.progressLabel}>Accuracy: {profileReady.accuracy}%</Text>
          </View>
        </GlassCard>

        <View style={styles.statsRow}>
          <QuizStatTile label="Quizzes" value={profileReady.totalQuizzes} accent={COLORS.primary} />
          <QuizStatTile label="Correct" value={profileReady.totalCorrect} accent={COLORS.success} />
          <QuizStatTile label="Accuracy" value={profileReady.totalAnswered ? `${Math.round((profileReady.totalCorrect / profileReady.totalAnswered) * 100)}%` : '0%'} accent={COLORS.accent} />
        </View>

        <View style={styles.filterRow}>
          {DIFFICULTY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.key}
              style={[
                styles.filterPill,
                selectedDifficulty === level.key && styles.filterPillActive,
              ]}
              onPress={() => setSelectedDifficulty(level.key)}
            >
              <Text style={[styles.filterLabel, selectedDifficulty === level.key && styles.filterLabelActive]}>{level.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.dailyCard} activeOpacity={0.95} onPress={() => handleStartMission(DAILY_CHALLENGE, 'daily')}>
          <View style={styles.dailyLeft}>
            <MaterialCommunityIcons name="calendar-star" size={26} color={COLORS.accent} />
            <View style={styles.dailyTextBlock}>
              <Text style={styles.dailyTitle}>Daily Challenge</Text>
              <Text style={styles.dailySubtitle}>New mission every day with bonus XP rewards.</Text>
            </View>
          </View>
          <Text style={styles.dailyBadge}>+{DAILY_CHALLENGE.xp} XP</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Mission Directory</Text>
          <Text style={styles.sectionHint}>Tap a category to begin your next expedition.</Text>
        </View>

        {filteredCategories.map((category) => (
          <QuizCard
            key={category.id}
            category={category}
            onPress={() => handleStartMission(category)}
          />
        ))}

        <View style={styles.achievementHeader}>
          <Text style={styles.sectionTitle}>Achievement Badges</Text>
          <Text style={styles.sectionHint}>Earn badges as your rank climbs.</Text>
        </View>

        {QUIZ_BADGES.slice(0, 3).map((badge) => (
          <AchievementBadge
            key={badge.id}
            badge={{
              ...badge,
              description: profileReady.badges.includes(badge.id) ? badge.description : `Unlock by ${badge.description.toLowerCase()}`,
            }}
          />
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    padding: SPACING.lg,
    paddingBottom: 80,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  screenTitle: {
    fontFamily: FONTS.black,
    fontSize: 28,
    color: COLORS.text,
    marginBottom: 8,
  },
  screenSubTitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    maxWidth: width * 0.6,
  },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.18)',
  },
  leaderboardButtonText: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  profileCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  profileLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  profileValue: {
    fontFamily: FONTS.black,
    fontSize: 32,
    color: COLORS.text,
    marginTop: 6,
  },
  levelBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.14)',
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  levelText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.success,
    letterSpacing: 1.5,
  },
  progressLine: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  profileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileFooterBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  subtleBadge: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  streakText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
  },
  filterPill: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  filterPillActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.16)',
    borderColor: COLORS.primary,
  },
  filterLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  filterLabelActive: {
    color: COLORS.primary,
  },
  dailyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 0, 229, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 229, 0.15)',
  },
  dailyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dailyTextBlock: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  dailyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  dailySubtitle: {
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  dailyBadge: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  sectionHeading: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.black,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionHint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  achievementHeader: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
});

export default QuizHomeScreen;
