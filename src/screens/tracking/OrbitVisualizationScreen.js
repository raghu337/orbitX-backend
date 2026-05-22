import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Easing, FlatList, StyleSheet, Text, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import { LIVE_SATELLITES } from '../../data/liveSatellites';
import gpsService from '../../services/gpsService';
import liveSatelliteService from '../../services/liveSatelliteService';
import notificationService from '../../services/notificationService';
import passPredictionService from '../../services/passPredictionService';
import satelliteService from '../../services/satelliteService';

const { width } = Dimensions.get('window');
const ORBIT_SIZE = Math.min(360, width - 24);

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function formatCountdown(targetISOString) {
  if (!targetISOString) return '—';
  const target = new Date(targetISOString);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'Now';
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export default function OrbitVisualizationScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [satellites, setSatellites] = useState([]);
  const [passPredictions, setPassPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const loc = await gpsService.getCurrentLocationSafe();
        if (loc) {
          setUserLocation({ latitude: loc.latitude, longitude: loc.longitude, altitude: loc.altitude });
        }
        await notificationService.registerForPushNotificationsAsync();
      } catch (err) {
        // ignore location errors, we'll use default location
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadPasses = async () => {
      if (!userLocation) {
        // If no user location, use a default observer location
        const defaultObserver = { latitude: 0, longitude: 0, altitude: 0 };
        const results = {};
        await Promise.all((LIVE_SATELLITES || []).map(async (sat) => {
          try {
            const tle = await satelliteService.fetchTLE(sat.noradId);
            if (!tle) return;
            const passes = await passPredictionService.predictPassesForTLE(tle, defaultObserver, 24, 30);
            if (mounted) results[sat.noradId] = passes.slice(0, 3);
          } catch (e) {
            // ignore single satellite pass prediction failures
          }
        }));
        if (mounted) setPassPredictions(results);
      } else {
        const observer = { latitude: userLocation.latitude, longitude: userLocation.longitude, altitude: userLocation.altitude || 0 };
        const results = {};
        await Promise.all((LIVE_SATELLITES || []).map(async (sat) => {
          try {
            const tle = await satelliteService.fetchTLE(sat.noradId);
            if (!tle) return;
            const passes = await passPredictionService.predictPassesForTLE(tle, observer, 24, 30);
            if (mounted) results[sat.noradId] = passes.slice(0, 3);
          } catch (e) {
            // ignore single satellite pass prediction failures
          }
        }));
        if (mounted) setPassPredictions(results);
      }
    };
    loadPasses();
    return () => { mounted = false; };
  }, [userLocation]);


  useEffect(() => {
    let mounted = true;
    // initial load of satellite meta
    const initial = (LIVE_SATELLITES || []).map((s) => ({
      id: s.noradId || s.norad_id || s.n2yoId,
      name: s.name,
      category: s.category,
      noradId: s.noradId,
      telemetry: {
        latitude: s.latitude || 0,
        longitude: s.longitude || 0,
        altitude: s.altitude || 400,
        speed: s.speed || 7.66,
        orbitType: s.orbitType || 'LEO',
        visibility: s.visibility || false,
        signalStrength: s.signalStrength || 0.5,
      },
    }));
    setSatellites(initial);

    // subscribe to live updates every 5s
    const notified = {};
    const unsubscribe = liveSatelliteService.subscribe(initial.map((s) => s.noradId), async (updates) => {
      if (!mounted) return;
      // merge updates safely
      setSatellites((prev) => {
        const list = Array.isArray(prev) ? [...prev] : initial;
        if (!Array.isArray(updates)) return list;
        
        updates.forEach((u) => {
          const idx = list.findIndex((p) => p.noradId === u.noradId);
          const payload = {
            ...(list[idx] || {}),
            noradId: u.noradId,
            name: u.name || list[idx]?.name || `SAT ${u.noradId}`,
            telemetry: { ...(list[idx]?.telemetry || {}), ...(u || {}) },
          };
          if (idx >= 0) list[idx] = payload;
          else list.push(payload);
        });
        return [...list];
      });

      // notify when satellites are near the user and visible
      try {
        updates.forEach((u) => {
          const user = userLocation;
          if (!user) return;
          const lat = u.latitude;
          const lon = u.longitude;
          if (typeof lat !== 'number' || typeof lon !== 'number') return;
          const d = distanceKm(user.latitude, user.longitude, lat, lon);
          const visible = !!u.visibility;
          if (d < 500 && visible) {
            const last = notified[u.noradId];
            const now = Date.now();
            if (!last || now - last > 10 * 60 * 1000) {
              notified[u.noradId] = now;
              notificationService.scheduleLocalNotification(`${u.name || 'Satellite'} nearby`, `~${Math.round(d)} km away and visible`, 1);
            }
          }
        });
      } catch (e) {
        // ignore notification errors
      }
    }, 5000);

    // animate a subtle orbit rotation
    Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 18000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    return () => {
      mounted = false;
      unsubscribe && unsubscribe();
    };
  }, []);

  function renderItem({ item }) {
    const t = item.telemetry || {};
    const lat = typeof t.latitude === 'number' ? t.latitude.toFixed(4) : '—';
    const lng = typeof t.longitude === 'number' ? t.longitude.toFixed(4) : '—';
    const alt = t.altitude != null ? `${t.altitude.toFixed(1)} km` : '—';
    const spd = t.speed != null ? `${t.speed.toFixed(1)} km/s` : '—';
    const vis = t.visibility != null ? (t.visibility ? 'VISIBLE' : 'NOT VISIBLE') : '—';
    const nextPass = t.nextPass || '—';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="satellite-variant" size={20} color="#33ccff" />
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={[styles.signal, { backgroundColor: t.signalStrength > 0.6 ? '#33ffcc' : '#ffcc33' }]} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Lat:</Text>
          <Text style={styles.value}>{lat}</Text>
          <Text style={styles.label}>Lng:</Text>
          <Text style={styles.value}>{lng}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Alt:</Text>
          <Text style={styles.value}>{alt}</Text>
          <Text style={styles.label}>Speed:</Text>
          <Text style={styles.value}>{spd}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Visibility:</Text>
          <Text style={styles.value}>{vis}</Text>
          <Text style={styles.label}>Next:</Text>
          <Text style={styles.value}>{nextPass}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Distance:</Text>
          <Text style={styles.value}>{userLocation && typeof t.latitude === 'number' && typeof t.longitude === 'number' ? `${distanceKm(userLocation.latitude, userLocation.longitude, t.latitude, t.longitude).toFixed(0)} km` : '—'}</Text>
          <Text style={styles.label}>ETA:</Text>
          <Text style={styles.value}>{formatCountdown(passPredictions[item.noradId]?.[0]?.start)}</Text>
        </View>
      </View>
    );
  }

  if (loading && !satellites.length) return <View style={styles.center}><ActivityIndicator size="large" color="#33ccff" /></View>;
  if (error && !satellites.length) return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;

  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LIVE SATELLITE TRACKING</Text>

      <View style={styles.visualRow}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Svg width={ORBIT_SIZE} height={ORBIT_SIZE} viewBox={`0 0 ${ORBIT_SIZE} ${ORBIT_SIZE}`}>
            <Circle cx={ORBIT_SIZE / 2} cy={ORBIT_SIZE / 2} r={(ORBIT_SIZE / 2) - 8} stroke="#0ff" strokeWidth={0.8} fill="#001018" />
          </Svg>
        </Animated.View>

        <View style={styles.telemetryPanel}>
          <Text style={styles.panelTitle}>Telemetery</Text>
          <Text style={styles.panelText}>Location: {userLocation ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}` : '—'}</Text>
          <Text style={styles.panelText}>Satellites: {satellites.length}</Text>
        </View>
      </View>

      <FlatList
        data={Array.isArray(satellites) ? satellites : []}
        keyExtractor={(i) => String(i.noradId || i.id)}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001018', padding: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#001018' },
  title: { color: '#33ccff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  visualRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  telemetryPanel: { marginLeft: 12, padding: 12, backgroundColor: '#01131a', borderRadius: 8, width: 160 },
  panelTitle: { color: '#33ccff', fontWeight: '700', marginBottom: 6 },
  panelText: { color: '#cfeef7', fontSize: 12, marginBottom: 4 },
  list: { marginTop: 8 },
  card: { backgroundColor: '#02131a', padding: 12, marginRight: 12, width: 320, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#33ccff', fontWeight: '700', marginLeft: 8, flex: 1 },
  signal: { width: 10, height: 10, borderRadius: 5 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  label: { color: '#7fdfff', fontSize: 12, width: 60 },
  value: { color: '#cfeef7', fontSize: 12, flex: 1 },
  error: { color: '#ff6666' },
});