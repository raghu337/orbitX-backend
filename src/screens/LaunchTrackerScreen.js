import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Linking,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BackgroundGradient from '../components/BackgroundGradient';
import GlassCard from '../components/GlassCard';
import { COLORS, FONTS, SPACING, SHADOWS } from '../theme/theme';

const MOCK_API_DATA = [
  {
    id: '1',
    agency: 'SpaceX',
    country: 'USA',
    mission: 'Starlink Group 10-50 (29 Broadband Satellites)',
    vehicle: 'Falcon 9',
    date: '2026-07-05T10:36:00Z',
    pad: 'SLC-40, Cape Canaveral, Florida',
    status: 'Confirmed',
    videoUrl: 'https://www.spacex.com/launches/'
  },
  {
    id: '2',
    agency: 'SpaceX',
    country: 'International',
    mission: 'Transporter-17 (81 Multi-National Micro-Satellites)',
    vehicle: 'Falcon 9',
    date: '2026-07-07T07:12:00Z',
    pad: 'SLC-4E, Vandenberg SFB, California',
    status: 'Scheduled',
    videoUrl: 'https://www.spacex.com/launches/'
  },
  {
    id: '3',
    agency: 'CASC',
    country: 'China',
    mission: 'Yaogan-44 (Reconnaissance Satellite Array)',
    vehicle: 'Long March 4C',
    date: '2026-07-04T09:31:00Z',
    pad: 'Taiyuan Launch Center, China',
    status: 'Confirmed',
    videoUrl: 'http://www.cnsa.gov.cn/'
  },
  {
    id: '4',
    agency: 'ISRO',
    country: 'India',
    mission: "Mission Aagaman (India's First Privately Built Rocket Launch - 450km LEO Payload Deployment)",
    vehicle: 'Vikram-1 (Fully Stacked)',
    date: '2026-07-12T05:30:00Z',
    pad: 'First Launch Pad (FLP), Satish Dhawan Space Centre, Sriharikota',
    status: 'Scheduled',
    videoUrl: 'https://www.isro.gov.in/'
  },
  {
    id: '5',
    agency: 'Roscosmos',
    country: 'International',
    mission: 'Soyuz MS-29 (International Space Station Logistics Crew Flight)',
    vehicle: 'Soyuz-2.1a',
    date: '2026-07-14T14:47:00Z',
    pad: 'Baikonur Cosmodrome, Kazakhstan',
    status: 'Confirmed',
    videoUrl: 'https://www.tvroscosmos.ru/'
  },
  {
    id: '6',
    agency: 'Rocket Lab',
    country: 'International',
    mission: 'Kinéis IoT Deployment (5 Commercial Satellites)',
    vehicle: 'Electron',
    date: '2026-07-17T12:00:00Z',
    pad: 'LC-1A, Mahia Peninsula, New Zealand',
    status: 'Scheduled',
    videoUrl: 'https://www.youtube.com/c/RocketLabNZ'
  }
];

const CountdownTimer = ({ launch }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const targetTime = Date.parse(launch.date);
    const timeDelta = targetTime - Date.now();
    return timeDelta > 0 ? timeDelta : 0;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const targetTime = Date.parse(launch.date);
      const timeDelta = targetTime - Date.now();
      const remaining = timeDelta > 0 ? timeDelta : 0;
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(timer);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launch.date]);

  if (timeLeft <= 0) {
    return (
      <View style={styles.timerContainer}>
        <Text style={styles.timerExpired}>IN FLIGHT / LAUNCHED</Text>
      </View>
    );
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <View style={styles.timerContainer}>
      <View style={styles.timerSegment}>
        <View style={styles.glowingBadge}>
          <Text style={styles.timerNumber}>{formatNumber(days)}</Text>
        </View>
        <Text style={styles.timerLabel}>DAYS</Text>
      </View>
      <Text style={styles.timerDivider}>:</Text>
      <View style={styles.timerSegment}>
        <View style={styles.glowingBadge}>
          <Text style={styles.timerNumber}>{formatNumber(hours)}</Text>
        </View>
        <Text style={styles.timerLabel}>HRS</Text>
      </View>
      <Text style={styles.timerDivider}>:</Text>
      <View style={styles.timerSegment}>
        <View style={styles.glowingBadge}>
          <Text style={styles.timerNumber}>{formatNumber(minutes)}</Text>
        </View>
        <Text style={styles.timerLabel}>MIN</Text>
      </View>
      <Text style={styles.timerDivider}>:</Text>
      <View style={styles.timerSegment}>
        <View style={styles.glowingBadge}>
          <Text style={styles.timerNumber}>{formatNumber(seconds)}</Text>
        </View>
        <Text style={styles.timerLabel}>SEC</Text>
      </View>
    </View>
  );
};

const LaunchTrackerScreen = ({ navigation }) => {
  if (navigation && !navigation.openDrawer) {
    const { openDrawer } = require('../navigation/RootNavigation');
    navigation.openDrawer = openDrawer;
  }
  const [launchData, setLaunchData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('All');
  const [latency, setLatency] = useState(28.4);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate between 28.1 and 28.9
      const random = 28 + Math.floor(Math.random() * 10) / 10;
      setLatency(random);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchGlobalLaunches = async () => {
      try {
        setIsLoading(true);
        // Simulate a network request delay for robust API state representation
        await new Promise((resolve) => setTimeout(resolve, 800));
        setLaunchData(MOCK_API_DATA);
      } catch (_err) {
        Alert.alert('Error', 'Failed to fetch global launch data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalLaunches();
  }, []);

  const filteredLaunches = selectedTab === 'All'
    ? launchData
    : launchData.filter((item) => item.agency === selectedTab || item.country === selectedTab);

  const handleWatchLive = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to open URL', `Cannot launch web browser for: ${url}`);
      }
    } catch (_err) {
      Alert.alert('Error', 'An error occurred while trying to open the stream.');
    }
  };

  const getAgencyColor = (agency) => {
    switch (agency) {
      case 'SpaceX': return COLORS.accent; // Neon Pink
      case 'NASA': return COLORS.primary; // Neon Cyan
      case 'ISRO': return COLORS.success; // Neon Green
      case 'ULA': return COLORS.primary; // Neon Blue
      case 'JAXA': return '#9B59B6'; // Purple
      case 'CASC': return COLORS.warning; // Neon Orange/Yellow
      case 'Arianespace': return '#D35400'; // Deep Orange
      case 'Rocket Lab': return '#1ABC9C'; // Teal
      case 'Roscosmos': return '#E74C3C'; // Red
      default: return COLORS.textSecondary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return COLORS.success;
      case 'Scheduled': return COLORS.warning;
      case 'Planned': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  const renderLaunchItem = ({ item }) => {
    const agencyColor = getAgencyColor(item.agency);
    const statusColor = getStatusColor(item.status);

    return (
      <GlassCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerTitleContainer}>
            <View style={[styles.agencyBadge, { borderColor: agencyColor, backgroundColor: `${agencyColor}10` }]}>
              <Text style={[styles.agencyText, { color: agencyColor }]}>{item.agency}</Text>
            </View>
            <Text style={styles.rocketText}>{item.vehicle || item.rocket}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="package-variant-closed" size={16} color="rgba(255, 255, 255, 0.5)" />
            <Text style={styles.detailText} numberOfLines={1}>
              <Text style={styles.detailLabel}>Payload: </Text>{item.mission || item.payload}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color="rgba(255, 255, 255, 0.5)" />
            <Text style={styles.detailText} numberOfLines={2}>
              <Text style={styles.detailLabel}>Location: </Text>{item.pad}
            </Text>
          </View>
        </View>

        <View style={styles.countdownWrapper}>
          <Text style={styles.countdownTitle}>T-MINUS COUNTDOWN</Text>
          <CountdownTimer launch={item} />
        </View>

        <TouchableOpacity
          style={[styles.watchButton, { borderColor: agencyColor }]}
          onPress={() => handleWatchLive(item.videoUrl || item.streamUrl)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="video" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.watchButtonText}>Watch Live Stream</Text>
        </TouchableOpacity>
      </GlassCard>
    );
  };

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <View style={{ zIndex: 999, elevation: 10, padding: 10 }}>
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={styles.burgerButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="menu" size={26} color="#00E5FF" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerTitleWrapper}>
            <Text style={styles.title}>LAUNCH TRACKER</Text>
            <Text style={styles.subtitle}>Track upcoming cosmic voyages</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* High-Density Telemetry Header Grid */}
        <View style={styles.telemetryWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.telemetryScrollContainer}
          >
            <View style={styles.telemetryCard}>
              <Text style={styles.telemetryLabel}>ACTIVE CATALOGED BIRDS</Text>
              <View style={styles.telemetryValueRow}>
                <View style={styles.greenDot} />
                <Text style={styles.telemetryValue}>19,240 Satellites tracked</Text>
              </View>
            </View>

            <View style={styles.telemetryCard}>
              <Text style={styles.telemetryLabel}>GLOBAL DOWNLINK HEALTH</Text>
              <Text style={styles.telemetryValue}>99.82% Operational Capacity</Text>
            </View>

            <View style={styles.telemetryCard}>
              <Text style={styles.telemetryLabel}>AVERAGE SIGNAL LATENCY</Text>
              <Text style={styles.telemetryValue}>{latency.toFixed(1)} ms (Optimized)</Text>
            </View>
          </ScrollView>
        </View>

        <View style={{ height: 60 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContainer}
          >
            {['All', 'SpaceX', 'ISRO', 'China', 'Europe', 'International'].map((tab) => {
              const isActive = selectedTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.filterTab,
                    isActive && styles.activeFilterTab,
                    isActive && { borderColor: COLORS.primary }
                  ]}
                  onPress={() => setSelectedTab(tab)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.activeFilterText
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching Global Schedules...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredLaunches}
            keyExtractor={(item) => item.id}
            renderItem={renderLaunchItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="rocket-off" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>No launches found for {selectedTab}</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  burgerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    letterSpacing: 2,
    ...SHADOWS.neon,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  filterScrollContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    height: 50,
  },
  filterTab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 70,
    alignItems: 'center',
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  filterText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 110, // Prevent overlay with custom absolute tab bar
  },
  card: {
    marginBottom: SPACING.md,
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  agencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 10,
  },
  agencyText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
  rocketText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  detailsContainer: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  detailLabel: {
    fontFamily: FONTS.medium,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  countdownWrapper: {
    backgroundColor: 'rgba(4, 7, 20, 0.4)',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.05)',
  },
  countdownTitle: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerSegment: {
    alignItems: 'center',
    minWidth: 45,
  },
  timerNumber: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#00E5FF',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  timerLabel: {
    fontSize: 8,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  timerDivider: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginHorizontal: 6,
    alignSelf: 'center',
    marginTop: -12,
  },
  glowingBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderColor: 'rgba(0, 229, 255, 0.25)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  telemetryWrapper: {
    height: 70,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  telemetryScrollContainer: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  telemetryCard: {
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    minWidth: 185,
    height: 52,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  telemetryLabel: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  telemetryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  telemetryValue: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#00E5FF',
    fontWeight: 'bold',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
    marginRight: 6,
  },
  timerExpired: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.accent,
    letterSpacing: 1,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  watchButtonText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginTop: 12,
    letterSpacing: 1,
  },
});

export default LaunchTrackerScreen;
