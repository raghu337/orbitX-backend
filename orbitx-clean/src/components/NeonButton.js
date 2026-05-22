import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../theme/theme';

const NeonButton = ({ title, onPress, style }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.button, SHADOWS.neon, style]}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
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
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});

export default NeonButton;
