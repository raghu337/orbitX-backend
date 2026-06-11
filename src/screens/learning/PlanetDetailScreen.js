import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import {
    Animated,
    Dimensions,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getPlanetById } from '../../data/planetsData';

const { width, height } = Dimensions.get('window');

/**
 * PlanetDetailScreen - Professional NASA-style planet details
 */
const PlanetDetailScreen = ({ route, navigation }) => {
  const planetId = route.params?.planetId || route.params?.planet?.id;
  const planet = getPlanetById(planetId);
  const [scrollY] = React.useState(new Animated.Value(0));
  const [fadeAnim] = React.useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!planet) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Planet not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#00D9FF" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#00D9FF" />
        </TouchableOpacity>
        <Animated.Text
          style={[
            styles.headerTitle,
            {
              opacity: headerOpacity,
            },
          ]}
        >
          {planet.name}
        </Animated.Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Hero Section */}
          <LinearGradient
            colors={[planet.color + '30', planet.glowColor + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSection}
          >
            <View
              style={[
                styles.heroImage,
                {
                  backgroundColor: planet.color,
                  shadowColor: planet.glowColor,
                },
              ]}
            >
              <Text style={styles.heroEmoji}>🌍</Text>
            </View>
            <Text style={styles.heroTitle}>{planet.name}</Text>
            <Text style={styles.heroSubtitle}>{planet.type}</Text>
            <Text style={styles.heroDescription}>{planet.description}</Text>
          </LinearGradient>

          {/* Quick Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Overview</Text>
            <View style={styles.overviewGrid}>
              <OverviewCard
                label="Distance from Sun"
                value={planet.distanceFromSun}
              />
              <OverviewCard label="Diameter" value={planet.diameter} />
              <OverviewCard label="Moons" value={planet.moons.toString()} />
              <OverviewCard label="Type" value={planet.type} />
              <OverviewCard label="Day Length" value={planet.dayLength} />
              <OverviewCard label="Year Length" value={planet.yearLength} />
              <OverviewCard label="Surface Gravity" value={planet.gravity} />
              <OverviewCard
                label="Surface Temp"
                value={`${planet.temperature.min}°C - ${planet.temperature.max}°C`}
              />
            </View>
          </View>

          {/* Atmosphere Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Atmosphere</Text>
            <LinearGradient
              colors={['rgba(100, 150, 255, 0.15)', 'rgba(0, 217, 255, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.atmosphereCard}
            >
              <Text style={styles.atmosphereText}>{planet.atmosphere}</Text>
            </LinearGradient>
          </View>

          {/* Detailed Facts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detailed Facts</Text>
            <View style={styles.factsTable}>
              <FactRow
                label="Rotation Period"
                value={planet.facts.rotationPeriod}
              />
              <FactRow
                label="Revolution Period"
                value={planet.facts.revolutionPeriod}
              />
              <FactRow label="Mass" value={planet.facts.mass} />
              <FactRow label="Volume" value={planet.facts.volume} />
              <FactRow label="Density" value={planet.facts.density} />
              <FactRow label="Surface Type" value={planet.facts.surface} />
              <FactRow
                label="Rings"
                value={planet.facts.ringsCount > 0 ? `${planet.facts.ringsCount} rings` : 'None'}
              />
              <FactRow label="Composition" value={planet.facts.composition} />
            </View>
          </View>

          {/* Fun Facts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Did You Know?</Text>
            {planet.funFacts.map((fact, index) => (
              <View key={index} style={styles.funFactCard}>
                <View style={styles.funFactNumber}>
                  <Text style={styles.funFactNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.funFactText}>{fact}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const OverviewCard = ({ label, value }) => (
  <LinearGradient
    colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.overviewCard}
  >
    <Text style={styles.overviewLabel}>{label}</Text>
    <Text style={styles.overviewValue}>{value}</Text>
  </LinearGradient>
);

const FactRow = ({ label, value }) => (
  <View style={styles.factRow}>
    <Text style={styles.factLabel}>{label}</Text>
    <Text style={styles.factValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 217, 255, 0.1)',
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  heroSection: {
    margin: 16,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.2)',
  },
  heroImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 10,
  },
  heroEmoji: {
    fontSize: 80,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(0, 217, 255, 0.8)',
    marginBottom: 16,
    fontWeight: '600',
  },
  heroDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.2)',
  },
  overviewLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 6,
    fontWeight: '600',
  },
  overviewValue: {
    fontSize: 13,
    color: '#00D9FF',
    fontWeight: '700',
  },
  atmosphereCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.2)',
  },
  atmosphereText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
    fontWeight: '500',
  },
  factsTable: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.15)',
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 217, 255, 0.1)',
    backgroundColor: 'rgba(0, 217, 255, 0.05)',
  },
  factLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    flex: 1,
  },
  factValue: {
    fontSize: 12,
    color: '#00D9FF',
    fontWeight: '700',
    textAlign: 'right',
  },
  funFactCard: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 217, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.15)',
    alignItems: 'flex-start',
  },
  funFactNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 217, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  funFactNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00D9FF',
  },
  funFactText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PlanetDetailScreen;
