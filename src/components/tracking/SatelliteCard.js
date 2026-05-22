import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import LiveIndicator from './LiveIndicator';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const SatelliteCard = ({ satellite, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.container}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="satellite-variant" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{satellite.name}</Text>
            <Text style={styles.category}>{satellite.category}</Text>
          </View>
          <LiveIndicator />
        </View>

        <View style={styles.footer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Altitude</Text>
            <Text style={styles.statValue}>{satellite.altitude}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Velocity</Text>
            <Text style={styles.statValue}>{satellite.velocity}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.primary} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  card: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  category: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: SPACING.md,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 2,
  },
});

export default SatelliteCard;
