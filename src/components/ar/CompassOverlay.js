import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const CompassOverlay = ({ heading = 0 }) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const currentDir = directions[Math.round(heading / 45) % 8];

  return (
    <View style={styles.container}>
      <View style={styles.compassRing}>
        <View style={[styles.indicator, { transform: [{ rotate: `${heading}deg` }] }]}>
          <MaterialCommunityIcons name="navigation" size={24} color={COLORS.primary} />
        </View>
      </View>
      <View style={styles.dataContainer}>
        <Text style={styles.headingText}>{Math.round(heading)}°</Text>
        <Text style={styles.dirText}>{currentDir}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    right: SPACING.lg,
    alignItems: 'center',
  },
  compassRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  headingText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
  },
  dirText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
  },
});

export default CompassOverlay;
