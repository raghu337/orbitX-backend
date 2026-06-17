import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import PlanetCard from '../components/common/PlanetCard';
import {
    PLANETS_DATA,
    PLANET_TYPES,
    filterPlanetsByType,
    searchPlanets,
} from '../data/planetsData';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 42) / 2;

/**
 * Planet Explorer Screen
 * Professional NASA-style planet exploration interface
 */
const PlanetExplorer = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [starPositions] = useState(generateStars());

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Reset search and filters on focus
      setSearchQuery('');
      setSelectedType('All');
    }, [])
  );

  // Filter and search planets
  const filteredPlanets = useMemo(() => {
    let planets = filterPlanetsByType(selectedType);

    if (searchQuery.trim()) {
      planets = searchPlanets(searchQuery);
    }

    return planets;
  }, [searchQuery, selectedType]);

  const handlePlanetPress = (planet) => {
    navigation.navigate('PlanetDetail', { planetId: planet.id });
  };

  const renderPlanetCard = ({ item, index }) => (
    <PlanetCard
      planet={item}
      onPress={handlePlanetPress}
      style={{
        marginLeft: index % 2 === 0 ? 16 : 8,
        marginRight: index % 2 === 0 ? 8 : 16,
      }}
    />
  );

  const renderHeader = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <View>
          <Text style={styles.subtitle}>Welcome to</Text>
          <Text style={styles.mainTitle}>Planet Explorer</Text>
        </View>
        <MaterialCommunityIcons
          name="telescope"
          size={48}
          color="#00D9FF"
          style={{ opacity: 0.8 }}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons
            name="search"
            size={20}
            color="rgba(0, 217, 255, 0.5)"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search planets..."
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color="rgba(0, 217, 255, 0.6)"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Type</Text>
        <View style={styles.filterButtonsRow}>
          <FlatList
            data={PLANET_TYPES}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedType === item && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedType(item)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedType === item && styles.filterButtonTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
          />
        </View>
      </View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredPlanets.length} of {PLANETS_DATA.length} planets
        </Text>
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="magnify"
        size={64}
        color="rgba(0, 217, 255, 0.3)"
        style={{ marginBottom: 16 }}
      />
      <Text style={styles.emptyStateTitle}>No planets found</Text>
      <Text style={styles.emptyStateText}>
        Try adjusting your search or filters
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#00D9FF" />
          <Text style={styles.loadingText}>Discovering planets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />

      {/* Animated Stars Background */}
      <View style={styles.starsContainer} pointerEvents="none">
        {starPositions.map((star, index) => (
          <View
            key={index}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                opacity: star.opacity,
              },
            ]}
          />
        ))}
      </View>

      {/* Main Content */}
      <FlatList
        data={filteredPlanets}
        renderItem={renderPlanetCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        columnWrapperStyle={styles.columnWrapper}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4}
        updateCellsBatchingPeriod={50}
      />
    </SafeAreaView>
  );
};

/**
 * Generate random star positions for background
 */
function generateStars(count = 50) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      opacity: Math.random() * 0.7 + 0.3,
      size: Math.random() * 1.5 + 0.5,
    });
  }
  return stars;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0E27',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(0, 217, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 217, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    marginBottom: 8,
  },
  filterButtonsRow: {
    height: 40,
  },
  filterButton: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 217, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 217, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(0, 217, 255, 0.25)',
    borderColor: '#00D9FF',
  },
  filterButtonText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#00D9FF',
    fontWeight: '700',
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginHorizontal: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});

export default PlanetExplorer;
