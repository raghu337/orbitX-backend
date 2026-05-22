import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BackgroundGradient from '../../components/BackgroundGradient';
import GlassCard from '../../components/GlassCard';
import OrbitCard from '../../components/tracking/OrbitCard';
import OrbitMapPlaceholder from '../../components/tracking/OrbitMapPlaceholder';
import NeonButton from '../../components/NeonButton';
import { COLORS, FONTS, SPACING } from '../../theme/theme';
import { favoriteSatellite } from '../../services/api/satelliteService';

const { width } = Dimensions.get('window');

const SatelliteDetailScreen = ({ route, navigation }) => {
  const { satellite } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  const handleFavorite = async () => {
    setLoadingFav(true);
    try {
      await favoriteSatellite(satellite.id);
      setIsFavorite(true);
      Alert.alert('Success', 'Satellite added to favorites!');
    } catch (err) {
      console.error('Error favoriting:', err);
      Alert.alert('Error', 'Failed to add to favorites.');
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <BackgroundGradient>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Satellite Details</Text>
          <TouchableOpacity style={styles.favButton} onPress={handleFavorite} disabled={loadingFav}>
            <MaterialCommunityIcons 
              name={isFavorite ? "star" : "star-outline"} 
              size={24} 
              color={COLORS.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="satellite-variant" size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.satName}>{satellite.name}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{satellite.status}</Text>
          </View>
        </View>

        {/* Map Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Position (Simulated)</Text>
          <OrbitMapPlaceholder />
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orbital Parameters</Text>
          <View style={styles.statsGrid}>
            <OrbitCard label="Altitude" value={satellite.altitude} icon="arrow-up-bold" />
            <OrbitCard label="Velocity" value={satellite.velocity} icon="speedometer" />
            <OrbitCard label="Inclination" value={satellite.inclination || '98.2°'} icon="angle-acute" />
            <OrbitCard label="Orbit Type" value={satellite.orbitType || 'LEO'} icon="axis-arrow" />
          </View>
        </View>

        {/* Mission Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mission Description</Text>
          <GlassCard style={styles.descCard}>
            <Text style={styles.descText}>{satellite.description}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Launch Date:</Text>
              <Text style={styles.infoValue}>{satellite.launchDate}</Text>
            </View>
          </GlassCard>
        </View>

        {/* Action Button */}
        <NeonButton 
          title="Visualize Orbit" 
          onPress={() => navigation.navigate('OrbitVisualization', { satellite })}
          style={styles.actionButton}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  favButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  satName: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 157, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  statusText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.success,
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  descCard: {
    padding: SPACING.md,
  },
  descText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: SPACING.sm,
  },
  infoLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.text,
  },
  actionButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
});

export default SatelliteDetailScreen;
