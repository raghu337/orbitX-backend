import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../theme/theme';

const OrbitPlanet = ({ size, orbitSize, duration, color, icon = 'circle' }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedOrbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedPlanetStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `-${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.orbit, { width: orbitSize, height: orbitSize, borderRadius: orbitSize / 2 }, animatedOrbitStyle]}>
      <Animated.View style={[styles.planetContainer, { top: -size / 2 }, animatedPlanetStyle]}>
        <MaterialCommunityIcons name={icon} size={size} color={color} />
        <View style={[styles.glow, { width: size * 1.5, height: size * 1.5, borderRadius: size * 0.75, backgroundColor: color }]} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  orbit: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    opacity: 0.2,
  },
});

export default OrbitPlanet;
