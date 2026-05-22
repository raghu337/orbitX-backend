import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

class ModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[ModuleErrorBoundary] caught error in module ${this.props.moduleName || 'Unknown'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <GlassCard style={styles.card}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
            <Text style={styles.title}>{this.props.moduleName || 'Module'} Offline</Text>
            <Text style={styles.message}>
              This component is temporarily unavailable. 
            </Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => this.setState({ hasError: false })}
            >
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
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
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  card: {
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  message: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.error,
  },
});

export default ModuleErrorBoundary;
