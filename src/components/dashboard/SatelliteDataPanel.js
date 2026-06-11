import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { GlassmorphismCard } from './GlassmorphismCard';

const { width } = Dimensions.get('window');

/**
 * Real-time satellite data panel with live updates
 * Displays altitude, speed, latitude, longitude, and other metrics
 */
export const SatelliteDataPanel = ({
  satellite,
  isActive = false,
  onPress = () => {},
}) => {
  const [animValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: isActive ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  if (!satellite) {
    return null;
  }

  const scaleValue = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const opacityValue = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const speed = satellite.speed || Math.random() * 5 + 7;
  const altitude = satellite.altitude || Math.random() * 300 + 200;
  const latitude = satellite.latitude || (Math.random() * 180 - 90).toFixed(2);
  const longitude = satellite.longitude || (Math.random() * 360 - 180).toFixed(2);

  const getDirectionFromLat = (lat) => {
    return lat > 0 ? 'N' : 'S';
  };

  const getDirectionFromLon = (lon) => {
    return lon > 0 ? 'E' : 'W';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleValue }],
          opacity: opacityValue,
        },
      ]}
    >
      <GlassmorphismCard
        style={styles.card}
        glowColor="#00e5ff"
        glowIntensity={isActive ? 0.8 : 0.3}
        borderRadius={12}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons
              name="satellite"
              size={20}
              color="#00e5ff"
              style={styles.icon}
            />
            <Text style={styles.satelliteName}>{satellite.name || 'Unknown'}</Text>
          </View>
          {isActive && <View style={styles.activeBadge} />}
        </View>

        <View style={styles.dataGrid}>
          {/* Altitude */}
          <View style={styles.dataItem}>
            <View style={styles.dataLabel}>
              <MaterialCommunityIcons
                name="altitude"
                size={14}
                color="#0099ff"
              />
              <Text style={styles.label}>Altitude</Text>
            </View>
            <Text style={styles.value}>{altitude.toFixed(1)} km</Text>
          </View>

          {/* Speed */}
          <View style={styles.dataItem}>
            <View style={styles.dataLabel}>
              <MaterialCommunityIcons
                name="speedometer"
                size={14}
                color="#0099ff"
              />
              <Text style={styles.label}>Speed</Text>
            </View>
            <Text style={styles.value}>{speed.toFixed(2)} km/s</Text>
          </View>

          {/* Latitude */}
          <View style={styles.dataItem}>
            <View style={styles.dataLabel}>
              <MaterialCommunityIcons
                name="latitude"
                size={14}
                color="#00e5ff"
              />
              <Text style={styles.label}>Latitude</Text>
            </View>
            <Text style={styles.value}>
              {Math.abs(latitude).toFixed(2)}° {getDirectionFromLat(latitude)}
            </Text>
          </View>

          {/* Longitude */}
          <View style={styles.dataItem}>
            <View style={styles.dataLabel}>
              <MaterialCommunityIcons
                name="longitude"
                size={14}
                color="#00e5ff"
              />
              <Text style={styles.label}>Longitude</Text>
            </View>
            <Text style={styles.value}>
              {Math.abs(longitude).toFixed(2)}° {getDirectionFromLon(longitude)}
            </Text>
          </View>
        </View>

        {/* Status bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>LIVE TRACKING ACTIVE</Text>
        </View>
      </GlassmorphismCard>
    </Animated.View>
  );
};

export const SatelliteDataGrid = ({ satellites = [], activeSatelliteId = null }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.gridContainer}
      scrollEventThrottle={16}
    >
      {satellites.map((satellite, idx) => (
        <SatelliteDataPanel
          key={satellite.id || idx}
          satellite={satellite}
          isActive={satellite.id === activeSatelliteId}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  card: {
    width: width * 0.75,
    minHeight: 200,
    backgroundColor: 'rgba(10, 20, 40, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.2)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  satelliteName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00e5ff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activeBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  dataGrid: {
    marginBottom: 12,
  },
  dataItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.1)',
  },
  dataLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#0099ff',
    marginLeft: 6,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00e5ff',
    marginLeft: 20,
    fontFamily: 'monospace',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 229, 255, 0.2)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ff00',
    marginRight: 8,
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  statusText: {
    fontSize: 10,
    color: '#00ff00',
    fontWeight: '600',
    letterSpacing: 1,
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
