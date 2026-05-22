import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const PlanetStatsCard = ({ label, value, icon, color = COLORS.primary }) => {
  return (
    <GlassCard style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    width: '48%',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
    marginTop: 2,
  },
});

export default PlanetStatsCard;
