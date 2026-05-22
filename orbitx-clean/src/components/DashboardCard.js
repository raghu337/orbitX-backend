import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import { COLORS, SHADOWS, SPACING } from '../theme/theme';

const DashboardCard = ({ title, icon, color = COLORS.primary, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
    >
      <GlassCard style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15`, borderColor: `${color}40`, borderWidth: 1, ...SHADOWS.neon, shadowColor: color }]}>
          <MaterialCommunityIcons name={icon} size={32} color={color} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.neonLine, { backgroundColor: color, shadowColor: color }]} />
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '47.5%',
    marginBottom: SPACING.lg,
  },
  card: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  neonLine: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 3,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});

export default DashboardCard;
