import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../theme/theme';

const BottomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <BlurView intensity={35} tint="dark" style={styles.blur}>
        <View style={styles.tabContainer}>
          {(state?.routes || []).map((route, index) => {
            const { options } = descriptors?.[route.key] || {};
            const isFocused = state?.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            let iconName;
            if (route.name === 'Home') iconName = isFocused ? 'home' : 'home-outline';
            else if (route.name === 'Tracker') iconName = isFocused ? 'satellite-variant' : 'satellite-variant';
            else if (route.name === 'Explorer') iconName = isFocused ? 'earth' : 'earth';
            else if (route.name === 'Chat') iconName = isFocused ? 'robot' : 'robot-outline';
            else if (route.name === 'Launches') iconName = isFocused ? 'rocket' : 'rocket-launch';
            else if (route.name === 'Profile') iconName = isFocused ? 'account' : 'account-outline';

            return (
              <TouchableOpacity
                key={index}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.iconWrapper,
                  isFocused && styles.activeIconWrapper
                ]}>
                  <MaterialCommunityIcons 
                    name={iconName} 
                    size={22} 
                    color={isFocused ? COLORS.primary : 'rgba(255, 255, 255, 0.45)'} 
                  />
                </View>
                {isFocused && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 12,
    right: 12,
    borderRadius: 22,
    overflow: 'hidden',
    height: 65,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
    backgroundColor: 'rgba(4, 7, 20, 0.3)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  blur: {
    flex: 1,
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.xs,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    bottom: 0,
    ...SHADOWS.neon,
  },
});

export default BottomTabBar;
