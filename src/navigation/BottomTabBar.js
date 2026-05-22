import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../theme/theme';

const { width } = Dimensions.get('window');

const BottomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <BlurView intensity={30} tint="dark" style={styles.blur}>
        <View style={styles.tabContainer}>
          {(state?.routes || []).map((route, index) => {
            const { options } = descriptors?.[route.key] || {};
            const label = options?.tabBarLabel || route?.name;
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
            if (route.name === 'Home') iconName = 'home-variant';
            else if (route.name === 'Tracker') iconName = 'satellite-variant';
            else if (route.name === 'Learn') iconName = 'book-open-variant';
            else if (route.name === 'Quiz') iconName = 'brain';

            return (
              <TouchableOpacity
                key={index}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name={iconName} 
                  size={24} 
                  color={isFocused ? COLORS.primary : 'rgba(255, 255, 255, 0.4)'} 
                />
                {isFocused && <View style={styles.indicator} />}
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
    bottom: 25,
    left: 20,
    right: 20,
    borderRadius: 25,
    overflow: 'hidden',
    height: 70,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  blur: {
    flex: 1,
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
  },
  indicator: {
    position: 'absolute',
    bottom: -8,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    ...SHADOWS.neon,
  },
});

export default BottomTabBar;
