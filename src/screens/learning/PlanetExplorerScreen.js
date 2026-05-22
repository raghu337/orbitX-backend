import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const { width } = Dimensions.get('window');

const planets = [
  { id: '1', name: 'MARS', type: 'Terrestrial', icon: 'earth', color: '#FF5722', gravity: '3.721 m/s²', temp: '-65 °C', distance: '225M km' },
  { id: '2', name: 'JUPITER', type: 'Gas Giant', icon: 'earth', color: '#FFC107', gravity: '24.79 m/s²', temp: '-110 °C', distance: '778M km' },
  { id: '3', name: 'SATURN', type: 'Gas Giant', icon: 'earth', color: '#FFEB3B', gravity: '10.44 m/s²', temp: '-140 °C', distance: '1.4B km' },
];

const PlanetExplorerScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredPlanets = planets.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.text} />
        </TouchableOpacity>
        <MaterialCommunityIcons name="earth" size={28} color={COLORS.accent} />
        <Text style={styles.headerTitle}>Planet Explorer</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search planet..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {(filteredPlanets || []).map((planet) => (
          <View key={planet.id} style={styles.planetCardWrapper}>
            <TouchableOpacity onPress={() => navigation.navigate('PlanetDetail', { planet })} activeOpacity={0.9}>
              <View style={[styles.planetCard, { borderColor: `${planet.color}50` }]}>
              
              <View style={[styles.planetImagePlaceholder, { shadowColor: planet.color }]}>
                <MaterialCommunityIcons name={planet.icon} size={100} color={planet.color} />
              </View>

              <Text style={styles.planetName}>{planet.name}</Text>
              <Text style={[styles.planetType, { color: planet.color }]}>{planet.type}</Text>

              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  <MaterialCommunityIcons name="weight" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.statLabel}>Gravity</Text>
                  <Text style={styles.statValue}>{planet.gravity}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statRow}>
                  <MaterialCommunityIcons name="thermometer" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.statLabel}>Temp</Text>
                  <Text style={styles.statValue}>{planet.temp}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statRow}>
                  <MaterialCommunityIcons name="map-marker-distance" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.statLabel}>Distance</Text>
                  <Text style={styles.statValue}>{planet.distance}</Text>
                </View>
              </View>
            </View>
            </TouchableOpacity>
          </View>
        ))}
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
  scrollContent: {
    alignItems: 'center',
  },
  planetCardWrapper: {
    width: width,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  planetCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
  },
  planetImagePlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  planetName: {
    fontFamily: FONTS.black,
    fontSize: 36,
    color: COLORS.text,
    letterSpacing: 4,
  },
  planetType: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: SPACING.xl,
    textTransform: 'uppercase',
  },
  statsContainer: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: SPACING.lg,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: SPACING.lg,
    margin: SPACING.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
});

export default PlanetExplorerScreen;
