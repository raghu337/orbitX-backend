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
  ActivityIndicator,
  Alert
} from 'react-native';
import BackgroundGradient from '../components/BackgroundGradient';
import GlassCard from '../components/GlassCard';
import CustomInput from '../components/CustomInput';
import NeonButton from '../components/NeonButton';
import { COLORS, FONTS, SPACING, SHADOWS } from '../theme/theme';
import { useAuth } from '../hooks/useAuth';
import { BACKEND_URL, OFFLINE_MODE } from '../services/api/orbitxApi';
import { validateEmail, validatePassword, isLoginFormValid } from '../utils/validation';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Compute validation errors in real-time
  const emailError = (emailTouched || email.length > 0) ? validateEmail(email) : '';
  const passwordError = (passwordTouched || password.length > 0) ? validatePassword(password) : '';
  const isFormValid = isLoginFormValid(email, password);

  const handleEmailChange = (text) => {
    setEmail(text);
    setEmailTouched(true);
    setAuthError('');
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordTouched(true);
    setAuthError('');
  };

  const handleLogin = async () => {
    if (!isFormValid || loading) return;

    setEmailTouched(true);
    setPasswordTouched(true);
    setAuthError('');
    Keyboard.dismiss();

    setLoading(true);
    try {
      if (login) {
        await login(email.trim(), password);
      }
      setLoading(false);
      navigation.replace('HomeDashboard');
    } catch (err) {
      setLoading(false);
      setAuthError(err.userMessage || err.message || 'Invalid email or password.');
    }
  };

  const handleForgotPassword = async () => {
    setAuthError('');
    Keyboard.dismiss();

    const emailValError = validateEmail(email);
    if (emailValError) {
      setAuthError('Please enter a valid Gmail address to reset your password.');
      return;
    }

    setLoading(true);
    try {
      if (OFFLINE_MODE) {
        // Simulate network latency in offline mode
        await new Promise((resolve) => setTimeout(resolve, 800));
      } else {
        // Trigger fetch request to the POST /api/auth/forgot-password backend endpoint
        const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim() }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || data.error || 'Failed to send password reset email.');
        }
      }

      setLoading(false);
      Alert.alert(
        'Password Reset',
        'A password reset notification has been sent to your registered email address.'
      );
    } catch (err) {
      setLoading(false);
      setAuthError(err.message || 'Failed to process password reset request.');
    }
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
              {authError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{authError}</Text>
                </View>
              ) : null}

              <CustomInput
                label="Email"
                placeholder="astronaut@gmail.com"
                value={email}
                onChangeText={handleEmailChange}
                onBlur={() => setEmailTouched(true)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={emailError}
              />
              
              <CustomInput
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={handlePasswordChange}
                onBlur={() => setPasswordTouched(true)}
                secureTextEntry
                error={passwordError}
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                disabled={loading}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <NeonButton
                title="Enter Orbit"
                onPress={handleLogin}
                disabled={!isFormValid || loading}
                loading={loading}
                style={styles.button}
              />

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
