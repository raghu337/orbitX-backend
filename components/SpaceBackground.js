import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedStars from './AnimatedStars';
import { Theme } from '../styles/theme';

export default function SpaceBackground({ children, style }) {
  return (
    <LinearGradient
      colors={[Theme.colors.background, '#1a0b2e', Theme.colors.background]}
      style={[styles.container, style]}
    >
      <AnimatedStars />
      <View style={styles.content}>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    zIndex: 1,
  }
});
