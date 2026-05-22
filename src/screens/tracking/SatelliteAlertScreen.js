import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundGradient from '../../components/BackgroundGradient';
import { useSatelliteAlerts } from '../../hooks/useSatelliteAlerts';
import { getPassVisibilityStatus, VISIBILITY_STATUS, getCompassDirection } from '../../utils/visibilityFilter';

const SatelliteAlertScreen = () => {
  const { passes, loading, error, notificationsEnabled, toggleNotifications, refresh } = useSatelliteAlerts();
  const [countdown, setCountdown] = useState('');

  const nextPass = passes.length > 0 ? passes[0] : null;

  useEffect(() => {
    if (!nextPass) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = nextPass.startUTC - now;

      if (diff <= 0) {
        setCountdown('PASSING NOW');
      } else {
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        setCountdown(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextPass]);

  const renderPassCard = (pass, isNext = false) => {
    const visibility = getPassVisibilityStatus(pass.maxEl, pass.duration);
    const direction = getCompassDirection(pass.startAz);
    
    return (
      <BlurView intensity={20} style={[styles.card, isNext && styles.nextCard]} key={pass.startUTC}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.passTime}>
              {new Date(pass.startUTC * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.passDate}>
              {new Date(pass.startUTC * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <View style={[styles.badge, styles[`badge${visibility}`]]}>
            <Text style={styles.badgeText}>{visibility}</Text>
          </View>
        </View>

        <View style={styles.cardStats}>
          <View style={styles.statItem}>
            <Ionicons name="trending-up" size={16} color="#00FFFF" />
            <Text style={styles.statLabel}>Max Elev: </Text>
            <Text style={styles.statValue}>{pass.maxEl}°</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color="#00FFFF" />
            <Text style={styles.statLabel}>Duration: </Text>
            <Text style={styles.statValue}>{Math.round(pass.duration / 60)}m</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="compass-outline" size={16} color="#00FFFF" />
            <Text style={styles.statLabel}>Direction: </Text>
            <Text style={styles.statValue}>{direction}</Text>
          </View>
        </View>
      </BlurView>
    );
  };

  return (
    <BackgroundGradient>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Satellite Alerts</Text>
          <Text style={styles.subtitle}>Never miss the ISS passing by</Text>
        </View>

        {/* Toggle Section */}
        <BlurView intensity={30} style={styles.toggleCard}>
          <View style={styles.toggleInfo}>
            <Ionicons name="notifications" size={24} color="#00FFFF" />
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>Proximity Notifications</Text>
              <Text style={styles.toggleDesc}>Alert me 10 mins before visible pass</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#1A1A1A', true: '#00FFFF' }}
            thumbColor={notificationsEnabled ? '#FFFFFF' : '#888'}
          />
        </BlurView>

        {loading ? (
          <ActivityIndicator size="large" color="#00FFFF" style={{ marginTop: 50 }} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refresh} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Countdown Section */}
            {nextPass && (
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownLabel}>NEXT ISS PASS IN</Text>
                <Text style={styles.countdownValue}>{countdown}</Text>
                <View style={styles.radarCircle}>
                   <LinearGradient
                    colors={['rgba(0,255,255,0.1)', 'transparent']}
                    style={styles.radarSweep}
                  />
                  <Ionicons name="rocket" size={40} color="#00FFFF" />
                </View>
              </View>
            )}

            {/* Upcoming Passes */}
            <Text style={styles.sectionTitle}>Upcoming Visible Passes</Text>
            {passes.length > 0 ? (
              passes.map((pass, index) => renderPassCard(pass, index === 0))
            ) : (
              <Text style={styles.noPassesText}>No visible passes predicted for the next 48 hours.</Text>
            )}
          </>
        )}
      </ScrollView>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontFamily: 'Orbitron',
    fontSize: 28,
    color: '#00FFFF',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#AAA',
    fontSize: 16,
    marginTop: 5,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: 15,
  },
  toggleTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleDesc: {
    color: '#888',
    fontSize: 12,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  countdownLabel: {
    fontFamily: 'Orbitron',
    color: '#888',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 10,
  },
  countdownValue: {
    fontFamily: 'Orbitron',
    color: '#FFF',
    fontSize: 42,
    textShadowColor: 'rgba(0,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  radarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  radarSweep: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  sectionTitle: {
    fontFamily: 'Orbitron',
    color: '#FFF',
    fontSize: 18,
    marginBottom: 20,
    letterSpacing: 1,
  },
  card: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  nextCard: {
    borderColor: 'rgba(0,255,255,0.4)',
    backgroundColor: 'rgba(0,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  passTime: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  passDate: {
    color: '#888',
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeGood: { backgroundColor: 'rgba(0,255,100,0.2)' },
  badgeMedium: { backgroundColor: 'rgba(255,200,0,0.2)' },
  badgePoor: { backgroundColor: 'rgba(255,50,50,0.2)' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: { color: '#888', fontSize: 11, marginLeft: 5 },
  statValue: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  errorContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  errorText: {
    color: '#FF5252',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(0,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00FFFF',
  },
  retryText: {
    color: '#00FFFF',
    fontWeight: '600',
  },
  noPassesText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  }
});

export default SatelliteAlertScreen;
