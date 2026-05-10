import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { Theme } from '../styles/theme';

const { width, height } = Dimensions.get('window');
const NUM_STARS = 50;

const Star = ({ index }) => {
  const opacity = useSharedValue(Math.random() * 0.5 + 0.1);
  const scale = useSharedValue(Math.random() * 0.5 + 0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 + Math.random() * 2000 }),
        withTiming(0.1, { duration: 1000 + Math.random() * 2000 })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 2000 + Math.random() * 2000 }),
        withTiming(0.5, { duration: 2000 + Math.random() * 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const size = Math.random() * 3 + 1;
  const left = Math.random() * width;
  const top = Math.random() * height;

  return (
    <Animated.View
      style={[
        styles.star,
        { width: size, height: size, left, top },
        animatedStyle,
      ]}
    />
  );
};

export default function AnimatedStars() {
  const stars = Array.from({ length: NUM_STARS }).map((_, i) => <Star key={i} index={i} />);
  
  return <View style={styles.container} pointerEvents="none">{stars}</View>;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
});
