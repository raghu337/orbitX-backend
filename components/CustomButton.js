import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Theme } from '../styles/theme';

export default function CustomButton({ title, onPress, style, textStyle, outline = false }) {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        outline ? styles.outlineButton : styles.primaryButton,
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.text,
        outline ? styles.outlineText : styles.primaryText,
        textStyle
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: Theme.colors.primary,
    borderWidth: 1,
  },
  text: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    letterSpacing: 1,
  },
  primaryText: {
    color: '#000000',
  },
  outlineText: {
    color: Theme.colors.primary,
  },
});
