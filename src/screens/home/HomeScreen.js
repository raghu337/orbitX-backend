import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BackgroundGradient from '../../components/BackgroundGradient';
import DashboardCard from '../../components/dashboard/DashboardCard';
import SectionHeader from '../../components/dashboard/SectionHeader';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../theme/theme';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  const features = [
    { id: '1', title: 'AI Space Tutor', icon: 'robot-outline', color: COLORS.warning },
    { id: '2', title: 'Live Satellite Tracker', icon: 'satellite-variant', color: COLORS.primary },
    { id: '3', title: 'Planet Explorer', icon: 'earth', color: COLORS.accent },
    { id: '4', title: 'Space Facts', icon: 'book-open-page-variant', color: '#00E5FF' },
    { id: '5', title: 'Quiz Zone', icon: 'brain', color: COLORS.success },
  ];

  return (
    <BackgroundGradient>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>ORBITX DASHBOARD</Text>
            <Text style={styles.userName}>Cmdr. {user?.name || 'Explorer'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <MaterialCommunityIcons name="cog-outline" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature Grid */}
        <View style={styles.sectionHeaderWrapper}>
          <SectionHeader title="Mission Control" />
        </View>
        
        <View style={styles.grid}>
          {/* Main Top Module - Featured */}
          <View style={styles.fullWidthCardWrapper}>
            <DashboardCard
              title={features[0].title}
              icon={features[0].icon}
              color={features[0].color}
              delay={0}
              onPress={() => navigation.navigate('AIAssistant')}
            />
          </View>

          {/* 2x2 Grid for the remaining 4 modules */}
          {features?.slice(1)?.map((feature, index) => (
            <View 
              key={feature.id} 
              style={styles.cardWrapper}
            >
              <DashboardCard
                title={feature.title}
                icon={feature.icon}
                color={feature.color}
                delay={(index + 1) * 200}
                onPress={() => {
                  if (feature.title === 'Live Satellite Tracker') navigation.navigate('Tracker');
                  else if (feature.title === 'Planet Explorer') navigation.navigate('Learn', { screen: 'PlanetExplorer' });
                  else if (feature.title === 'Space Facts') navigation.navigate('Learn', { screen: 'SolarSystem' });
                  else if (feature.title === 'Quiz Zone') navigation.navigate('Quiz');
                }}
              />
            </View>
          ))}
        </View>

        {/* Padding for Bottom Navigation */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  welcomeText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    ...SHADOWS.neon,
  },
  userName: {
    fontFamily: FONTS.black,
    fontSize: 28,
    color: COLORS.text,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeaderWrapper: {
    paddingHorizontal: SPACING.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  fullWidthCardWrapper: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  cardWrapper: {
    width: '47.5%',
    marginBottom: SPACING.lg,
  },
});

export default HomeScreen;
