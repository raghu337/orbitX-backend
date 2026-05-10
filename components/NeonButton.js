import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated';
import { Theme } from '../styles/theme';

export default function NeonButton({ title, onPress, style, textStyle, outline = false }) {
  const glowOpacity = useSharedValue(0.5);

  React.useEffect(() => {
    if (!outline) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500 }),
          withTiming(0.4, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [outline]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, style]}>
      {!outline && (
        <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none" />
      )}
      <Animated.View style={[{ width: '100%' }]}>
        <TouchableOpacity 
          style={[
            styles.button, 
            outline ? styles.outlineButton : styles.primaryButton,
          ]} 
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.text,
            outline ? styles.outlineText : styles.primaryText,
            textStyle
          ]}>
            {title}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
  },
  outlineButton: {
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    borderColor: Theme.colors.primary,
    borderWidth: 1,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.sm,
    transform: [{ scale: 1.1 }],
    filter: [{ blur: 10 }],
    zIndex: 0,
  },
  text: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  primaryText: {
    color: '#000000',
  },
  outlineText: {
    color: Theme.colors.primary,
    textShadowColor: Theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
