import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import BackgroundGradient from '../../components/BackgroundGradient';
import { loadApodFavorites } from '../../services/apodService';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../theme/theme';

const ApodFavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    const storedFavorites = await loadApodFavorites();
    setFavorites(storedFavorites);
    setLoading(false);
  }, []);

  const refreshFavorites = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  useEffect(() => {
    navigation?.setOptions({ headerShown: false });
    loadFavorites();
  }, [loadFavorites, navigation]);

  const renderFavorite = ({ item }) => (
    <TouchableOpacity
      style={styles.gridItem}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('NASA_APOD', { date: item.date })}
    >
      <Image source={{ uri: item.hdurl || item.url }} style={styles.favoriteImage} />
      <View style={styles.favoriteMeta}>
        <Text style={styles.favoriteTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.favoriteFooter}>
          <Text style={styles.favoriteDate}>{item.date}</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.page}>
      <BackgroundGradient />
      <View style={styles.overlay} />

      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.text} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>APOD Favorites</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderLabel}>Loading saved APODs...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No favorites yet.</Text>
          <Text style={styles.emptyText}>
            Save your favorite APOD images in OrbitX and revisit them anytime.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.date}
          renderItem={renderFavorite}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshFavorites}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 7, 20, 0.78)',
    zIndex: -1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  backButtonPlaceholder: {
    width: 70,
  },
  backText: {
    marginLeft: SPACING.xs,
    color: COLORS.text,
    fontFamily: FONTS.medium,
  },
  screenTitle: {
    color: COLORS.primary,
    fontFamily: FONTS.black,
    fontSize: 24,
    letterSpacing: 1,
  },
  loaderCard: {
    flex: 1,
    minHeight: 220,
    borderRadius: 28,
    marginHorizontal: SPACING.sm,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...SHADOWS.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderLabel: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  emptyCard: {
    flex: 1,
    borderRadius: 28,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...SHADOWS.glass,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  emptyTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 20,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    paddingBottom: SPACING.xxxl || SPACING.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  gridItem: {
    flex: 1,
    marginRight: SPACING.sm,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...SHADOWS.glass,
  },
  favoriteImage: {
    width: '100%',
    height: 150,
  },
  favoriteMeta: {
    padding: SPACING.md,
  },
  favoriteTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  favoriteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favoriteDate: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
});

export default ApodFavoritesScreen;
