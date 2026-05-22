import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuizNavigator from '../navigation/QuizNavigator';
import LiveTracking from '../screens/LiveTracking';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import SplashScreen from '../screens/SplashScreen';
import AIAssistantScreen from '../screens/ai/AIAssistantScreen';
import HomeDashboard from '../screens/home/HomeDashboard';
import PlanetDetailScreen from '../screens/learning/PlanetDetailScreen';
import PlanetExplorerScreen from '../screens/learning/PlanetExplorerScreen';
import SpaceFactsScreen from '../screens/learning/SpaceFactsScreen';
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
      <Stack.Screen name="HomeDashboard" component={HomeDashboard} />
      <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
      <Stack.Screen name="SatelliteTracker" component={LiveTracking} />
      <Stack.Screen name="PlanetExplorer" component={PlanetExplorerScreen} />
      <Stack.Screen name="PlanetDetail" component={PlanetDetailScreen} />
      <Stack.Screen name="SpaceFacts" component={SpaceFactsScreen} />
      <Stack.Screen name="QuizZone" component={QuizNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;