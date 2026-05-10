import React, { useEffect } from 'react';
import { TouchableWithoutFeedback, View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence, 
  withTiming,
  withDelay
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Theme } from '../styles/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Theme.spacing.lg * 2 - Theme.spacing.md) / 2;

export default function AnimatedDashboardCard({ title, icon, onPress, isLarge = false, index = 0 }) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Floating animation with a delay based on index for a staggered wave effect
    translateY.value = withDelay(
      index * 200,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 2000 }),
          withTiming(0, { duration: 2000 })
        ),
        -1,
        true
      )
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  return (
    <TouchableWithoutFeedback 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={[
        styles.container, 
        isLarge ? styles.largeContainer : styles.normalContainer,
        animatedStyle
      ]}>
        <View style={styles.glassWrapper}>
          <BlurView intensity={30} style={styles.blur} tint="dark">
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Ionicons name={icon} size={isLarge ? 48 : 36} color={Theme.colors.primary} />
              </View>
              <Text style={[styles.title, isLarge && styles.largeTitle]}>{title}</Text>
            </View>
          </BlurView>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  normalContainer: {
    width: CARD_WIDTH,
  },
  largeContainer: {
    width: '100%',
  },
  glassWrapper: {
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    borderColor: 'rgba(0, 240, 255, 0.4)', // Stronger cyan border
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    // Neon glow effect
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  blur: {
    padding: Theme.spacing.lg,
    minHeight: 130,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: Theme.spacing.md,
    // Add glow directly to the icon container
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  title: {
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: Theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  largeTitle: {
    fontSize: 22,
  }
});
