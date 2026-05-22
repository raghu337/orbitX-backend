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

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    Keyboard.dismiss();
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
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
              <Text style={styles.title}>JOIN ORBITX</Text>
              <Text style={styles.subtitle}>Start your cosmic journey today</Text>
            </View>

            <GlassCard style={styles.card}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              
              <CustomInput
                label="Full Name"
                placeholder="Neil Armstrong"
                value={name}
                onChangeText={(t) => { setName(t); setError(''); }}
              />
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
              <CustomInput
                label="Confirm Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                secureTextEntry
              />

              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : (
                <NeonButton 
                  title="Launch Account" 
                  onPress={handleSignup}
                  style={styles.button}
                />
              )}

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already in Orbit? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.linkText}>Log In</Text>
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
    fontSize: 32,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    letterSpacing: 2,
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
  button: {
    marginTop: SPACING.lg,
  },
  loaderContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
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

export default SignupScreen;
