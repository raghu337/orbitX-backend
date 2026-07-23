import React from 'react';
import { StyleSheet, TextInput, View, Text } from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme/theme';

const CustomInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  onFocus,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  error,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          onFocus={onFocus}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || "none"}
          autoCorrect={autoCorrect}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  input: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  errorText: {
    color: COLORS.error,
    fontFamily: FONTS.regular,
    fontSize: 11,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});

export default CustomInput;
