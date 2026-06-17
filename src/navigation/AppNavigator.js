import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuizNavigator from '../navigation/QuizNavigator';
import MainTabNavigator from './MainTabNavigator';
import ApodFavoritesScreen from '../screens/home/ApodFavoritesScreen';
import NasaApodScreen from '../screens/home/NasaApodScreen';
import PlanetDetailScreen from '../screens/learning/PlanetDetailScreen';
import PlanetExplorerScreen from '../screens/learning/PlanetExplorerScreen';
import SpaceFactsScreen from '../screens/learning/SpaceFactsScreen';
import LiveTracking from '../screens/LiveTracking';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import SolarSystem3D from '../screens/learning/SolarSystem3D';
import SpaceChatScreen from '../screens/SpaceChatScreen';
import SplashScreen from '../screens/SplashScreen';
import { COLORS } from '../theme/theme';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="HomeDashboard" component={MainTabNavigator} />
      <Stack.Screen name="AIAssistant" component={SpaceChatScreen} />
      <Stack.Screen name="SpaceChat" component={SpaceChatScreen} />
      <Stack.Screen name="SatelliteTracker" component={LiveTracking} />
      <Stack.Screen name="PlanetExplorer" component={PlanetExplorerScreen} />
      <Stack.Screen name="NasaApod" component={NasaApodScreen} />
      <Stack.Screen name="SolarSystem3D" component={SolarSystem3D} />
      <Stack.Screen name="APODFavorites" component={ApodFavoritesScreen} />
      <Stack.Screen name="PlanetDetail" component={PlanetDetailScreen} />
      <Stack.Screen name="SpaceFacts" component={SpaceFactsScreen} />
      <Stack.Screen name="QuizZone" component={QuizNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;