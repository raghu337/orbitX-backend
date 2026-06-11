import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

import MapView, { Marker } from 'react-native-maps';

import liveSatelliteService from '../../services/liveSatelliteService';

const SATELLITE_IDS = [25544, 43013, 27424, 33591];

export default function OrbitVisualizationScreen() {
  const [satellites, setSatellites] = useState([]);

  useEffect(() => {
    const unsubscribe = liveSatelliteService.subscribe(
      [SATELLITE_IDS],
      (updates) => {
        console.log('SATELLITES:', updates);

        setSatellites(updates);
      },
      5000
    );

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        🛰 ORBITX LIVE TRACKING
      </Text>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 20,
          longitude: 0,
          latitudeDelta: 120,
          longitudeDelta: 120,
        }}
      >
        {satellites.map((sat) => (
          <Marker
            key={sat.noradId}
            coordinate={{
              latitude: sat.latitude,
              longitude: sat.longitude,
            }}
            title={sat.satname || sat.name}
            description={`Altitude: ${sat.altitude} km`}
          />
        ))}
      </MapView>

      <ScrollView style={styles.scroll}>
        {satellites.map((sat) => (
          <View key={sat.noradId} style={styles.card}>

            <Text style={styles.name}>
              {sat.satname || sat.name}
            </Text>

            <Text style={styles.info}>
              📍 Latitude: {sat.latitude}
            </Text>

            <Text style={styles.info}>
              🌍 Longitude: {sat.longitude}
            </Text>

            <Text style={styles.info}>
              🚀 Altitude: {sat.altitude} km
            </Text>

            <Text style={styles.info}>
              ⚡ Visibility:
              {sat.visibility ? ' VISIBLE' : ' NOT VISIBLE'}
            </Text>

            <Text style={styles.info}>
              🕒 {sat.timestamp}
            </Text>

          </View>
        ))}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020c1b',
  },

  title: {
    color: '#00ffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 10,
  },

  map: {
    height: 300,
    width: '100%',
  },

  scroll: {
    flex: 1,
    padding: 10,
  },

  card: {
    backgroundColor: '#0b1f33',
    padding: 15,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#00ffff',
  },

  name: {
    color: '#00ffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  info: {
    color: 'white',
    fontSize: 15,
    marginBottom: 5,
  },
});

