import { BlurView } from 'expo-blur';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SPACING } from '../../theme/theme';

const PlanetInfoModal = ({ visible, planet, onClose }) => {
  if (!planet) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={90} tint="dark" style={styles.blur}>
          <Text style={styles.title}>{planet.name}</Text>
          <Text style={styles.subtitle}>{planet.tagline}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Diameter</Text>
            <Text style={styles.value}>{planet.diameter}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Distance</Text>
            <Text style={styles.value}>{planet.distanceFromSun}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Moons</Text>
            <Text style={styles.value}>{planet.moons}</Text>
          </View>
          <Text style={styles.sectionTitle}>Fact</Text>
          <Text style={styles.fact}>{planet.fact}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
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
  blur: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: SPACING.lg,
    borderColor: 'rgba(0, 229, 255, 0.18)',
    borderWidth: 1,
    backgroundColor: 'rgba(6, 10, 30, 0.68)',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.16,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    fontWeight: '700',
  },
  fact: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
  },
  closeButton: {
    marginTop: SPACING.lg,
    borderRadius: 16,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.35)',
  },
  closeText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default PlanetInfoModal;
