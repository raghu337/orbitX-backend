import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BackgroundGradient from '../BackgroundGradient';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('OrbitX Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <BackgroundGradient>
          <View style={styles.container}>
            <MaterialCommunityIcons name="rocket-off" size={80} color={COLORS.error} />
            <Text style={styles.title}>System Interruption</Text>
            <Text style={styles.message}>
              An unexpected anomaly occurred. Attempting to restore normal operations...
            </Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => this.setState({ hasError: false })}
            >
              <Text style={styles.buttonText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </BackgroundGradient>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  message: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxl,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.background,
  },
});

export default ErrorBoundary;
