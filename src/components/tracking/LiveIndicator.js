import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming 
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const LiveIndicator = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(withTiming(2, { duration: 1500 }), -1, false);
    opacity.value = withRepeat(withTiming(0, { duration: 1500 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pulse, animatedStyle]} />
      <View style={styles.dot} />
      <Text style={styles.text}>LIVE</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  pulse: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  text: {
    marginLeft: SPACING.sm,
    color: COLORS.success,
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
});

export default LiveIndicator;
