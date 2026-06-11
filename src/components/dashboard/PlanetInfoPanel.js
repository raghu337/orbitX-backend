import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { GlassmorphismCard } from './GlassmorphismCard';

const { width } = Dimensions.get('window');

/**
 * Planet information panel with animations
 * Displays Earth info and NASA-style metrics
 */
export const PlanetInfoPanel = ({ planet = {} }) => {
  const [isVisible, setIsVisible] = useState(true);

  const defaultPlanet = {
    name: 'Earth',
    temperature: '−88 to 58 °C',
    pressure: '101.3 kPa',
    magneticField: '30-60 µT',
    escapeVelocity: '11.2 km/s',
    rotationPeriod: '24 hours',
    distanceFromSun: '149.6M km',
    dayLength: '24 hours',
    gravity: '9.81 m/s²',
  };

  const planetData = { ...defaultPlanet, ...planet };

  return (
    <GlassmorphismCard
      style={styles.card}
      glowColor="#00e5ff"
      glowIntensity={0.6}
      borderRadius={12}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="earth"
          size={24}
          color="#00e5ff"
          style={styles.icon}
        />
        <Text style={styles.planetName}>{planetData.name}</Text>
      </View>

      <View style={styles.metricsGrid}>
        {/* Temperature */}
        <View style={styles.metricRow}>
          <View style={styles.metricIcon}>
            <MaterialCommunityIcons
              name="thermometer"
              size={16}
              color="#ff6b00"
            />
          </View>
          <View style={styles.metricInfo}>
            <Text style={styles.metricLabel}>Temperature Range</Text>
            <Text style={styles.metricValue}>{planetData.temperature}</Text>
          </View>
        </View>

        {/* Gravity */}
        <View style={styles.metricRow}>
          <View style={styles.metricIcon}>
            <MaterialCommunityIcons
              name="minus-circle"
              size={16}
              color="#00ff88"
            />
          </View>
          <View style={styles.metricInfo}>
            <Text style={styles.metricLabel}>Gravity</Text>
            <Text style={styles.metricValue}>{planetData.gravity}</Text>
          </View>
        </View>

        {/* Pressure */}
        <View style={styles.metricRow}>
          <View style={styles.metricIcon}>
            <MaterialCommunityIcons
              name="gauge"
              size={16}
              color="#00d4ff"
            />
          </View>
          <View style={styles.metricInfo}>
            <Text style={styles.metricLabel}>Atmospheric Pressure</Text>
            <Text style={styles.metricValue}>{planetData.pressure}</Text>
          </View>
        </View>

        {/* Magnetic Field */}
        <View style={styles.metricRow}>
          <View style={styles.metricIcon}>
            <MaterialCommunityIcons
              name="magnet"
              size={16}
              color="#ff00ff"
            />
          </View>
          <View style={styles.metricInfo}>
            <Text style={styles.metricLabel}>Magnetic Field</Text>
            <Text style={styles.metricValue}>{planetData.magneticField}</Text>
          </View>
        </View>

        {/* Escape Velocity */}
        <View style={styles.metricRow}>
          <View style={styles.metricIcon}>
            <MaterialCommunityIcons
              name="rocket-launch"
              size={16}
              color="#ffff00"
            />
          </View>
          <View style={styles.metricInfo}>
            <Text style={styles.metricLabel}>Escape Velocity</Text>
            <Text style={styles.metricValue}>{planetData.escapeVelocity}</Text>
          </View>
        </View>

        {/* Day Length */}
        <View style={styles.metricRow}>
          <View style={styles.metricIcon}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color="#00e5ff"
            />
          </View>
          <View style={styles.metricInfo}>
            <Text style={styles.metricLabel}>Day Length</Text>
            <Text style={styles.metricValue}>{planetData.dayLength}</Text>
          </View>
        </View>

        {/* Distance from Sun */}
        <View style={[styles.metricRow, styles.lastMetric]}>
          <View style={styles.metricIcon}>
            <MaterialCommunityIcons
              name="sun-compass"
              size={16}
              color="#ffaa00"
            />
          </View>
          <View style={styles.metricInfo}>
            <Text style={styles.metricLabel}>Distance from Sun</Text>
            <Text style={styles.metricValue}>{planetData.distanceFromSun}</Text>
          </View>
        </View>
      </View>

      {/* NASA-style footer */}
      <View style={styles.footer}>
        <View style={styles.nasaBadge}>
          <Text style={styles.nasaBadgeText}>NASA</Text>
        </View>
        <Text style={styles.nasaCitation}>Earth Observations</Text>
      </View>
    </GlassmorphismCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: 'rgba(10, 20, 40, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.2)',
  },
  icon: {
    marginRight: 10,
  },
  planetName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00e5ff',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  metricsGrid: {
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.1)',
  },
  lastMetric: {
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  metricIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#0099ff',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    color: '#00e5ff',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 229, 255, 0.2)',
  },
  nasaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#ff6b00',
    borderRadius: 4,
    marginRight: 8,
  },
  nasaBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#ff6b00',
    letterSpacing: 1,
  },
  nasaCitation: {
    fontSize: 10,
    color: '#0099ff',
    fontWeight: '500',
    fontStyle: 'italic',
  },
});
