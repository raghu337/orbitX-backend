import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const { width } = Dimensions.get('window');

const OrbitMapPlaceholder = () => {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {/* Horizontal lines */}
        <View style={[styles.line, { top: '25%' }]} />
        <View style={[styles.line, { top: '50%' }]} />
        <View style={[styles.line, { top: '75%' }]} />
        {/* Vertical lines */}
        <View style={[styles.vLine, { left: '25%' }]} />
        <View style={[styles.vLine, { left: '50%' }]} />
        <View style={[styles.vLine, { left: '75%' }]} />
      </View>

      <View style={styles.overlay}>
        <MaterialCommunityIcons name="earth" size={100} color="rgba(0, 229, 255, 0.2)" />
        <Text style={styles.text}>Initializing Orbital Map...</Text>
      </View>

      {/* Futuristic markers */}
      <View style={[styles.marker, { top: '40%', left: '30%' }]}>
        <View style={styles.markerDot} />
      </View>
      <View style={[styles.marker, { top: '60%', left: '70%' }]}>
        <View style={[styles.markerDot, { backgroundColor: COLORS.accent }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - SPACING.lg * 2,
    height: 250,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.primary,
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: COLORS.primary,
  },
  overlay: {
    alignItems: 'center',
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.primary,
    marginTop: SPACING.md,
    letterSpacing: 2,
    opacity: 0.8,
  },
  marker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
});

export default OrbitMapPlaceholder;
