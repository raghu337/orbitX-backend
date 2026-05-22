import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { 
  useFonts,
  Orbitron_400Regular,
  Orbitron_500Medium,
  Orbitron_700Bold,
  Orbitron_900Black 
} from '@expo-google-fonts/orbitron';
import AppNavigator from './src/navigation/AppNavigator';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Orbitron: Orbitron_400Regular,
    Orbitron_Medium: Orbitron_500Medium,
    Orbitron_Bold: Orbitron_700Bold,
    Orbitron_Black: Orbitron_900Black,
  });

  const [initError, setInitError] = useState(null);

  useEffect(() => {
    // Safety timeout: Ensure splash hides after 5 seconds no matter what
    const safetyTimer = setTimeout(async () => {
      console.log('[App] Safety timeout reached, forcing splash hide...');
      try {
        await SplashScreen.hideAsync();
      } catch (e) {}
    }, 5000);

    async function prepare() {
      try {
        console.log('[App] Starting preparation...');
        if (fontsLoaded) {
          console.log('[App] Fonts loaded, hiding splash...');
          clearTimeout(safetyTimer);
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.error('[App] Initialization error:', e);
        setInitError(e);
      }
    }
    
    if (fontsLoaded) {
      prepare();
    }

    return () => clearTimeout(safetyTimer);
  }, [fontsLoaded]);

  if (initError) {
    console.warn('[App] Initialization error bypassed:', initError);
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
