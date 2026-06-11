import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme/theme';
import GlassCard from '../GlassCard';

const SatelliteArrivalCard = ({ 
  satellite,
  eta,
  isTracking = false,
}) => {
  const [countdown, setCountdown] = useState(null);
  const [countdownColor, setCountdownColor] = useState(COLORS.primary);

  useEffect(() => {
    if (!eta || !isTracking) return;

    const updateCountdown = () => {
      if (eta.etaSeconds !== undefined && eta.etaSeconds !== null) {
        const minutes = Math.floor(eta.etaSeconds / 60);
        const seconds = Math.floor(eta.etaSeconds % 60);
        setCountdown(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);

        // Update color based on proximity
        let color = COLORS.primary;
        if (eta.etaSeconds < 0) color = '#00AA00'; // Green - receding
        else if (eta.etaSeconds < 30) color = '#FF0000'; // Red - emergency
        else if (eta.etaSeconds < 60) color = '#FF6600'; // Orange-red - overhead
        else if (eta.etaSeconds < 120) color = '#FF9900'; // Orange - close
        else if (eta.etaSeconds < 300) color = '#FFCC00'; // Yellow - warning
        else if (eta.etaSeconds < 600) color = '#00CCFF'; // Cyan - approaching
        else color = '#00FF00'; // Green - distant

        setCountdownColor(color);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eta, isTracking]);

  if (!eta) {
    return (
      <GlassCard style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: `${COLORS.primary}15` }]}>
          <MaterialCommunityIcons name="satellite" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{satellite?.name || 'Satellite'}</Text>
          <Text style={styles.description}>Calculating ETA...</Text>
        </View>
      </GlassCard>
    );
  }

  const stateEmoji = {
    'FAR': '🌍',
    'APPROACHING': '🔵',
    'NEARBY': '🟠',
    'OVERHEAD': '🔴',
    'DIRECTLY_OVERHEAD': '🚨',
  };

  return (
    <GlassCard style={[styles.card, { borderColor: countdownColor + '40' }]}>
      <View style={[styles.iconContainer, { backgroundColor: countdownColor + '15' }]}>
        <Text style={styles.stateEmoji}>{stateEmoji[eta.state] || '🛰️'}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{satellite?.name || 'Satellite'}</Text>
          <View style={[styles.stateBadge, { backgroundColor: countdownColor + '30' }]}>
            <Text style={[styles.stateBadgeText, { color: countdownColor }]}>
              {eta.state}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{eta.message}</Text>

        {isTracking && (
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="map-marker" size={12} color={COLORS.accent} />
              <Text style={styles.detailText}>
                {typeof eta.distance === 'number' 
                  ? eta.distance.toFixed(1)
                  : eta.distance}km
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="compass" size={12} color={COLORS.accent} />
              <Text style={styles.detailText}>{eta.direction}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="speedometer" size={12} color={COLORS.accent} />
              <Text style={styles.detailText}>
                {typeof eta.bearing === 'number' 
                  ? Math.round(eta.bearing)
                  : eta.bearing}°
              </Text>
            </View>
          </View>
        )}
      </View>

      {countdown && (
        <View style={[styles.countdownContainer, { backgroundColor: countdownColor + '15' }]}>
          <Text style={[styles.countdown, { color: countdownColor }]}>
            {countdown}
          </Text>
          {eta.etaSeconds < 0 && (
            <Text style={[styles.countdownLabel, { color: COLORS.textSecondary }]}>
              Exiting
            </Text>
          )}
          {eta.etaSeconds >= 0 && eta.etaSeconds < 120 && (
            <Text style={[styles.countdownLabel, { color: countdownColor }]}>
              Overhead!
            </Text>
          )}
          {eta.etaSeconds >= 120 && (
            <Text style={[styles.countdownLabel, { color: countdownColor }]}>
              ETA
            </Text>
          )}
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  stateEmoji: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  stateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stateBadgeText: {
    fontFamily: FONTS.regular,
    fontSize: 9,
    fontWeight: '600',
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  detailText: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.accent,
    marginLeft: 4,
  },
  countdownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  countdown: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    letterSpacing: 2,
  },
  countdownLabel: {
    fontFamily: FONTS.regular,
    fontSize: 9,
    marginTop: 2,
  },
});

export default SatelliteArrivalCard;
