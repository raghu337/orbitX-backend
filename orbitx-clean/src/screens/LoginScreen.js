import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import GlassCard from '../components/GlassCard';
import NeonButton from '../components/NeonButton';
import { COLORS, SPACING, SHADOWS } from '../theme/theme';

const LoginScreen = ({ navigation }) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>ORBITX</Text>
            <Text style={styles.subtitle}>Log in to explore the cosmos</Text>
          </View>

          <GlassCard style={styles.card}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="astronaut@orbitx.com"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <NeonButton
              title="Enter Orbit"
              onPress={() => navigation.replace('Home')}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    letterSpacing: 4,
    ...SHADOWS.neon,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  card: {
    width: '100%',
    padding: SPACING.xl,
  },
  inputWrapper: {
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.md,
    height: 50,
    color: COLORS.text,
    fontSize: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
    marginTop: SPACING.xs,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xxl,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default LoginScreen;
