import React from 'react';
import { StyleSheet, TextInput, View, Text } from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme/theme';

const CustomInput = ({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: 12,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.md,
    height: 50,
    justifyContent: 'center',
  },
  input: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
});

export default CustomInput;
