import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const facts = [
  { id: '1', title: 'Black Holes', icon: 'weather-hurricane', text: 'Black holes are regions of spacetime where gravity is so strong that nothing, not even light, can escape. The boundary of a black hole is called the event horizon.' },
  { id: '2', title: 'Neutron Stars', icon: 'star-shooting', text: 'Neutron stars are the collapsed cores of massive supergiant stars. They are so dense that a sugar-cube-sized amount of neutron star material would weigh about 100 million tons on Earth.' },
  { id: '3', title: 'The Milky Way', icon: 'earth', text: 'Our Milky Way galaxy is a barred spiral galaxy estimated to contain 100-400 billion stars and at least that number of planets. It is about 100,000 light-years across.' },
  { id: '4', title: 'International Space Station', icon: 'space-station', text: 'The ISS orbits Earth at an average altitude of 420 km, traveling at 28,000 km/h. It completes one orbit around Earth every 90 minutes, experiencing 16 sunrises and sunsets every day.' },
  { id: '5', title: 'Mars & Jupiter', icon: 'earth', text: 'Mars features Olympus Mons, the largest volcano in the solar system. Jupiter, a gas giant, has a Great Red Spot, a massive storm that has been raging for at least 400 years.' },
  { id: '6', title: 'NASA Voyager Mission', icon: 'rocket-launch', text: 'Launched in 1977, Voyager 1 and 2 are the farthest human-made objects from Earth. Voyager 1 entered interstellar space in 2012, carrying the "Golden Record" of Earth.' },
];

const SpaceFactsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.text} />
        </TouchableOpacity>
        <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#00E5FF" />
        <Text style={styles.headerTitle}>Space Facts</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {(facts || []).map((fact) => (
          <View key={fact.id} style={styles.factCard}>
            <View style={styles.factHeader}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={fact.icon} size={24} color="#00E5FF" />
              </View>
              <Text style={styles.factTitle}>{fact.title}</Text>
            </View>
            <Text style={styles.factText}>{fact.text}</Text>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    letterSpacing: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  factCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  factHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  factTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
    letterSpacing: 1,
  },
  factText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
});

export default SpaceFactsScreen;
