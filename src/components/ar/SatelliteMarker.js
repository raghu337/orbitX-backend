import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../../theme/theme';

const SatelliteMarker = ({ name, x, y, visible = true }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.6, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: visible ? opacity.value : 0,
    left: x,
    top: y,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.reticle}>
        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />
        <MaterialCommunityIcons name="satellite-variant" size={20} color={COLORS.primary} />
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>{name}</Text>
        <View style={styles.labelLine} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: COLORS.primary,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.primary,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 8,
    height: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: COLORS.primary,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.primary,
  },
  labelContainer: {
    position: 'absolute',
    top: 45,
    alignItems: 'center',
  },
  labelText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.primary,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  labelLine: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(0, 229, 255, 0.5)',
  },
});

export default SatelliteMarker;
