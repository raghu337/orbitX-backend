import React from 'react';
import { 
  StyleSheet, 
  View, 
  Modal, 
  Text, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MONOSPACE_FONT = Platform.OS === 'ios' ? 'Courier' : 'monospace';

const SpaceInfoModal = ({ visible, onClose, type }) => {
  if (!visible) return null;

  const isPrivacy = type === 'privacy';
  const modalTitle = isPrivacy ? '[ PROTOCOL // PRIVACY POLICY ]' : '[ TRANSMISSION // HELP CENTER ]';
  const modalIcon = isPrivacy ? 'shield-key-outline' : 'frequently-asked-questions';

  const renderPrivacyContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.block}>
        <Text style={styles.blockHeader}>[ 01 // ASSET TELEMETRY ]</Text>
        <Text style={styles.blockText}>
          OrbitX tracks and propagates satellite orbits in real-time. Telemetry metrics—including altitude, inclination, velocity, Doppler shift, and TLE coordinates—are monitored client-side. Sensor measurements are used strictly to map overhead coverage footprints and calculate local sky passes.
        </Text>
        <View style={styles.techBadgeContainer}>
          <Text style={styles.techBadge}>TYPE: TELEMETRY</Text>
          <Text style={styles.techBadge}>ENCRYPTION: LOCAL_AES256</Text>
        </View>
      </View>

      <View style={[styles.block, styles.accentBlock]}>
        <Text style={[styles.blockHeader, styles.accentText]}>[ 02 // DATA STORAGE SCHEMA ]</Text>
        <Text style={styles.blockText}>
          To enable offline operations, orbital coefficients and satellite databases are stored in the local application sandbox. Session data and vessel credentials are encrypted and stored in sandboxed AsyncStorage. All cached orbital assets and temporary cache credentials are permanently purged upon executing a deorbit (logout) command.
        </Text>
        <View style={styles.techBadgeContainer}>
          <Text style={[styles.techBadge, styles.accentBadge]}>CACHE: SANDBOXED</Text>
          <Text style={[styles.techBadge, styles.accentBadge]}>RETENTION: SESSION_ONLY</Text>
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockHeader}>[ 03 // LOCATION PERMISSIONS ]</Text>
        <Text style={styles.blockText}>
          Precise GPS location is requested to compute relative azimuth, elevation, and range (AER) vectors to passing satellites. These calculations run locally on your device to trigger visibility alert notifications. Location history is never uploaded to remote tracking systems.
        </Text>
        <View style={styles.techBadgeContainer}>
          <Text style={styles.techBadge}>PERM: ACCESS_FINE_LOCATION</Text>
          <Text style={styles.techBadge}>SCOPE: CLIENT_SIDE</Text>
        </View>
      </View>
    </View>
  );

  const renderHelpContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.block}>
        <Text style={styles.blockHeader}>[ FAQ // SATELLITE SYNCING ]</Text>
        <Text style={styles.faqQuestion}>Q: How do I synchronize my local satellite database?</Text>
        <Text style={styles.blockText}>
          A: Tap the refresh icon on the Tracking Console. The app will establish an API downlink, fetch the latest TLE parameters (Two-Line Elements) from the Space-Track servers, and reload the orbital propagator engine.
        </Text>
      </View>

      <View style={[styles.block, styles.accentBlock]}>
        <Text style={[styles.blockHeader, styles.accentText]}>[ FAQ // POLLING CALIBRATION ]</Text>
        <Text style={styles.faqQuestion}>Q: How do I adjust orbital telemetry polling frequency?</Text>
        <Text style={styles.blockText}>
          A: Telemetry updates can be calibrated inside the Live Tracking interface. High-frequency polling (1s) delivers ultra-precise orbital plots, whereas low-frequency intervals (30s to 60s) reduce sensor battery drainage.
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockHeader}>[ FAQ // GROQ SPACE AI LINK ]</Text>
        <Text style={styles.faqQuestion}>Q: How do I interact with the Groq Space AI Assistant?</Text>
        <Text style={styles.blockText}>
          A: Navigate to the Chat console tab. The assistant is integrated with an LLM tuned for astrophysics queries. You can prompt the assistant using natural language to query satellite catalogs, predict passes, or explain Keplerian orbital mechanics.
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
          
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Header decoration */}
              <View style={styles.decBarContainer}>
                <View style={styles.decBarPrimary} />
                <View style={styles.decBarSpacer} />
                <View style={styles.decBarSecondary} />
              </View>

              <View style={styles.header}>
                <View style={styles.iconWrapper}>
                  <MaterialCommunityIcons 
                    name={modalIcon} 
                    size={28} 
                    color={isPrivacy ? COLORS.primary : COLORS.warning} 
                  />
                </View>
                <Text style={styles.title}>{modalTitle}</Text>
              </View>

              <ScrollView 
                style={styles.scrollArea} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
              >
                {isPrivacy ? renderPrivacyContent() : renderHelpContent()}
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={styles.closeButton}>
                  <View style={styles.closeButtonInner}>
                    <Text style={styles.closeButtonText}>DISMISS UPLINK</Text>
                  </View>
                </TouchableOpacity>
              </View>
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
    backgroundColor: 'rgba(4, 7, 20, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: 'rgba(20, 25, 45, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  decBarContainer: {
    flexDirection: 'row',
    height: 3,
    width: '100%',
  },
  decBarPrimary: {
    flex: 2,
    backgroundColor: COLORS.primary,
  },
  decBarSpacer: {
    width: 10,
    backgroundColor: 'transparent',
  },
  decBarSecondary: {
    flex: 1,
    backgroundColor: COLORS.accent,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  title: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.text,
    letterSpacing: 1.2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  contentContainer: {
    gap: SPACING.lg,
  },
  block: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primary,
    paddingLeft: SPACING.md,
    marginBottom: SPACING.sm,
  },
  accentBlock: {
    borderLeftColor: COLORS.accent,
  },
  blockHeader: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  accentText: {
    color: COLORS.accent,
  },
  faqQuestion: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  blockText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  techBadgeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  techBadge: {
    fontFamily: MONOSPACE_FONT,
    fontSize: 8,
    color: COLORS.primary,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 229, 255, 0.15)',
  },
  accentBadge: {
    color: COLORS.accent,
    backgroundColor: 'rgba(255, 0, 229, 0.08)',
    borderColor: 'rgba(255, 0, 229, 0.15)',
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  closeButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.4)',
  },
  closeButtonInner: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
});

export default SpaceInfoModal;
