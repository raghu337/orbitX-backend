import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  SlideInUp, 
  useSharedValue, 
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme/theme';

const SatelliteAlertModal = ({ visible, onClose, satelliteName, distance, eta }) => {
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (visible) {
      pulse.value = withRepeat(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [visible]);

  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 1.5 - pulse.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
          <Animated.View entering={SlideInUp.springify().damping(15)} style={styles.alertCard}>
            
            <View style={styles.header}>
              <View style={styles.radarContainer}>
                <Animated.View style={[styles.pulseRing, animatedPulse]} />
                <MaterialCommunityIcons name="radar" size={32} color={COLORS.error} />
              </View>
              <Text style={styles.alertTitle}>PROXIMITY ALERT</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.dataContainer}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>TARGET:</Text>
                <Text style={styles.dataValue}>{satelliteName}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>DISTANCE:</Text>
                <Text style={styles.dataValue}>{distance}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>ETA TO ZENITH:</Text>
                <Text style={[styles.dataValue, { color: COLORS.warning }]}>{eta}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.actionBtn} onPress={onClose}>
              <Text style={styles.actionBtnText}>ACKNOWLEDGE</Text>
            </TouchableOpacity>

          </Animated.View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  alertCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 102, 0.5)',
    padding: SPACING.lg,
    ...SHADOWS.neon,
    shadowColor: COLORS.error,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  radarContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  alertTitle: {
    fontFamily: FONTS.black,
    fontSize: 20,
    color: COLORS.error,
    letterSpacing: 2,
    textShadowColor: COLORS.error,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  dataContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.xl,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  dataLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  dataValue: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  actionBtn: {
    backgroundColor: 'rgba(255, 51, 102, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.error,
    letterSpacing: 2,
  },
});

export default SatelliteAlertModal;
