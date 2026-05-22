import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const AnswerOption = ({ 
  text, 
  onPress, 
  isSelected, 
  isCorrect, 
  isWrong,
  disabled 
}) => {
  let borderColor = 'rgba(255, 255, 255, 0.1)';
  let backgroundColor = 'rgba(255, 255, 255, 0.03)';
  let iconName = null;

  if (isCorrect) {
    borderColor = COLORS.success;
    backgroundColor = `${COLORS.success}15`;
    iconName = 'check-circle';
  } else if (isWrong) {
    borderColor = COLORS.error;
    backgroundColor = `${COLORS.error}15`;
    iconName = 'close-circle';
  } else if (isSelected) {
    borderColor = COLORS.primary;
    backgroundColor = `${COLORS.primary}15`;
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress} 
      disabled={disabled}
      style={styles.container}
    >
      <View style={[styles.card, { borderColor, backgroundColor }]}>
        <Text style={[styles.text, isSelected && styles.selectedText]}>{text}</Text>
        {iconName ? (
          <MaterialCommunityIcons 
            name={iconName} 
            size={20} 
            color={isCorrect ? COLORS.success : COLORS.error} 
          />
        ) : (
          <View style={[styles.dot, isSelected && { backgroundColor: COLORS.primary }]} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  selectedText: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default AnswerOption;
