import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  withRepeat,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BackgroundGradient from '../components/BackgroundGradient';
import { COLORS, FONTS } from '../theme/theme';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1500 });
    scale.value = withTiming(1, { 
      duration: 1500, 
      easing: Easing.out(Easing.back(1.5)) 
    });

    pulseScale.value = withRepeat(
      withTiming(2, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    if (navigation) {
      const timer = setTimeout(() => {
        navigation.replace('Login');
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [navigation]);

  // Animations disabled for Safe Mode
  // const animatedLogoStyle = useAnimatedStyle(() => ({
  //   opacity: opacity.value,
  //   transform: [{ scale: scale.value }],
  // }));

  // const animatedPulseStyle = useAnimatedStyle(() => ({
  //   transform: [{ scale: pulseScale.value }],
  //   opacity: pulseOpacity.value,
  // }));

  return (
    <BackgroundGradient>
      <View style={styles.container}>
        <View style={[styles.pulseRing]} />
        <View style={[styles.pulseRing2]} />
        
        <View style={[styles.logoContainer]}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="satellite-variant" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.logoText}>OrbitX</Text>
          <View style={styles.line} />
          <Text style={styles.tagline}>Tracking The Cosmos</Text>
        </View>
      </View>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  pulseRing2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: COLORS.accent,
    transform: [{ scale: 1.5 }],
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  logoText: {
    fontFamily: FONTS.black,
    fontSize: 48,
    color: COLORS.text,
    letterSpacing: 8,
    textTransform: 'uppercase',
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  line: {
    width: width * 0.4,
    height: 2,
    backgroundColor: COLORS.primary,
    marginVertical: 10,
    opacity: 0.8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  tagline: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
});

export default SplashScreen;
