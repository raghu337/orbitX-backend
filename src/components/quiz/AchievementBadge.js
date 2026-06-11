import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme/theme';
import GlassCard from '../GlassCard';

const AchievementBadge = ({ badge }) => {
  if (!badge) return null;

  return (
    <GlassCard style={styles.badgeCard}>
      <View style={[styles.iconContainer, { backgroundColor: `${badge.color}20`, borderColor: `${badge.color}40` }]}> 
        <MaterialCommunityIcons name={badge.icon} size={22} color={badge.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{badge.title}</Text>
        <Text style={styles.description}>{badge.description}</Text>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default AchievementBadge;
