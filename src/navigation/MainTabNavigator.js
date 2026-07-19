import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ModuleErrorBoundary from '../components/common/ModuleErrorBoundary';
import SpaceChatScreen from '../screens/SpaceChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import LaunchTrackerScreen from '../screens/LaunchTrackerScreen';
import SpaceNotesScreen from '../screens/SpaceNotesScreen';
import HomeNavigator from './HomeNavigator';
import LearningNavigator from './LearningNavigator';
import TrackingNavigator from './TrackingNavigator';
import { setDrawerRef } from './RootNavigation';
import { COLORS, FONTS, SPACING } from '../theme/theme';

const Drawer = createDrawerNavigator();

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
const SafeLaunches = SafeScreen({ component: LaunchTrackerScreen, moduleName: 'Launch Tracker' });
const SafeProfile = SafeScreen({ component: ProfileScreen, moduleName: 'User Profile' });
const SafeSpaceNotes = SafeScreen({ component: SpaceNotesScreen, moduleName: 'Space Notes AI' });

const CustomDrawerContent = ({ navigation, state }) => {
  const activeRouteName = state.routeNames[state.index];

  useEffect(() => {
    setDrawerRef({
      open: () => navigation.openDrawer(),
      close: () => navigation.closeDrawer(),
    });
    return () => {
      setDrawerRef(null);
    };
  }, [navigation]);

  return (
    <View style={styles.drawerInner}>
      <View style={styles.drawerHeader}>
        <MaterialCommunityIcons name="orbit" size={36} color="#00E5FF" />
        <Text style={styles.drawerTitle}>ORBITX</Text>
        <Text style={styles.drawerSubtitle}>NAVIGATION</Text>
      </View>

      <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={false}>
        {[
          { route: 'Home', title: 'Home Dashboard', icon: 'home-outline' },
          { route: 'LiveTracking', title: '🛰️ Live Satellite Radar', icon: 'satellite-variant' },
          { route: 'SolarSystem3D', title: '🪐 3D Solar System View', icon: 'earth' },
          { route: 'SpaceChat', title: '🤖 Space AI Knowledge Chat', icon: 'robot-outline' },
          { route: 'LaunchTracker', title: '🚀 Global Launch Hub', icon: 'rocket-outline' },
          { route: 'SpaceNotes', title: '🎓 Space Notes AI', icon: 'school-outline' },
          { route: 'Profile', title: '👤 User Profile', icon: 'account-circle-outline' }
        ].map((item) => {
          const isFocused = activeRouteName === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.drawerRow, isFocused && styles.activeDrawerRow]}
              onPress={() => {
                navigation.navigate(item.route);
                navigation.closeDrawer();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.drawerIconFrame, isFocused && styles.activeDrawerIconFrame]}>
                <MaterialCommunityIcons name={item.icon} size={22} color={isFocused ? '#0b0f19' : '#00E5FF'} />
              </View>
              <Text style={[styles.drawerRowTitle, isFocused && styles.activeDrawerRowTitle]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.drawerFooter}>
        <Text style={styles.drawerFooterText}>v1.1.0 • SYSTEM ACTIVE</Text>
      </View>
    </View>
  );
};

const MainTabNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor: 'rgba(0, 0, 0, 0.55)',
        drawerStyle: {
          width: 280,
          backgroundColor: '#0b0f19',
        },
      }}
    >
      <Drawer.Screen name="Home" component={SafeHome} />
      <Drawer.Screen name="LiveTracking" component={SafeTracker} />
      <Drawer.Screen name="SolarSystem3D" component={SafeExplorer} />
      <Drawer.Screen name="SpaceChat" component={SafeChat} />
      <Drawer.Screen name="LaunchTracker" component={SafeLaunches} />
      <Drawer.Screen name="Profile" component={SafeProfile} />
      <Drawer.Screen name="SpaceNotes" component={SafeSpaceNotes} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerInner: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#0b0f19',
  },
  drawerHeader: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  drawerTitle: {
    fontFamily: FONTS.black,
    fontSize: 24,
    color: '#00E5FF',
    letterSpacing: 3,
    marginTop: 8,
  },
  drawerSubtitle: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginTop: 2,
  },
  drawerContent: {
    flex: 1,
    padding: SPACING.md,
  },
  drawerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 10,
    marginBottom: 8,
  },
  activeDrawerRow: {
    backgroundColor: '#00E5FF',
  },
  drawerIconFrame: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
    marginRight: SPACING.md,
  },
  activeDrawerIconFrame: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  drawerRowTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.text,
  },
  activeDrawerRowTitle: {
    color: '#0b0f19',
  },
  drawerFooter: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  drawerFooterText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
});

export default MainTabNavigator;
