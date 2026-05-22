import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const FactCard = ({ fact }) => {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="lightbulb-on" size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.text}>{fact}</Text>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  text: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
});

export default FactCard;
