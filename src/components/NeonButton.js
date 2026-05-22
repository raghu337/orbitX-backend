import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS, SPACING } from '../theme/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const NeonButton = ({ title, onPress, style, textStyle }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onPress) onPress();
  };

  return (
    <AnimatedTouchable
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[styles.button, SHADOWS.neon, style, animatedStyle]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.sm,
  },
  text: {
    color: COLORS.background,
    fontSize: 16,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});

export default NeonButton;
