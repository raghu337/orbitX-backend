import React from 'react';
import { StyleSheet, Text, View, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const NotificationSettingsCard = ({ 
  title, 
  description, 
  icon, 
  value, 
  onValueChange,
  color = COLORS.primary 
}) => {
  return (
    <GlassCard style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: `${color}40` }}
        thumbColor={value ? color : '#f4f3f4'}
        ios_backgroundColor="rgba(255, 255, 255, 0.1)"
        onValueChange={onValueChange}
        value={value}
      />
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default NotificationSettingsCard;
