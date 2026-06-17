import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Animated,
    Easing,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const satellites = [
  {
    id: '1',
    name: 'ISS (ZARYA)',
    type: 'Space Station',
    altitude: '418 km',
    velocity: '27,600 km/h',
    icon: 'space-station',
    description: 'International Space Station, a habitable artificial satellite in low Earth orbit.',
  },
  {
    id: '2',
    name: 'HUBBLE SPACE TELESCOPE',
    type: 'Telescope',
    altitude: '539 km',
    velocity: '27,300 km/h',
    icon: 'telescope',
    description: 'Hubble provides deep space images, operating above Earth’s atmosphere.',
  },
  {
    id: '3',
    name: 'STARLINK-1522',
    type: 'Communication',
    altitude: '550 km',
    velocity: '27,000 km/h',
    icon: 'satellite-variant',
    description: 'Starlink satellite for internet broadband service.',
  },
  {
    id: '4',
    name: 'NOAA 19',
    type: 'Weather',
    altitude: '870 km',
    velocity: '25,400 km/h',
    icon: 'weather-cloudy',
    description: 'Weather monitoring satellite providing Earth observation data.',
  },
];

const SatelliteTrackerScreen = ({ navigation }) => {
  const [selectedSat, setSelectedSat] = useState(null);
  const radarAnim = useRef(new Animated.Value(0)).current;

  // Radar pulse animation – scaling/fading circle
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(radarAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.circle),
          useNativeDriver: true,
        }),
        Animated.timing(radarAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [radarAnim]);

  const radarStyle = {
    opacity: radarAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0] }),
    transform: [
      {
        scale: radarAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2] }),
      },
    ],
  };

  const openModal = (sat) => setSelectedSat(sat);
  const closeModal = () => setSelectedSat(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.text} />
        </TouchableOpacity>
        <MaterialCommunityIcons name="satellite-variant" size={28} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Live Tracker</Text>
      </View>

      {/* Radar placeholder with animated pulse */}
      <View style={styles.mapPlaceholder}>
        <MaterialCommunityIcons name="earth" size={120} color="rgba(0, 229, 255, 0.1)" />
        <Animated.View style={[styles.radarPulse, radarStyle]} />
        <Text style={styles.mapText}>GLOBAL RADAR ONLINE</Text>
      </View>

      {/* List of satellite cards – tap opens modal */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        <Text style={styles.sectionTitle}>TRACKED OBJECTS</Text>
        {(satellites || []).map((sat) => (
          <TouchableOpacity key={sat.id} style={styles.card} onPress={() => openModal(sat)} activeOpacity={0.8}>
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons name={sat.icon} size={28} color={COLORS.primary} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.satName}>{sat.name}</Text>
              <Text style={styles.satType}>{sat.type}</Text>
              <View style={styles.satStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>ALTITUDE</Text>
                  <Text style={styles.statValue}>{sat.altitude}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>VELOCITY</Text>
                  <Text style={styles.statValue}>{sat.velocity}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selectedSat} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={closeModal} style={styles.modalClose}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            {selectedSat && (
              <>
                <Text style={styles.modalTitle}>{selectedSat.name}</Text>
                <Text style={styles.modalDesc}>{selectedSat.description}</Text>
                <View style={styles.modalStats}>
                  <View style={styles.modalStatBox}>
                    <Text style={styles.statLabel}>ALTITUDE</Text>
                    <Text style={styles.statValue}>{selectedSat.altitude}</Text>
                  </View>
                  <View style={styles.modalStatBox}>
                    <Text style={styles.statLabel}>VELOCITY</Text>
                    <Text style={styles.statValue}>{selectedSat.velocity}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backButton: { marginRight: SPACING.sm },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.text, marginLeft: SPACING.sm, letterSpacing: 1 },
  mapPlaceholder: { height: 220, backgroundColor: 'rgba(0, 229, 255, 0.03)', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(0, 229, 255, 0.1)', overflow: 'hidden' },
  radarPulse: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.3)', borderStyle: 'dashed' },
  mapText: { position: 'absolute', bottom: SPACING.sm, right: SPACING.md, fontFamily: FONTS.bold, fontSize: 10, color: COLORS.primary, letterSpacing: 2, opacity: 0.7 },
  listContainer: { flex: 1 },
  listContent: { padding: SPACING.md },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textSecondary, letterSpacing: 2, marginBottom: SPACING.md },
  card: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  cardIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0, 229, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  cardInfo: { flex: 1 },
  satName: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.text, letterSpacing: 1 },
  satType: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.primary, marginBottom: SPACING.sm },
  satStats: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: SPACING.sm },
  statBox: { flex: 1 },
  statLabel: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textSecondary, letterSpacing: 1 },
  statValue: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.text, marginTop: 2 },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: COLORS.background, borderRadius: 20, padding: SPACING.lg, position: 'relative' },
  modalClose: { position: 'absolute', top: SPACING.sm, right: SPACING.sm },
  modalTitle: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.text, marginBottom: SPACING.md },
  modalDesc: { fontFamily: FONTS.regular, fontSize: 15, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  modalStats: { flexDirection: 'row', justifyContent: 'space-around' },
  modalStatBox: { alignItems: 'center' },
});

export default SatelliteTrackerScreen;
