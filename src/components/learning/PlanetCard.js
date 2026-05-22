import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const { width } = Dimensions.get('window');

const PlanetCard = ({ planet, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.container}>
      <GlassCard style={styles.card}>
        <View style={styles.planetIconContainer}>
          <MaterialCommunityIcons name={planet.icon} size={40} color={planet.color} />
          <View style={[styles.planetGlow, { backgroundColor: planet.color }]} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{planet.name}</Text>
          <Text style={styles.category}>{planet.category}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="ruler" size={12} color={COLORS.primary} />
              <Text style={styles.statText}>{planet.diameter}</Text>
            </View>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="thermometer" size={12} color={COLORS.primary} />
              <Text style={styles.statText}>{planet.temperature.split(' ')[0]}</Text>
            </View>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.primary} />
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  planetIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  planetGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.1,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  category: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  statText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
});

export default PlanetCard;
