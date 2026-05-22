import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { COLORS } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

const ScannerOverlay = () => {
  const scanLinePos = useSharedValue(0);

  useEffect(() => {
    scanLinePos.value = withRepeat(
      withTiming(height, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLinePos.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={styles.gridOverlay} />
      <Animated.View style={[styles.scanLine, animatedLineStyle]}>
        <View style={styles.scanGlow} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 229, 255, 0.1)',
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  scanGlow: {
    position: 'absolute',
    top: -20,
    width: '100%',
    height: 40,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
  },
});

export default ScannerOverlay;
