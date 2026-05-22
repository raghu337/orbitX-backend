import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackgroundGradient from '../../components/BackgroundGradient';
import OrbitPlanet from '../../components/learning/OrbitPlanet';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

const SolarSystemScreen = ({ navigation }) => {
  const planets = [
    { name: 'Mercury', orbitSize: 100, size: 8, duration: 3000, color: '#A5A5A5' },
    { name: 'Venus', orbitSize: 140, size: 12, duration: 5000, color: '#E3BB76' },
    { name: 'Earth', orbitSize: 180, size: 14, duration: 7000, color: '#00E5FF' },
    { name: 'Mars', orbitSize: 220, size: 12, duration: 9000, color: '#FF4B4B' },
    { name: 'Jupiter', orbitSize: 280, size: 24, duration: 15000, color: '#FFA726' },
    { name: 'Saturn', orbitSize: 340, size: 20, duration: 18000, color: '#F4D03F' },
  ];

  return (
    <BackgroundGradient>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Solar System</Text>
            <Text style={styles.subtitle}>Interactive Visualization</Text>
          </View>
        </View>

        {/* Interactive Visualization */}
        <View style={styles.vizContainer}>
          {/* Sun */}
          <View style={styles.sunContainer}>
            <View style={styles.sunGlow} />
            <MaterialCommunityIcons name="sun-variant" size={50} color="#FFD700" />
          </View>

          {/* Planets */}
          {(planets || []).map((planet, index) => (
            <OrbitPlanet
              key={index}
              size={planet.size}
              orbitSize={planet.orbitSize}
              duration={planet.duration}
              color={planet.color}
            />
          ))}

          {/* Controls Overlay */}
          <View style={styles.controls}>
            <Text style={styles.controlText}>Pinch to Zoom • Tap Planet to Explore</Text>
          </View>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SIMULATING REAL-TIME ORBITAL MECHANICS</Text>
        </View>
      </View>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.text,
  },
  vizContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  sunGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  footer: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  footerText: {
    fontFamily: FONTS.bold,
    fontSize: 8,
    color: COLORS.primary,
    letterSpacing: 2,
  },
});

export default SolarSystemScreen;
