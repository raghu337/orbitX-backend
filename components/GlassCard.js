import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Theme } from '../styles/theme';

export default function GlassCard({ children, style, intensity = 30 }) {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} style={styles.blur} tint="dark">
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    borderColor: 'rgba(0, 240, 255, 0.2)',
    borderWidth: 1,
    backgroundColor: 'rgba(11, 13, 23, 0.3)', // Deep space tint
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  blur: {
    flex: 1,
  },
  content: {
    padding: Theme.spacing.lg,
    flex: 1,
  }
});
