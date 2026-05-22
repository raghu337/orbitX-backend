import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { SPACING } from '../theme/theme';

const GlassCard = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={30} tint="dark" style={styles.blur}>
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  blur: {
    padding: SPACING.lg,
  },
  content: {
    // Basic content style
  },
});

export default GlassCard;
