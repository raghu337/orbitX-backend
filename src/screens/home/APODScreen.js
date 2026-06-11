import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Linking,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import BackgroundGradient from '../../components/BackgroundGradient';
import GlassCard from '../../components/GlassCard';
import { fetchAPOD, loadApodFavorites, toggleApodFavorite } from '../../services/nasaService';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const { width } = Dimensions.get('window');

const APODScreen = ({ navigation }) => {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [saving, setSaving] = useState(false);

  const isFavorite = useMemo(() => {
    if (!apod) return false;
    return favorites.some((item) => item.date === apod.date);
  }, [apod, favorites]);

  const loadFavorites = async () => {
    const saved = await loadApodFavorites();
    setFavorites(saved);
  };

  const loadApod = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAPOD();
      setApod(data);
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to load NASA Astronomy Picture of the Day.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
    loadApod();
  }, []);

  const handleToggleFavorite = async () => {
    if (!apod) return;
    setSaving(true);
    try {
      const updated = await toggleApodFavorite(apod);
      setFavorites(updated);
    } catch (toggleError) {
      console.warn('[APODScreen] Favorite toggle failed', toggleError);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!apod) return;
    const message = `${apod.title}

${apod.explanation}

${apod.url}`;
    try {
      await Share.share({
        title: apod.title,
        message,
        url: apod.url,
      });
    } catch (shareError) {
      console.warn('[APODScreen] Share failed', shareError);
    }
  };

  const handleOpenSource = async () => {
    if (!apod?.url) return;
    const supported = await Linking.canOpenURL(apod.url);
    if (supported) {
      await Linking.openURL(apod.url);
    }
  };

  const renderIllustration = () => {
    if (loading) {
      return (
        <View style={styles.loadingBlock}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching today’s cosmic vista...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorBlock}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>Unable to load APOD</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadApod} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!apod) {
      return null;
    }

    if (apod.media_type !== 'image') {
      return (
        <View style={styles.videoFallback}>
          <MaterialCommunityIcons name="video-outline" size={48} color={COLORS.warning} />
          <Text style={styles.errorTitle}>APOD is a video today</Text>
          <Text style={styles.errorText}>Tap below to open the NASA source in your browser.</Text>
          <TouchableOpacity style={styles.openButton} onPress={handleOpenSource}>
            <Text style={styles.openButtonText}>Open Video</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <Image
        source={{ uri: apod.hdurl || apod.url }}
        style={styles.apodImage}
        resizeMode="cover"
      />
    );
  };

  return (
    <BackgroundGradient>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>NASA Astronomy Picture of the Day</Text>
        </View>

        <GlassCard style={styles.imageCard}>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaLabel}>DATE</Text>
              <Text style={styles.metaValue}>{apod?.date || '—'}</Text>
            </View>
            <View style={styles.metaPill}> 
              <Text style={styles.metaLabel}>TYPE</Text>
              <Text style={styles.metaValue}>{apod?.media_type?.toUpperCase() || 'IMAGE'}</Text>
            </View>
          </View>
          <View style={styles.apodContainer}>{renderIllustration()}</View>
          {!loading && !error && apod?.copyright ? (
            <Text style={styles.creditText}>© {apod.copyright}</Text>
          ) : null}
        </GlassCard>

        <GlassCard style={styles.detailsCard}>
          <Text style={styles.apodTitle}>{apod?.title || 'Astronomy Picture of the Day'}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleToggleFavorite} disabled={saving || loading || !!error}>
              <MaterialCommunityIcons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? COLORS.error : COLORS.textSecondary}
              />
              <Text style={styles.actionLabel}>{isFavorite ? 'Saved to favorites' : 'Save favorite'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare} disabled={loading || !!error}>
              <MaterialCommunityIcons name="share-variant" size={20} color={COLORS.textSecondary} />
              <Text style={styles.actionLabel}>Share APOD</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionHeading}>Full explanation</Text>
          <Text style={styles.explanationText}>{apod?.explanation || 'No explanation available yet.'}</Text>
          {apod?.hdurl ? (
            <TouchableOpacity style={styles.sourceButton} onPress={handleOpenSource}>
              <Text style={styles.sourceButtonText}>View HD Source</Text>
            </TouchableOpacity>
          ) : null}
        </GlassCard>
      </ScrollView>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  screenTitle: {
    flex: 1,
    fontFamily: FONTS.black,
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 26,
  },
  imageCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metaPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  metaLabel: {
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    fontSize: 10,
    letterSpacing: 1,
  },
  metaValue: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  apodContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    height: width * 0.7,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  apodImage: {
    width: '100%',
    height: '100%',
  },
  loadingBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontFamily: FONTS.black,
    color: COLORS.text,
    fontSize: 18,
    marginTop: SPACING.md,
  },
  errorText: {
    marginTop: SPACING.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
  },
  retryText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
  },
  videoFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  openButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
  },
  openButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
  },
  creditText: {
    marginTop: SPACING.md,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  detailsCard: {
    padding: SPACING.md,
  },
  apodTitle: {
    fontFamily: FONTS.black,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  actionLabel: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  sectionHeading: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  explanationText: {
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 22,
  },
  sourceButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  sourceButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
  },
});

export default APODScreen;
