import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import liveSatelliteService from '../../services/liveSatelliteService';
import notificationService from '../../services/notificationService';

export default function OrbitVisualizationScreen() {
  const [satellites, setSatellites] = useState([]);
  const [userLocation, setUserLocation] = useState({
    latitude: 15.5047,
    longitude: 77.3760,
  });

  const distanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    let mounted = true;

    const SATELLITE_IDS = [
      25544,
      20580,
      25338,
      25994,
      27424,
      28654,
      33591,
      38771,
    ];

    const initial = SATELLITE_IDS.map((id) => ({
      id,
      noradId: id,
      name: `SAT ${id}`,
      category: 'LIVE',
      telemetry: {
        latitude: 0,
        longitude: 0,
        altitude: 400,
        speed: 0,
        orbitType: 'LEO',
        visibility: false,
        signalStrength: 0.5,
        nextPass: 'Calculating...',
      },
    }));

    setSatellites(initial);

    const notified = {};

    const unsubscribe = liveSatelliteService.subscribe(
      SATELLITE_IDS,

      async (updates) => {
        if (!mounted) return;

        console.log('SAT UPDATE:', updates);

        setSatellites((prev) => {
          const list = [...prev];

          updates.forEach((u) => {
            const idx = list.findIndex(
              (p) => p.noradId === u.noradId
            );

            const payload = {
              ...(list[idx] || {}),
              id: u.noradId,
              noradId: u.noradId,
              name: u.name || `SAT ${u.noradId}`,
              category: 'LIVE',

              telemetry: {
                latitude: u.latitude || 0,
                longitude: u.longitude || 0,
                altitude: u.altitude || 0,
                speed: u.speed || 0,
                orbitType: u.orbitType || 'LEO',
                visibility: u.visibility || false,
                signalStrength:
                  u.signalStrength || 0.8,
                nextPass:
                  u.nextPass ||
                  new Date(
                    Date.now() + 3600000
                  ).toLocaleTimeString(),
              },
            };

            if (idx >= 0) {
              list[idx] = payload;
            } else {
              list.push(payload);
            }

            const d = distanceKm(
              userLocation.latitude,
              userLocation.longitude,
              payload.telemetry.latitude,
              payload.telemetry.longitude
            );

            if (
              d < 500 &&
              payload.telemetry.visibility &&
              !notified[payload.noradId]
            ) {
              notified[payload.noradId] = true;

              notificationService.scheduleLocalNotification(
                `${payload.name} nearby`,
                `${Math.round(d)} km away`,
                1
              );
            }
          });

          return [...list];
        });
      },

      5000
    );

    return () => {
      mounted = false;
      unsubscribe && unsubscribe();
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        🚀 ORBITX LIVE TRACKING
      </Text>

      <View style={styles.card}>
        <Text style={styles.heading}>
          📱 YOUR LOCATION
        </Text>

        <Text style={styles.info}>
          📍 Latitude: {userLocation.latitude}
        </Text>

        <Text style={styles.info}>
          🌍 Longitude: {userLocation.longitude}
        </Text>
      </View>

      {satellites.map((sat) => (
        <View key={sat.id} style={styles.card}>
          <Text style={styles.heading}>
            🛰 {sat.name}
          </Text>

          <Text style={styles.info}>
            Lat: {sat.telemetry.latitude}
          </Text>

          <Text style={styles.info}>
            Lon: {sat.telemetry.longitude}
          </Text>

          <Text style={styles.info}>
            Alt: {sat.telemetry.altitude} km
          </Text>

          <Text style={styles.info}>
            Speed: {sat.telemetry.speed}
          </Text>

          <Text style={styles.info}>
            Orbit: {sat.telemetry.orbitType}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020b2d',
    padding: 20,
  },

  title: {
    fontSize: 28,
    color: '#00f0ff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#0c1838',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
  },

  heading: {
    color: '#00f0ff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  info: {
    color: 'white',
    fontSize: 18,
    marginBottom: 5,
  },
});