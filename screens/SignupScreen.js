import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../styles/theme';
import SpaceBackground from '../components/SpaceBackground';
import GlassCard from '../components/GlassCard';
import CustomInput from '../components/CustomInput';
import NeonButton from '../components/NeonButton';
import FloatingElement from '../components/FloatingElement';

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    // Navigate to Home Dashboard after signup
    navigation.replace('HomeDashboard');
  };

  return (
    <SpaceBackground>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <FloatingElement floatDistance={5} duration={4500} style={styles.headerContainer}>
            <Text style={styles.title}>Join OrbitX</Text>
            <Text style={styles.subtitle}>Start your space exploration</Text>
          </FloatingElement>

          <GlassCard style={styles.card}>
            <CustomInput
              label="Username"
              placeholder="StarGazer99"
              value={username}
              onChangeText={setUsername}
            />

            <CustomInput
              label="Email"
              placeholder="astronomer@orbitx.com"
              value={email}
              onChangeText={setEmail}
            />
            
            <CustomInput
              label="Password"
              placeholder="********"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <CustomInput
              label="Confirm Password"
              placeholder="********"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <View style={{ marginTop: Theme.spacing.md }}>
              <NeonButton 
                title="CREATE ACCOUNT" 
                onPress={handleSignup}
              />
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Theme.spacing.lg,
  },
  headerContainer: {
    marginBottom: Theme.spacing.xl,
    alignItems: 'center',
    marginTop: Theme.spacing.xxl,
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: Theme.spacing.sm,
    textShadowColor: Theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: Theme.fonts.regular,
    fontSize: 16,
    color: Theme.colors.textSecondary,
  },
  card: {
    padding: Theme.spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Theme.spacing.xl,
  },
  loginText: {
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
    fontSize: 14,
  },
});
