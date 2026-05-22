import React, { useEffect, useRef, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  ScrollView 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BackgroundGradient from '../../components/BackgroundGradient';
import GlassCard from '../../components/GlassCard';
import NeonButton from '../../components/NeonButton';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const { width } = Dimensions.get('window');

const QuizResultScreen = ({ route, navigation }) => {
  const { score, total, category, failed } = route.params;
  const percentage = Math.round((score / total) * 100);
  const xpEarned = failed ? 0 : Math.round((score / total) * category.xp);

  // Category specific titles
  const getAchievement = () => {
    if (failed) return 'Mission Scrubbed';
    if (percentage < 50) return 'Space Cadet';
    
    switch (category.title) {
      case 'Planetary Science': return 'Planet Explorer';
      case 'Satellite Tech': return 'Orbit Master';
      case 'Deep Space': return 'Galaxy Hunter';
      case 'Astrophysics': return 'Quantum Genius';
      default: return 'Star Voyager';
    }
  };

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const xpCount = useRef(new Animated.Value(0)).current;

  const [displayXp, setDisplayXp] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(xpCount, { toValue: xpEarned, duration: 2000, useNativeDriver: false }),
    ]).start();

    const listener = xpCount.addListener(({ value }) => {
      setDisplayXp(Math.floor(value));
    });
    return () => xpCount.removeListener(listener);
  }, [xpEarned]);

  return (
    <BackgroundGradient>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
          
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons 
              name={failed ? "alert-octagon" : "check-decagram"} 
              size={80} 
              color={failed ? COLORS.error : category.color} 
            />
            <View style={[styles.glow, { backgroundColor: failed ? COLORS.error : category.color }]} />
          </View>

          <Text style={[styles.statusText, { color: failed ? COLORS.error : category.color }]}>
            {failed ? 'MISSION FAILED' : 'MISSION COMPLETE'}
          </Text>
          
          <Text style={styles.title}>
            {getAchievement()}
          </Text>

          <GlassCard style={styles.resultCard}>
            <View style={styles.statGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{score}/{total}</Text>
                <Text style={styles.statLabel}>DATA POINTS</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{percentage}%</Text>
                <Text style={styles.statLabel}>ACCURACY</Text>
              </View>
            </View>

            <View style={styles.xpBreakdown}>
              <View style={styles.xpRow}>
                <Text style={styles.xpText}>TOTAL XP EARNED</Text>
                <View style={[styles.xpBadge, { borderColor: `${category.color}40` }]}>
                  <Text style={[styles.xpNumber, { color: category.color }]}>+{displayXp}</Text>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: failed ? COLORS.error : category.color }]} />
              </View>
            </View>
          </GlassCard>

          <View style={styles.bonusSection}>
            <Text style={styles.bonusTitle}>MISSION LOG</Text>
            <View style={styles.logItem}>
              <MaterialCommunityIcons name="star-circle" size={16} color="#FFB800" />
              <Text style={styles.logText}>
                {percentage === 100 ? 'Perfect synchronization reward applied.' : 'Standard coordinate data logged.'}
              </Text>
            </View>
            <View style={styles.logItem}>
              <MaterialCommunityIcons name="trending-up" size={16} color={category.color} />
              <Text style={styles.logText}>Experience points synced with profile.</Text>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <NeonButton 
              title="RETURN TO COMMAND" 
              onPress={() => navigation.navigate('QuizHome')}
              style={[styles.primaryButton, { backgroundColor: category.color }]}
            />
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => navigation.replace('QuizPlay', { category })}
            >
              <Text style={[styles.retryText, { color: category.color }]}>RE-LAUNCH MISSION</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 80,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 50,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.15,
  },
  statusText: {
    fontFamily: FONTS.black,
    fontSize: 12,
    letterSpacing: 4,
    marginBottom: 8,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  resultCard: {
    width: '100%',
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FONTS.black,
    fontSize: 28,
    color: COLORS.text,
  },
  statLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  xpBreakdown: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: SPACING.md,
    borderRadius: 12,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  xpText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  xpBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  xpNumber: {
    fontFamily: FONTS.black,
    fontSize: 16,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  bonusSection: {
    width: '100%',
    marginBottom: SPACING.xxl,
  },
  bonusTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.text,
    letterSpacing: 2,
    marginBottom: SPACING.md,
    opacity: 0.6,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  logText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 10,
  },
  buttonGroup: {
    width: '100%',
  },
  primaryButton: {
    marginBottom: SPACING.md,
  },
  retryButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  retryText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    letterSpacing: 1,
  },
});

export default QuizResultScreen;
