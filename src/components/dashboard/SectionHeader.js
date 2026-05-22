import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const SectionHeader = ({ title, onSeeAll }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  seeAll: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
});

export default SectionHeader;
