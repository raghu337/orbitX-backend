import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 42) / 2;

/**
 * PlanetCard Component
 * Displays a planet with gradient background and information
 */
const PlanetCard = ({ planet, onPress, style }) => {
  const [scaleAnim] = React.useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 40,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 3,
    }).start();
  };

  const handlePress = () => {
    handlePressOut();
    onPress?.(planet);
  };

  const scaleStyle = {
    transform: [{ scale: scaleAnim }],
  };

  return (
    <Animated.View style={[scaleStyle, style]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        style={styles.container}
      >
        <LinearGradient
          colors={[planet.color + '40', planet.glowColor + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Planet Visualization */}
          <View
            style={[
              styles.planetVisual,
              {
                backgroundColor: planet.color,
                shadowColor: planet.glowColor,
              },
            ]}
          >
            <Text style={styles.planetEmoji}>🌍</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.planetName} numberOfLines={1}>
              {planet.name}
            </Text>

            <Text style={styles.planetType}>{planet.type}</Text>

            <Text style={styles.description} numberOfLines={2}>
              {planet.shortDescription}
            </Text>

            {/* Quick Facts */}
            <View style={styles.factsContainer}>
              <View style={styles.fact}>
                <Text style={styles.factLabel}>Moons</Text>
                <Text style={styles.factValue}>{planet.moons}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.fact}>
                <Text style={styles.factLabel}>Diameter</Text>
                <Text style={styles.factValue}>{planet.diameter.split(' ')[0]}</Text>
              </View>
            </View>

            {/* Tap to Learn More */}
            <View style={styles.tapIndicator}>
              <Text style={styles.tapText}>Tap to explore</Text>
            </View>
          </View>

          {/* Glow Effect Border */}
          <View
            style={[
              styles.glowBorder,
              {
                borderColor: planet.glowColor + '60',
              },
            ]}
          />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 1.5,
    pointerEvents: 'none',
  },
  planetVisual: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  planetEmoji: {
    fontSize: 50,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  planetName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  planetType: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  factsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  fact: {
    flex: 1,
    alignItems: 'center',
  },
  factLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
    fontWeight: '500',
  },
  factValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tapIndicator: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  tapText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
});

export default PlanetCard;
