import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SatelliteTrackerScreen from '../screens/tracking/SatelliteTrackerScreen';
import SatelliteDetailScreen from '../screens/tracking/SatelliteDetailScreen';
import OrbitVisualizationScreen from '../screens/tracking/OrbitVisualizationScreen';
import SatelliteAlertScreen from '../screens/tracking/SatelliteAlertScreen';

const Stack = createNativeStackNavigator();

const TrackingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="TrackerMain" component={SatelliteTrackerScreen} />
      <Stack.Screen name="SatelliteDetail" component={SatelliteDetailScreen} />
      <Stack.Screen name="OrbitVisualization" component={OrbitVisualizationScreen} />
      <Stack.Screen name="SatelliteAlerts" component={SatelliteAlertScreen} />
    </Stack.Navigator>
  );
};

export default TrackingNavigator;
