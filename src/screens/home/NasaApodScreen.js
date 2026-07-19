import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchAPOD, loadApodFavorites, toggleApodFavorite } from '../../services/nasaService';
import { COLORS, SPACING, FONTS } from '../../theme/theme';

// Safe date formatter (YYYY-MM-DD)
const formatDate = (date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

// Safe date offset adjust helper
const adjustDate = (dateStr, days) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

const FALLBACK_APOD = {
  title: 'Orion Nebula: The Great Stellar Nursery',
  date: formatDate(new Date()),
  url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200',
  hdurl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200',
  media_type: 'image',
  copyright: 'Public Domain / NASA',
  explanation: 'The Orion Nebula is a picture-perfect stellar nursery located about 1,350 light-years away. It is the closest region of massive star formation to Earth, giving astronomers a detailed look at how stars are born. The nebula contains hundreds of young stars and planetary systems in various stages of formation, illuminated by the intense ultraviolet radiation from the Trapezium Cluster.',
};

export default function NasaApodScreen({ navigation }) {
  const [currentDate, setCurrentDate] = useState(() => formatDate(new Date()));
  const [maxDate, setMaxDate] = useState(() => formatDate(new Date()));
  const [apodData, setApodData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);

  // Load favorites list
  const loadFavoritesList = async () => {
    try {
      const list = await loadApodFavorites();
      setFavorites(list);
    } catch (e) {
      console.warn('[APOD Screen] Error loading favorites:', e);
    }
  };

  // Fetch single APOD entry with automatic timezone fallback
  const fetchNasaApodData = useCallback(async (dateString) => {
    setIsLoading(true);
    setError(null);

    let targetDate = dateString;
    let attempts = 0;
    const maxAttempts = 3;
    let dataLoaded = false;
    let lastError = null;

    while (attempts < maxAttempts && !dataLoaded) {
      try {
        const data = await fetchAPOD(targetDate);
        setApodData(data);
        dataLoaded = true;

        // If we successfully fetched a previous date, update currentDate and maxDate
        if (targetDate !== dateString) {
          setCurrentDate(targetDate);
          setMaxDate(targetDate);
        }
      } catch (err) {
        console.warn(`[APOD Screen] Failed to fetch for ${targetDate}:`, err);
        lastError = err;

        const isNoDataError = err.message && (
          err.message.includes('404') || 
          err.message.toLowerCase().includes('no data available')
        );

        if (isNoDataError) {
          // Go to previous day
          targetDate = adjustDate(targetDate, -1);
          attempts++;
        } else {
          // Break immediately for other errors (e.g. rate limit, connection)
          break;
        }
      }
    }

    if (!dataLoaded) {
      setError(lastError?.message || 'API Limit reached or connection failed.');
      // Use fallback data so the screen remains functional
      setApodData({
        ...FALLBACK_APOD,
        date: dateString,
      });
    }

    setIsLoading(false);
  }, []);

  // Initialize and reload when date changes (avoiding redundant fetches)
  useEffect(() => {
    if (!apodData || apodData.date !== currentDate) {
      fetchNasaApodData(currentDate);
    }
    loadFavoritesList();
  }, [currentDate, fetchNasaApodData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update favorited state when favorites list or current APOD changes
  useEffect(() => {
    if (apodData) {
      setIsFavorited(favorites.some((item) => item.date === apodData.date));
    }
  }, [favorites, apodData]);

  // Toggle favorite trigger
  const handleToggleFavorite = async () => {
    if (!apodData) return;
    try {
      const updatedList = await toggleApodFavorite(apodData);
      setFavorites(updatedList);
    } catch (e) {
      console.warn('[APOD Screen] Error saving favorite:', e);
    }
  };

  // Date step navigations
  const handlePrevDay = () => {
    const newDateStr = adjustDate(currentDate, -1);
    setCurrentDate(newDateStr);
    fetchNasaApodData(newDateStr);
  };

  const handleNextDay = () => {
    if (currentDate >= maxDate) return;
    const newDateStr = adjustDate(currentDate, 1);
    setCurrentDate(newDateStr);
    fetchNasaApodData(newDateStr);
  };

  const isToday = useMemo(() => {
    return currentDate >= maxDate;
  }, [currentDate, maxDate]);

  // Share APOD info
  const handleShare = async () => {
    if (!apodData) return;
    try {
      await Share.share({
        title: apodData.title,
        message: `Check out today's NASA Astronomy Picture of the Day: "${apodData.title}"\n${apodData.url}`,
        url: apodData.hdurl || apodData.url,
      });
    } catch (e) {
      console.warn('[APOD Screen] Sharing failed:', e);
    }
  };

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <MaterialCommunityIcons name="chevron-left" size={30} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>APOD</Text>
          <View style={styles.headerRight}>
            {apodData && (
              <>
                <TouchableOpacity onPress={handleShare} style={styles.actionIcon} activeOpacity={0.7}>
                  <MaterialCommunityIcons name="share-variant" size={22} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleToggleFavorite} style={styles.actionIcon} activeOpacity={0.7}>
                  <MaterialCommunityIcons
                    name={isFavorited ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFavorited ? COLORS.accent : COLORS.primary}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Date Navigator Bar */}
        <View style={styles.dateSelector}>
          <TouchableOpacity onPress={handlePrevDay} style={styles.dateNavBtn} activeOpacity={0.7}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.primary} />
            <Text style={styles.dateNavText}>PREV</Text>
          </TouchableOpacity>

          <View style={styles.dateDisplay}>
            <MaterialCommunityIcons name="calendar" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.dateText}>{currentDate}</Text>
          </View>

          <TouchableOpacity
            onPress={handleNextDay}
            style={[styles.dateNavBtn, isToday && styles.dateNavBtnDisabled]}
            disabled={isToday}
            activeOpacity={0.7}
          >
            <Text style={[styles.dateNavText, isToday && styles.dateNavTextDisabled]}>NEXT</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={isToday ? 'rgba(255, 255, 255, 0.2)' : COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Main Feed */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Downloading cosmic coordinates...</Text>
            </View>
          ) : (
            <>
              {error && (
                <View style={styles.errorBanner}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={18} color={COLORS.warning} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Picture/Media Card */}
              {apodData && (
                <View style={styles.imageCard}>
                  {apodData.media_type === 'image' ? (
                    <Image source={{ uri: apodData.url }} style={styles.apodImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.videoPlaceholder}>
                      <LinearGradient
                        colors={['rgba(0, 229, 255, 0.1)', 'rgba(0, 0, 0, 0.5)']}
                        style={styles.videoPlaceholderGradient}
                      >
                        <MaterialCommunityIcons name="play-circle-outline" size={60} color={COLORS.primary} />
                        <Text style={styles.videoText}>NASA Video Broadcast</Text>
                        <Text style={styles.videoSubtext}>Tap share to broadcast outside OrbitX</Text>
                      </LinearGradient>
                    </View>
                  )}
                </View>
              )}

              {/* Explanation Text Details */}
              {apodData && (
                <BlurView intensity={35} tint="dark" style={styles.detailsPanel}>
                  <Text style={styles.apodTitle}>{apodData.title}</Text>
                  
                  <View style={styles.metaRow}>
                    <View style={styles.metaBadge}>
                      <Text style={styles.metaBadgeText}>COSMIC ARCHIVE</Text>
                    </View>
                    <Text style={styles.copyrightText}>
                      © {apodData.copyright ? apodData.copyright.replace(/[\n\r]/g, ' ') : 'NASA'}
                    </Text>
                  </View>

                  <Text style={styles.explanationText}>{apodData.explanation}</Text>
                </BlurView>
              )}

              {/* Favorites Gallery */}
              {favorites.length > 0 && (
                <View style={styles.favoritesSection}>
                  <Text style={styles.sectionTitle}>[ SAVED OBSERVATIONS ]</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favoritesGrid}>
                    {favorites.map((fav) => (
                      <TouchableOpacity
                        key={fav.date}
                        style={styles.favoriteCard}
                        onPress={() => setCurrentDate(fav.date)}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri: fav.url }} style={styles.favoriteThumb} />
                        <View style={styles.favCardOverlay}>
                          <Text style={styles.favoriteTitle} numberOfLines={1}>
                            {fav.title}
                          </Text>
                          <Text style={styles.favoriteDate}>{fav.date}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: 'rgba(4, 7, 20, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  dateNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
  },
  dateNavBtnDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'transparent',
  },
  dateNavText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: 10,
    letterSpacing: 0.5,
    marginHorizontal: 2,
  },
  dateNavTextDisabled: {
    color: 'rgba(255, 255, 255, 0.2)',
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
  },
  dateText: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 60,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: SPACING.md,
    letterSpacing: 0.5,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.08)',
    borderColor: 'rgba(255, 184, 0, 0.25)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.warning,
    fontFamily: FONTS.regular,
    fontSize: 11,
    marginLeft: 6,
  },
  imageCard: {
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    backgroundColor: 'rgba(4, 7, 20, 0.5)',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  apodImage: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderGradient: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoText: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginTop: 12,
  },
  videoSubtext: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 11,
    marginTop: 4,
  },
  detailsPanel: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  apodTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  metaBadge: {
    backgroundColor: 'rgba(255, 0, 229, 0.12)',
    borderColor: 'rgba(255, 0, 229, 0.3)',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 10,
  },
  metaBadgeText: {
    color: COLORS.accent,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  copyrightText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  explanationText: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
  },
  favoritesSection: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
  },
  favoritesGrid: {
    paddingRight: SPACING.md,
  },
  favoriteCard: {
    width: 140,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  favoriteThumb: {
    width: '100%',
    height: '100%',
  },
  favCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    padding: 8,
  },
  favoriteTitle: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '700',
  },
  favoriteDate: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: '600',
    marginTop: 2,
  },
});