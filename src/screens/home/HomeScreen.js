import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

// Premium interactive glassmorphic button component
const HUDCard = ({ title, subtitle, icon, color, onPress }) => {
  const [scale] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, styles.hudCardContainer]}>
      <TouchableOpacity
        style={styles.hudCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
      >
        <View style={styles.cardGlowOverlay} />
        <View style={[styles.iconFrame, { borderColor: `${color}40`, backgroundColor: `${color}10` }]}>
          <MaterialCommunityIcons name={icon} size={28} color={color} />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255, 255, 255, 0.3)" style={styles.arrow} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main HomeScreen
const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  if (navigation && !navigation.openDrawer) {
    const { openDrawer } = require('../../navigation/RootNavigation');
    navigation.openDrawer = openDrawer;
  }

  return (
    <LinearGradient
      colors={[COLORS.background, '#0C0A24', '#040714']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Dynamic ambient background orbs */}
      <View style={styles.glowOrb1} />
      <View style={styles.glowOrb2} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome HUD Header */}
          <View style={styles.hudHeader}>
            <View style={{ zIndex: 999, elevation: 10, padding: 10 }}>
              <TouchableOpacity
                style={styles.burgerButton}
                onPress={() => navigation.openDrawer()}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="menu" size={26} color="#00E5FF" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, marginLeft: SPACING.md, marginRight: SPACING.sm }}>
              <Text style={styles.systemTag}>ORBITX MISSION CONTROL</Text>
              <Text style={styles.commanderText} numberOfLines={1} adjustsFontSizeToFit>Cmdr. {user?.name || 'Explorer'}</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate('SearchScreen')}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="magnify" size={26} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="account-circle-outline" size={26} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats Panel */}
          <View style={styles.statsPanel}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>ORBIT STATUS</Text>
              <Text style={[styles.statValue, { color: COLORS.success }]}>STABLE</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>SYS LINK</Text>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>ACTIVE</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>ALTITUDE</Text>
              <Text style={styles.statValue}>408 KM</Text>
            </View>
          </View>

          {/* Featured AI Card */}
          <Text style={styles.sectionHeader}>PRIMARY INTERFACE</Text>
          <HUDCard
            title="AI Space Tutor"
            subtitle="Engage real-time Groq LLM space instruction"
            icon="robot-outline"
            color={COLORS.warning}
            onPress={() => navigation.navigate('SpaceChat')}
          />

          {/* Grid of Main Modules */}
          <Text style={styles.sectionHeader}>COSMIC MODULES</Text>
          <View style={styles.moduleGrid}>
            <View style={styles.gridRow}>
              <TouchableOpacity
                style={[styles.gridCard, { borderColor: 'rgba(0, 229, 255, 0.2)' }]}
                onPress={() => navigation.navigate('LiveTracking')}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIconFrame, { backgroundColor: 'rgba(0, 229, 255, 0.08)' }]}>
                  <MaterialCommunityIcons name="satellite-variant" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.gridCardTitle}>Satellite Tracker</Text>
                <Text style={styles.gridCardDesc}>Track 100+ active spacecraft</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.gridCard, { borderColor: 'rgba(255, 0, 229, 0.2)' }]}
                onPress={() => navigation.navigate('SolarSystem3D')}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIconFrame, { backgroundColor: 'rgba(255, 0, 229, 0.08)' }]}>
                  <MaterialCommunityIcons name="earth" size={24} color={COLORS.accent} />
                </View>
                <Text style={styles.gridCardTitle}>Planet Explorer</Text>
                <Text style={styles.gridCardDesc}>3D interactive solar system</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.gridRow}>
              <TouchableOpacity
                style={[styles.gridCard, { borderColor: 'rgba(255, 184, 0, 0.2)', width: '100%' }]}
                onPress={() => navigation.navigate('QuizZone')}
                activeOpacity={0.8}
              >
                <View style={[styles.gridIconFrame, { backgroundColor: 'rgba(255, 184, 0, 0.08)' }]}>
                  <MaterialCommunityIcons name="brain" size={24} color={COLORS.warning} />
                </View>
                <Text style={styles.gridCardTitle}>Quiz Zone</Text>
                <Text style={styles.gridCardDesc}>Test your space navigation knowledge</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Secondary Shortcuts (NASA APOD) */}
          <Text style={styles.sectionHeader}>STELLAR SHORTCUTS</Text>
          <View style={styles.shortcutsRow}>
            <TouchableOpacity
              style={styles.shortcutCard}
              onPress={() => navigation.navigate('NasaApod')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="image-outline" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
              <Text style={styles.shortcutText}>NASA Astronomy Picture of the Day</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="rgba(255, 255, 255, 0.3)" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>

          {/* Spacing for Bottom Tab Bar */}
          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// ─── Premium Dashboard Styles ──────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 45 },

  // Glowing ambient space orbs
  glowOrb1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    filter: 'blur(60px)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: 100,
    left: -120,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 0, 229, 0.05)',
    filter: 'blur(80px)',
  },

  // Header HUD
  hudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  systemTag: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 2.2,
  },
  commanderText: {
    fontFamily: FONTS.black,
    fontSize: 26,
    color: COLORS.text,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 25, 45, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  burgerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 25, 45, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },

  // Stats Dashboard Panel
  statsPanel: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 25, 45, 0.55)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xl,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  sectionHeader: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },

  // HUD Horizontal card
  hudCardContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 18,
    overflow: 'hidden',
  },
  hudCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 25, 45, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.2)',
    padding: SPACING.md + 2,
    borderRadius: 18,
    position: 'relative',
  },
  cardGlowOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 184, 0, 0.01)',
  },
  iconFrame: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  arrow: {
    marginLeft: SPACING.sm,
  },

  // Module Grid
  moduleGrid: {
    paddingHorizontal: SPACING.lg - 4,
    marginBottom: SPACING.lg,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  gridCard: {
    width: '48%',
    backgroundColor: 'rgba(20, 25, 45, 0.55)',
    borderWidth: 1,
    borderRadius: 18,
    padding: SPACING.md,
    alignItems: 'flex-start',
  },
  gridIconFrame: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  gridCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  gridCardDesc: {
    fontFamily: FONTS.regular,
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 14,
  },

  // Shortcuts
  shortcutsRow: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  shortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 25, 45, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  shortcutText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.text,
  },
});

export default HomeScreen;
