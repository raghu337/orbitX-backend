import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme/theme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';

const DashboardCard = ({ title, icon, image, onPress, color = COLORS.primary, delay = 0 }) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(5, { duration: 2000 + delay, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={styles.container}
    >
      <Animated.View style={[styles.animated, animatedStyle]}>
        <GlassCard style={styles.card}>
          {image ? (
            <Image source={image} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={[styles.iconContainer, { backgroundColor: `${color}15`, borderColor: `${color}40`, borderWidth: 1, ...SHADOWS.neon, shadowColor: color }]}>
              <MaterialCommunityIcons name={icon} size={32} color={color} />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          <View style={[styles.neonLine, { backgroundColor: color, shadowColor: color }]} />
        </GlassCard>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: SPACING.lg,
  },
  animated: {
    width: '100%',
  },
  card: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  image: {
    width: 140,
    height: 140,
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  neonLine: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 3,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});

export default React.memo(DashboardCard);
