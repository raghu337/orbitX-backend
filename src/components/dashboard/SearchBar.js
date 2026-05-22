import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const SearchBar = ({ placeholder, value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="magnify" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.md,
    height: 48,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
});

export default SearchBar;
