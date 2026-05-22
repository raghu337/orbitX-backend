import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Simple static timeout navigation - zero complexity
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="rocket-launch" size={100} color={COLORS.primary} style={SHADOWS.neon} />
      <Text style={styles.title}>ORBITX</Text>
      <Text style={styles.subtitle}>MISSION CONTROL</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 20,
    letterSpacing: 4,
    ...SHADOWS.neon,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginTop: 10,
  }
});

export default SplashScreen;
