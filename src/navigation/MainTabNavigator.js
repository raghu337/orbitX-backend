import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeNavigator from './HomeNavigator';
import TrackingNavigator from './TrackingNavigator';
import LearningNavigator from './LearningNavigator';
import QuizNavigator from './QuizNavigator';
import BottomTabBar from './BottomTabBar';
import ModuleErrorBoundary from '../components/common/ModuleErrorBoundary';
import { COLORS, FONTS } from '../theme/theme';

const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ route }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>{route.name} Module</Text>
    <Text style={styles.placeholderSubText}>Temporarily disabled for stabilization</Text>
  </View>
);

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
const SafeLearn = SafeScreen({ component: LearningNavigator, moduleName: 'Space Learning' });
const SafeQuiz = SafeScreen({ component: QuizNavigator, moduleName: 'Quiz Zone' });

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
      <Tab.Screen name="Learn" component={SafeLearn} />
      <Tab.Screen name="Quiz" component={SafeQuiz} />
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
