import React from 'react';
import { 
  StyleSheet, 
  View, 
  Modal, 
  Text, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Dimensions 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import GlassCard from '../GlassCard';
import NeonButton from '../NeonButton';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const { height } = Dimensions.get('window');

const OrbitModal = ({ 
  visible, 
  onClose, 
  title, 
  children, 
  actionTitle, 
  onAction,
  icon = 'alert-circle-outline'
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableWithoutFeedback>
            <View style={styles.contentContainer}>
              <GlassCard style={styles.card}>
                <View style={styles.header}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name={icon} size={32} color={COLORS.primary} />
                  </View>
                  <Text style={styles.title}>{title}</Text>
                </View>

                <View style={styles.body}>
                  {children}
                </View>

                <View style={styles.footer}>
                  {onAction && (
                    <NeonButton 
                      title={actionTitle || 'OK'} 
                      onPress={onAction} 
                      style={styles.actionButton}
                    />
                  )}
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    textAlign: 'center',
  },
  body: {
    marginBottom: SPACING.xl,
  },
  footer: {
    gap: SPACING.md,
  },
  actionButton: {
    width: '100%',
  },
  closeButton: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  closeText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default OrbitModal;
