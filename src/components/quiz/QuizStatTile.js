import { StyleSheet, Text } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme/theme';
import GlassCard from '../GlassCard';

const QuizStatTile = ({ label, value, accent }) => {
  return (
    <GlassCard style={[styles.tile, accent ? { borderColor: `${accent}40` } : null]}>
      <Text style={[styles.value, { color: accent || COLORS.text }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 100,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: SPACING.sm,
  },
  value: {
    fontFamily: FONTS.black,
    fontSize: 20,
    marginBottom: 6,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default QuizStatTile;
