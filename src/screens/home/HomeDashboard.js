import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../theme/theme';

const features = [
  { id: '1', title: 'AI Space Tutor', icon: 'robot-outline', color: COLORS.warning, screen: 'AIAssistant' },
  { id: '2', title: 'Live Satellite Tracker', icon: 'satellite-variant', color: COLORS.primary, screen: 'SatelliteTracker' },
  { id: '3', title: 'Planet Explorer', icon: 'earth', color: COLORS.accent, screen: 'PlanetExplorer' },
  { id: '4', title: 'Space Facts', icon: 'book-open-page-variant', color: '#00E5FF', screen: 'SpaceFacts' },
  { id: '5', title: 'NASA APOD', icon: 'image-outline', color: COLORS.warning, screen: 'NASA_APOD' },
  { id: '6', title: 'APOD Favorites', icon: 'heart-multiple-outline', color: COLORS.success, screen: 'APODFavorites' },
  { id: '7', title: 'Quiz Zone', icon: 'brain', color: COLORS.success, screen: 'QuizZone' },
];

const GlassCard = ({ title, icon, color, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
      <MaterialCommunityIcons name={icon} size={32} color={color} />
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
  </TouchableOpacity>
);

const HomeDashboard = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>ORBITX</Text>
          <Text style={styles.subtitle}>DASHBOARD</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.fullWidthCardWrapper}>
            <GlassCard 
              title={features[0].title}
              icon={features[0].icon}
              color={features[0].color}
              onPress={() => navigation.navigate(features[0].screen)}
            />
          </View>

          {features?.slice(1)?.map((feature) => (
            <View key={feature.id} style={styles.cardWrapper}>
              <GlassCard 
                title={feature.title}
                icon={feature.icon}
                color={feature.color}
                onPress={() => navigation.navigate(feature.screen)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontFamily: FONTS.black,
    fontSize: 42,
    color: COLORS.primary,
    letterSpacing: 4,
    ...SHADOWS.neon,
  },
  subtitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  fullWidthCardWrapper: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  cardWrapper: {
    width: '47.5%',
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  cardTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 14,
    textAlign: 'center',
  },
});
export default HomeDashboard;
