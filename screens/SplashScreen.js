import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated';
import { Theme } from '../styles/theme';
import SpaceBackground from '../components/SpaceBackground';
import FloatingElement from '../components/FloatingElement';

export default function SplashScreen({ navigation }) {
  const glowOpacity = useSharedValue(0.3);
  const scale = useSharedValue(0.9);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      true
    );

    scale.value = withTiming(1, { duration: 1500 });
    textOpacity.value = withTiming(1, { duration: 2000 });

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <SpaceBackground style={styles.container}>
      <FloatingElement floatDistance={10} duration={4000}>
        <Animated.View style={[styles.logoContainer, animatedStyle]}>
          <Animated.View style={[styles.glow, glowStyle]} />
          <Text style={styles.title}>ORBITX</Text>
          <Animated.Text style={[styles.subtitle, textStyle]}>
            Explore the Cosmos
          </Animated.Text>
        </Animated.View>
      </FloatingElement>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 250,
    height: 250,
    backgroundColor: Theme.colors.primary,
    borderRadius: 125,
    transform: [{ scale: 1.5 }],
    filter: [{ blur: 80 }],
  },
  title: {
    fontFamily: Theme.fonts.black,
    fontSize: 56,
    color: '#FFFFFF',
    letterSpacing: 10,
    textShadowColor: Theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  subtitle: {
    fontFamily: Theme.fonts.medium,
    fontSize: 18,
    color: Theme.colors.primary,
    marginTop: Theme.spacing.md,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
});
