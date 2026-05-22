import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const ProgressTracker = ({ current, total, color = COLORS.primary }) => {
  const progress = (current / total) * 100;

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress}%`, { duration: 500 }),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Progress</Text>
        <Text style={styles.stats}>{current} / {total}</Text>
      </View>
      <View style={styles.barBackground}>
        <Animated.View style={[styles.barFill, { backgroundColor: color }, animatedStyle]}>
          <View style={styles.glow} />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  stats: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.text,
  },
  barBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default ProgressTracker;
