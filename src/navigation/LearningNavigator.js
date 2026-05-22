import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlanetExplorerScreen from '../screens/learning/PlanetExplorerScreen';
import PlanetDetailScreen from '../screens/learning/PlanetDetailScreen';
import SolarSystemScreen from '../screens/learning/SolarSystemScreen';

const Stack = createNativeStackNavigator();

const LearningNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="PlanetExplorer" component={PlanetExplorerScreen} />
      <Stack.Screen name="PlanetDetail" component={PlanetDetailScreen} />
      <Stack.Screen name="SolarSystem" component={SolarSystemScreen} />
    </Stack.Navigator>
  );
};

export default LearningNavigator;
