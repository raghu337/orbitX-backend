import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LiveTracking from '../screens/LiveTracking';
import OrbitVisualizationScreen from '../screens/tracking/OrbitVisualizationScreen';
import SatelliteAlertScreen from '../screens/tracking/SatelliteAlertScreen';
import SatelliteDetailScreen from '../screens/tracking/SatelliteDetailScreen';

const Stack = createNativeStackNavigator();

const TrackingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="TrackerMain" component={LiveTracking} />
      <Stack.Screen name="SatelliteDetail" component={SatelliteDetailScreen} />
      <Stack.Screen name="OrbitVisualization" component={OrbitVisualizationScreen} />
      <Stack.Screen name="SatelliteAlerts" component={SatelliteAlertScreen} />
    </Stack.Navigator>
  );
};

export default TrackingNavigator;
