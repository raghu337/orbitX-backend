import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlanetDetailScreen from '../screens/learning/PlanetDetailScreen';
import PlanetExplorerScreen from '../screens/learning/PlanetExplorerScreen';
import SolarSystem3D from '../screens/learning/SolarSystem3D';
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
      <Stack.Screen name="SolarSystem3D" component={SolarSystem3D} />
    </Stack.Navigator>
  );
};

export default LearningNavigator;
