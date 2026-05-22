import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator
} from 'react-native';
import BackgroundGradient from '../components/BackgroundGradient';
import GlassCard from '../components/GlassCard';
import CustomInput from '../components/CustomInput';
import NeonButton from '../components/NeonButton';
import { COLORS, FONTS, SPACING, SHADOWS } from '../theme/theme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    Keyboard.dismiss();

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('HomeDashboard');
    }, 500);
  };

  return (
    <BackgroundGradient>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>ORBITX</Text>
              <Text style={styles.subtitle}>Log in to explore the cosmos</Text>
            </View>

            <GlassCard style={styles.card}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <CustomInput
                label="Email"
                placeholder="astronaut@orbitx.com"
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <CustomInput
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                disabled={loading}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : (
                <NeonButton
                  title="Enter Orbit"
                  onPress={handleLogin}
                  style={styles.button}
                />
              )}

              <View style={styles.footer}>
                <Text style={styles.footerText}>New to Space? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.linkText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: SPACING.xxl,
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.black,
    fontSize: 42,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    letterSpacing: 4,
    ...SHADOWS.neon,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  card: {
    width: '100%',
    padding: SPACING.xl,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 51, 102, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 102, 0.3)',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontFamily: FONTS.medium,
    fontSize: 13,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
    marginTop: SPACING.xs,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.medium,
    opacity: 0.8,
  },
  button: {
    marginTop: SPACING.xs,
  },
  loaderContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xxl,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  linkText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});

export default LoginScreen;
