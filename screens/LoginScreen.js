import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Theme } from '../styles/theme';
import SpaceBackground from '../components/SpaceBackground';
import GlassCard from '../components/GlassCard';
import CustomInput from '../components/CustomInput';
import NeonButton from '../components/NeonButton';
import FloatingElement from '../components/FloatingElement';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    // Mock login logic
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('HomeDashboard');
    }, 1000);
  };

  return (
    <SpaceBackground>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <FloatingElement floatDistance={5} duration={4000} style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue your journey</Text>
        </FloatingElement>

        <GlassCard style={styles.card}>
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

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {isLoading ? (
            <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginVertical: Theme.spacing.md }} />
          ) : (
            <NeonButton 
              title="LAUNCH" 
              onPress={handleLogin}
            />
          )}

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>New to OrbitX? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </KeyboardAvoidingView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Theme.spacing.lg,
  },
  headerContainer: {
    marginBottom: Theme.spacing.xl,
    alignItems: 'center',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  forgotPasswordText: {
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.primary,
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Theme.spacing.xl,
  },
  signupText: {
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textSecondary,
    fontSize: 14,
  },
  signupLink: {
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
    fontSize: 14,
  },
});
