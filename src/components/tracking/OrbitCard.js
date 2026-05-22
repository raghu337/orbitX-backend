import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const OrbitCard = ({ label, value, icon }) => {
  return (
    <GlassCard style={styles.card}>
      <MaterialCommunityIcons name={icon} size={20} color={COLORS.primary} style={styles.icon} />
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
  icon: {
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

export default OrbitCard;
