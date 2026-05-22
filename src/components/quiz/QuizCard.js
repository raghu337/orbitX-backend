import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import XPBadge from './XPBadge';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const QuizCard = ({ category, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.container}>
      <GlassCard style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: `${category.color}15`, borderColor: `${category.color}40` }]}>
          <MaterialCommunityIcons name={category.icon} size={28} color={category.color} />
          <View style={[styles.glow, { backgroundColor: category.color }]} />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.missionType}>{category.missionType.toUpperCase()}</Text>
          <Text style={styles.title}>{category.title}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="format-list-bulleted" size={12} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{category.questions}</Text>
            </View>
            <View style={styles.dot} />
            <Text style={[styles.difficulty, { color: category.color }]}>{category.difficulty}</Text>
          </View>
        </View>

        <View style={styles.rightContent}>
          <XPBadge xp={category.xp} color={category.color} />
          <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255, 255, 255, 0.2)" style={styles.arrow} />
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
  },
  glow: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    opacity: 0.1,
  },
  content: {
    flex: 1,
  },
  missionType: {
    fontFamily: FONTS.bold,
    fontSize: 8,
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: SPACING.sm,
  },
  difficulty: {
    fontFamily: FONTS.black,
    fontSize: 9,
    letterSpacing: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  arrow: {
    marginTop: 4,
  },
});

export default QuizCard;
