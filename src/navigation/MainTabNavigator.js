import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ModuleErrorBoundary from '../components/common/ModuleErrorBoundary';
import SpaceChatScreen from '../screens/SpaceChatScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import { COLORS, FONTS } from '../theme/theme';
import BottomTabBar from './BottomTabBar';
import HomeNavigator from './HomeNavigator';
import LearningNavigator from './LearningNavigator';
import TrackingNavigator from './TrackingNavigator';

const Tab = createBottomTabNavigator();

const SafeScreen = ({ component: Component, moduleName }) => {
  const WrappedComponent = (props) => (
    <ModuleErrorBoundary moduleName={moduleName}>
      <Component {...props} />
    </ModuleErrorBoundary>
  );
  WrappedComponent.displayName = `SafeScreen(${moduleName})`;
  return WrappedComponent;
};

const SafeHome = SafeScreen({ component: HomeNavigator, moduleName: 'Home Dashboard' });
const SafeTracker = SafeScreen({ component: TrackingNavigator, moduleName: 'Satellite Tracker' });
const SafeExplorer = SafeScreen({ component: LearningNavigator, moduleName: 'Planet Explorer' });
const SafeChat = SafeScreen({ component: SpaceChatScreen, moduleName: 'AI Space Chatbot' });
const SafeProfile = SafeScreen({ component: SettingsScreen, moduleName: 'User Profile' });

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={SafeHome} />
      <Tab.Screen name="Tracker" component={SafeTracker} />
      <Tab.Screen name="Explorer" component={SafeExplorer} />
      <Tab.Screen name="Chat" component={SafeChat} />
      <Tab.Screen name="Profile" component={SafeProfile} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 20,
    marginBottom: 10,
  },
  placeholderSubText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default MainTabNavigator;
