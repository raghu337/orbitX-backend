import axios from 'axios';
import { useEffect, useState } from 'react';

import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

import * as Location from 'expo-location';

const satellitesList = [
  {
    name: 'ISS SPACE STATION',
    id: 25544
  }
];

export default function LiveTracking() {

  const [location, setLocation] = useState(null);
  const [satellites, setSatellites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSatellites = async () => {

    try {

      const satelliteData = await Promise.all(

        satellitesList.map(async (sat) => {

          const response = await axios.get(
            `https://api.wheretheiss.at/v1/satellites/${sat.id}`
          );

          return {
            ...sat,
            data: response.data
          };

        })

      );

      setSatellites(satelliteData);

    } catch (error) {
      console.log(error);
    }
  };

  const getUserLocation = async () => {

    let { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      alert('Location Permission Denied');
      return;
    }

    let userLocation =
      await Location.getCurrentPositionAsync({});

    setLocation(userLocation.coords);
  };

  useEffect(() => {

    getUserLocation();
    fetchSatellites();

    const interval = setInterval(() => {
      fetchSatellites();
    }, 5000);

    return () => clearInterval(interval);

  }, []);

  useEffect(() => {

    if (location && satellites.length > 0) {
      setLoading(false);
    }

  }, [location, satellites]);

  if (loading) {

    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#00ffff"
        />

        <Text style={styles.loadingText}>
          Connecting To Satellites...
        </Text>
      </View>
    );
  }

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <Text style={styles.header}>
        🚀 ORBITX LIVE TRACKING
      </Text>

      {satellites.map((sat, index) => (

        <View
          key={index}
          style={styles.card}
        >

          <Text style={styles.title}>
            🛰 {sat.name}
          </Text>

          <Text style={styles.text}>
            📍 Latitude:
            {sat.data.latitude.toFixed(4)}
          </Text>

          <Text style={styles.text}>
            🌍 Longitude:
            {sat.data.longitude.toFixed(4)}
          </Text>

          <Text style={styles.text}>
            🛰 Altitude:
            {sat.data.altitude.toFixed(2)} KM
          </Text>

          <Text style={styles.text}>
            ⚡ Velocity:
            {sat.data.velocity.toFixed(2)} KM/H
          </Text>

          <Text style={styles.live}>
            ● LIVE TRACKING
          </Text>

        </View>

      ))}

      <View style={styles.card}>

        <Text style={styles.title}>
          📱 YOUR LOCATION
        </Text>

        <Text style={styles.text}>
          📍 Latitude:
          {location.latitude.toFixed(4)}
        </Text>

        <Text style={styles.text}>
          🌍 Longitude:
          {location.longitude.toFixed(4)}
        </Text>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20
  },

  loader: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center'
  },

  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 18
  },

  header: {
    color: '#00ffff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 25
  },

  card: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20
  },

  title: {
    color: '#00ffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },

  text: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 10
  },

  live: {
    color: '#00ff88',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10
  }

});