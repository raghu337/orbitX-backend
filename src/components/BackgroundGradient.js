import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { COLORS } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const Star = ({ size, top, left, delay, duration }) => {
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(Math.random() * 0.8 + 0.2, { duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top,
          left,
          backgroundColor: Math.random() > 0.8 ? COLORS.primary : '#FFFFFF',
        },
        animatedStyle,
      ]}
    />
  );
};

const BackgroundGradient = ({ children, style }) => {
  const stars = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2.5 + 0.5,
      top: Math.random() * height,
      left: Math.random() * width,
      delay: Math.random() * 4000,
      duration: Math.random() * 3000 + 2000,
    }));
  }, []);

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[COLORS.background, COLORS.secondary, '#02040A']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.5 }}
      />
      
      {(stars || []).map((star) => (
        <Star
          key={star.id}
          size={star.size}
          top={star.top}
          left={star.left}
          delay={star.delay}
          duration={star.duration}
        />
      ))}
      
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  star: {
    position: 'absolute',
  },
});

export default BackgroundGradient;
