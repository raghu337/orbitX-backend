import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
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

const NeonButton = ({ title, onPress, style, textStyle, disabled = false, loading = false }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isBtnDisabled = disabled || loading;

  const handlePressIn = () => {
    if (isBtnDisabled) return;
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    if (isBtnDisabled) return;
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (isBtnDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onPress) onPress();
  };

  return (
    <AnimatedTouchable
      activeOpacity={isBtnDisabled ? 1 : 0.8}
      disabled={isBtnDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.button,
        isBtnDisabled ? styles.disabledButton : SHADOWS.neon,
        style,
        animatedStyle
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.background} />
      ) : (
        <Text style={[styles.text, isBtnDisabled && styles.disabledText, textStyle]}>{title}</Text>
      )}
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
  disabledButton: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  text: {
    color: COLORS.background,
    fontSize: 16,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  disabledText: {
    color: 'rgba(0, 229, 255, 0.6)',
  },
});

export default NeonButton;
