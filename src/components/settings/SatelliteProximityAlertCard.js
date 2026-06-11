import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme/theme';
import GlassCard from '../GlassCard';

const SatelliteProximityAlertCard = ({ 
  enabled, 
  onToggle,
  trackedAlerts = {},
}) => {
  const handleToggle = (newValue) => {
    if (newValue && !enabled) {
      Alert.alert(
        '🛰️ Enable Real-Time ETA Alerts?',
        'You\'ll receive smart notifications when satellites approach:\n\n✓ 5 min before overhead\n✓ 2 min countdown alert\n✓ Direct overhead warning\n✓ Live distance & direction\n\nThe app monitors ISS, Hubble, and other satellites with exact ETAs.',
        [
          { text: 'Cancel', onPress: () => {}, style: 'cancel' },
          { text: 'Enable', onPress: () => onToggle(true), style: 'default' },
        ]
      );
    } else {
      onToggle(newValue);
    }
  };

  const getAlertSummary = () => {
    const count = Object.keys(trackedAlerts).length;
    if (count === 0) return 'No satellites approaching';
    
    const approaching = Object.values(trackedAlerts).filter(a => a.etaSeconds >= 0).length;
    if (approaching === 0) return `${count} tracking...`;
    return `${approaching} satellite(s) approaching!`;
  };

  const getClosestSatellite = () => {
    if (Object.keys(trackedAlerts).length === 0) return null;
    
    let closest = null;
    let minEta = Infinity;
    
    for (const [name, data] of Object.entries(trackedAlerts)) {
      if (data.etaSeconds !== undefined && data.etaSeconds >= 0 && data.etaSeconds < minEta) {
        minEta = data.etaSeconds;
        closest = { name, ...data };
      }
    }
    
    return closest;
  };

  const closest = getClosestSatellite();
  const stateColors = {
    'APPROACHING': '#00CCFF',
    'NEARBY': '#FFCC00',
    'OVERHEAD': '#FF9900',
    'DIRECTLY_OVERHEAD': '#FF0000',
  };

  return (
    <GlassCard style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${COLORS.accent}15` }]}>
        <MaterialCommunityIcons name="radar" size={24} color={COLORS.accent} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Live ETA Tracking</Text>
        <Text style={styles.description}>
          {enabled ? getAlertSummary() : 'Disabled - Enable for smart ETA alerts'}
        </Text>
        
        {enabled && closest && (
          <View style={styles.closestSatellite}>
            <View 
              style={[
                styles.etaBadge,
                { backgroundColor: stateColors[closest.state] + '30' }
              ]}
            >
              <Text 
                style={[
                  styles.etaText,
                  { color: stateColors[closest.state] }
                ]}
              >
                {closest.eta}
              </Text>
              <Text 
                style={[
                  styles.etaLabel,
                  { color: stateColors[closest.state] }
                ]}
              >
                {closest.state}
              </Text>
            </View>
            <View style={styles.satInfo}>
              <Text style={styles.satName}>{closest.name}</Text>
              <Text style={styles.satDetails}>
                {typeof closest.distance === 'number' 
                  ? closest.distance.toFixed(1)
                  : closest.distance}km • {closest.direction}
              </Text>
            </View>
          </View>
        )}

        {enabled && !closest && (
          <Text style={styles.trackedItem}>
            • Monitoring: ISS, Hubble, NOAA satellites
          </Text>
        )}
      </View>
      <Switch
        trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: `${COLORS.accent}40` }}
        thumbColor={enabled ? COLORS.accent : '#f4f3f4'}
        ios_backgroundColor="rgba(255, 255, 255, 0.1)"
        onValueChange={handleToggle}
        value={enabled}
      />
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  content: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closestSatellite: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  etaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  etaText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 1,
  },
  etaLabel: {
    fontFamily: FONTS.regular,
    fontSize: 8,
    marginTop: 2,
  },
  satInfo: {
    flex: 1,
  },
  satName: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.text,
  },
  satDetails: {
    fontFamily: FONTS.regular,
    fontSize: 9,
    color: COLORS.accent,
    marginTop: 1,
  },
  trackedItem: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.accent,
    marginTop: 6,
  },
});

export default SatelliteProximityAlertCard;
