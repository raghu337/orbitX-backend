import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { Theme } from '../styles/theme';

export default function CustomInput({ label, value, onChangeText, placeholder, secureTextEntry, style }) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Theme.colors.textSecondary}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.sm,
  },
  label: {
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
    fontSize: 14,
  },
  input: {
    fontFamily: Theme.fonts.regular,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.md,
    color: Theme.colors.text,
    fontSize: 16,
  },
});
