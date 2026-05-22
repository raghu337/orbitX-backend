import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ARSkyScannerScreen from '../screens/ar/ARSkyScannerScreen';
import AIAssistantScreen from '../screens/ai/AIAssistantScreen';

const Stack = createNativeStackNavigator();

const HomeNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ARSkyScanner" component={ARSkyScannerScreen} />
      <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
    </Stack.Navigator>
  );
};

export default HomeNavigator;
