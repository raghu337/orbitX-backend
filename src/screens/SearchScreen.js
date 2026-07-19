import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING } from '../theme/theme';
import { PLANETS_DATA } from '../data/planetsData';
import { MOCK_SATELLITES } from '../data/mockSatellites';
import { getCourses } from '../services/api/learningService';
import satelliteService from '../services/satelliteService';

const { width } = Dimensions.get('window');

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [satellites, setSatellites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load backend and fallback data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch courses from API
        const apiCourses = await getCourses();
        if (apiCourses && apiCourses.length > 0) {
          setCourses(apiCourses);
        } else {
          // Fallback courses
          setCourses([
            {
              id: 1,
              title: "Introduction to Orbital Mechanics",
              description: "Learn the basics of Keplerian orbits, satellite altitude, and velocity calculations.",
              difficulty_level: "Beginner"
            },
            {
              id: 2,
              title: "Satellite Communication Systems",
              description: "Understand frequency bands, signal propagation, and link budget calculations.",
              difficulty_level: "Intermediate"
            },
            {
              id: 3,
              title: "Deep Space Exploration",
              description: "Explore trajectory planning, gravity assists, and interstellar probes.",
              difficulty_level: "Advanced"
            }
          ]);
        }
      } catch (err) {
        console.warn('Error loading courses in SearchScreen, using fallback:', err);
      }

      try {
        // Fetch satellites or construct fleet
        const fleet = satelliteService.createSatelliteFleet();
        if (fleet && fleet.length > 0) {
          setSatellites(fleet);
        } else {
          setSatellites(MOCK_SATELLITES);
        }
      } catch (err) {
        setSatellites(MOCK_SATELLITES);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredEntities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // Map planets, satellites, and courses to a unified format
    const planetsMapped = PLANETS_DATA.map(p => ({
      id: p.id,
      name: p.name,
      type: 'planet',
      subCategory: p.type || 'Planet',
      overview: p.shortDescription || p.description || '',
    }));

    const satellitesMapped = satellites.map(s => ({
      id: s.id,
      name: s.name,
      type: 'satellite',
      subCategory: s.category || s.orbitType || 'Satellite',
      overview: s.description || `NORAD ID: ${s.noradId || s.id}`,
      noradId: s.noradId,
    }));

    const coursesMapped = courses.map(c => ({
      id: c.id,
      name: c.title,
      type: 'course',
      subCategory: c.difficulty_level || 'Course',
      overview: c.description || '',
    }));

    const allEntities = [...planetsMapped, ...satellitesMapped, ...coursesMapped];

    if (!query) {
      return allEntities;
    }

    return allEntities.filter(item =>
      item.name.toLowerCase().includes(query)
    );
  }, [searchQuery, satellites, courses]);

  const renderEntityCard = ({ item }) => {
    const getIcon = () => {
      switch (item.type) {
        case 'planet': return 'earth';
        case 'satellite': return 'satellite-variant';
        case 'course': return 'school';
        default: return 'help-circle';
      }
    };

    const getColor = () => {
      switch (item.type) {
        case 'planet': return COLORS.primary; // Neon Cyan
        case 'satellite': return COLORS.accent; // Neon Pink
        case 'course': return COLORS.warning; // Neon Yellow/Amber
        default: return COLORS.text;
      }
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (item.type === 'planet') {
            navigation.navigate('PlanetDetail', { planetId: item.id });
          } else if (item.type === 'satellite') {
            navigation.navigate('SatelliteTracker', { selectedId: item.id });
          } else if (item.type === 'course') {
            navigation.navigate('QuizZone');
          }
        }}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['rgba(20, 25, 45, 0.8)', 'rgba(10, 12, 28, 0.9)']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.iconFrame, { borderColor: `${getColor()}40`, backgroundColor: `${getColor()}10` }]}>
            <MaterialCommunityIcons name={getIcon()} size={24} color={getColor()} />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={[styles.cardSubCategory, { color: getColor() }]}>
              {item.subCategory.toUpperCase()}
            </Text>
            <Text style={styles.cardOverview} numberOfLines={2}>
              {item.overview}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255, 255, 255, 0.3)" style={styles.arrow} />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="magnify-close" size={64} color="rgba(255, 255, 255, 0.15)" />
      <Text style={styles.emptyText}>No space entities found matching your search.</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={[COLORS.background, '#0C0A24', '#040714']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MISSION ARCHIVE SEARCH</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons
              name="search"
              size={20}
              color="rgba(0, 229, 255, 0.5)"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search planets, satellites, courses..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="rgba(0, 229, 255, 0.6)"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Loading Indicator */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Syncing Mission Archives...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredEntities}
            renderItem={renderEntityCard}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 25, 45, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
    letterSpacing: 1.5,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 25, 45, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  card: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  iconFrame: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.text,
  },
  cardSubCategory: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    marginVertical: 4,
  },
  cardOverview: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  arrow: {
    marginLeft: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    lineHeight: 20,
  },
});

export default SearchScreen;
