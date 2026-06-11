import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import gpsService from '../../services/gpsService';
import liveSatelliteService, { LIVE_SATELLITES } from '../../services/liveSatelliteService';

const { width, height } = Dimensions.get('window');

export default function SatelliteMapScreen() {
  const [satellites, setSatellites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState(null);
  const mapRef = useRef(null);
  const firstCentered = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const loc = await gpsService.getCurrentLocationSafe();
        if (loc) {
          setUserLoc({ latitude: loc.latitude, longitude: loc.longitude });
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();

    const ids = (LIVE_SATELLITES || []).map((s) => s.noradId).filter(Boolean);
    const unsubscribe = liveSatelliteService.subscribe(ids, (updates) => {
      if (!mounted) return;
      setSatellites((prev) => {
        const next = (prev && Array.isArray(prev)) ? [...prev] : [];
        updates.forEach((u) => {
          const idx = next.findIndex((s) => s.noradId === u.noradId);
          const payload = { noradId: u.noradId, name: (u.name || `SAT ${u.noradId}`), category: u.category || (u && u.category) || null, telemetry: u };
          if (idx >= 0) next[idx] = { ...next[idx], ...payload }; else next.push(payload);
        });
        return next;
      });
      // center map on first received satellite once
      if (!firstCentered.current && updates.length && mapRef.current) {
        const u = updates[0];
        if (u && typeof u.latitude === 'number' && typeof u.longitude === 'number') {
          try {
            mapRef.current.animateToRegion({ latitude: u.latitude, longitude: u.longitude, latitudeDelta: 40, longitudeDelta: 40 }, 800);
            firstCentered.current = true;
          } catch (e) {}
        }
      }
    }, 5000);

    return () => { mounted = false; unsubscribe && unsubscribe(); };
  }, []);

  useEffect(() => {
    console.debug('[SatelliteMapScreen] satellites state length=', satellites.length);
  }, [satellites]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#33ccff" /></View>;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{ latitude: userLoc?.latitude || 20, longitude: userLoc?.longitude || 0, latitudeDelta: 80, longitudeDelta: 80 }}
      >
        {userLoc && (
          <Marker coordinate={userLoc} title="You" pinColor="#33ccff">
            <MaterialCommunityIcons name="crosshairs-gps" size={28} color="#33ccff" />
          </Marker>
        )}

        {(satellites || []).map((s, idx) => {
          const t = s.telemetry || {};
          const lat = typeof t.latitude === 'number' ? t.latitude : null;
          const lng = typeof t.longitude === 'number' ? t.longitude : null;
          if (lat == null || lng == null) return null;
          // compute small orbit segment for visualization
          const path = [];
          for (let i = 0; i < 10; i++) {
            const dt = new Date(Date.now() + i * 60 * 1000);
            const tle = null; // not fetching here to keep UI snappy
            // fallback: draw tiny circle around current point
            const a = (i / 10) * Math.PI * 2;
            path.push({ latitude: lat + (Math.sin(a) * 0.5), longitude: lng + (Math.cos(a) * 0.5) });
          }
          const key = `sat-${s.noradId}-${idx}`;
          // choose color by category or name
          const cat = (s.category || '').toLowerCase();
          let color = '#33ccff';
          if (s.noradId === 25544 || (s.name || '').toLowerCase().includes('iss')) color = '#ffd700';
          else if (cat.includes('starlink') || (s.name || '').toLowerCase().includes('starlink')) color = '#00ffff';
          else if (cat.includes('gps') || (s.name || '').toLowerCase().includes('gps')) color = '#33ff33';
          else if (cat.includes('weather') || (s.name || '').toLowerCase().includes('noaa') || (s.name || '').toLowerCase().includes('npp')) color = '#ff8c00';
          console.debug('[SatelliteMapScreen] rendering marker', key, lat, lng, s.name, 'color=', color);
          return (
            <React.Fragment key={key}>
              <Marker.Animated coordinate={{ latitude: lat, longitude: lng }} title={s.name} description={`Alt: ${t.altitude ?? '—'} km`}>
                <MaterialCommunityIcons name="satellite-variant" size={26} color={color} />
              </Marker.Animated>
              <Polyline coordinates={path} strokeColor={color} strokeWidth={1} />
            </React.Fragment>
          );
        })}
      </MapView>

      <View style={styles.bottomPanel}>
        <Text style={styles.panelTitle}>Live Satellites</Text>
        <Text style={styles.panelSub}>{(satellites || []).length} satellites</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001018' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#001018' },
  map: { flex: 1 },
  bottomPanel: { position: 'absolute', left: 12, right: 12, bottom: 24, padding: 12, backgroundColor: '#01131a', borderRadius: 12 },
  panelTitle: { color: '#33ccff', fontWeight: '700' },
  panelSub: { color: '#cfeef7', fontSize: 12 },
});
