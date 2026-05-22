import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const XPBadge = ({ xp, color = COLORS.primary }) => {
  return (
    <View style={[styles.container, { borderColor: `${color}40` }]}>
      <MaterialCommunityIcons name="flash" size={14} color={color} />
      <Text style={[styles.text, { color }]}>{xp} XP</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  text: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    marginLeft: 2,
    letterSpacing: 0.5,
  },
});

export default XPBadge;
