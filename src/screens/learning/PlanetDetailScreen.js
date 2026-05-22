import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import BackgroundGradient from '../../components/BackgroundGradient';
import GlassCard from '../../components/GlassCard';
import FactCard from '../../components/learning/FactCard';
import PlanetStatsCard from '../../components/learning/PlanetStatsCard';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const { width } = Dimensions.get('window');

const PlanetDetailScreen = ({ route, navigation }) => {
  const planet = route.params?.planet || {
    icon: 'earth',
    name: 'Unknown',
    category: 'Unknown',
    color: COLORS.primary,
    description: 'No planetary information is available.',
    facts: [],
  };

  return (
    <BackgroundGradient>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Planet Profile</Text>
          <TouchableOpacity style={styles.favButton}>
            <MaterialCommunityIcons name="heart-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { borderColor: `${planet.color}40`, backgroundColor: `${planet.color}10` }]}>
            <MaterialCommunityIcons name={planet.icon} size={100} color={planet.color} />
            <View style={[styles.glowEffect, { backgroundColor: planet.color }]} />
          </View>
          <Text style={styles.planetName}>{planet.name}</Text>
          <Text style={styles.planetCategory}>{planet.category} Planet</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planetary Stats</Text>
          <View style={styles.statsGrid}>
            <PlanetStatsCard label="Distance" value={planet.distance} icon="map-marker-distance" color={planet.color} />
            <PlanetStatsCard label="Diameter" value={planet.diameter} icon="diameter-variant" color={planet.color} />
            <PlanetStatsCard label="Gravity" value={planet.gravity} icon="weight" color={planet.color} />
            <PlanetStatsCard label="Temperature" value={planet.temperature} icon="thermometer" color={planet.color} />
            <PlanetStatsCard label="Moons" value={planet.moons} icon="moon-full" color={planet.color} />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <GlassCard style={styles.descCard}>
            <Text style={styles.descText}>{planet.description}</Text>
          </GlassCard>
        </View>

        {/* Facts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Did You Know?</Text>
          {(planet.facts || []).map((fact, index) => (
            <FactCard key={index} fact={fact} />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  favButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  heroIcon: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
  },
  glowEffect: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.1,
  },
  planetName: {
    fontFamily: FONTS.black,
    fontSize: 32,
    color: COLORS.text,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  planetCategory: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  descCard: {
    padding: SPACING.md,
  },
  descText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});

export default PlanetDetailScreen;
