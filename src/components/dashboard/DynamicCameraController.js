import { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Dynamic Camera Controller for Cinematic Movement
 * Handles smooth camera panning, orbiting, and parallax effects
 * Optimized for 60 FPS performance
 */
export const useDynamicCamera = (isActive = true, cameraMode = 'idle') => {
  // Camera position (X, Y, Z)
  const cameraX = useRef(new Animated.Value(0)).current;
  const cameraY = useRef(new Animated.Value(0)).current;
  const cameraZ = useRef(new Animated.Value(1)).current;

  // Camera rotation
  const cameraRotationX = useRef(new Animated.Value(0)).current;
  const cameraRotationY = useRef(new Animated.Value(0)).current;
  const cameraRotationZ = useRef(new Animated.Value(0)).current;

  // Parallax depth
  const parallaxDepth = useRef(new Animated.Value(1)).current;

  // Camera modes: 'idle', 'orbiting', 'tracking', 'focus'
  useEffect(() => {
    if (!isActive) return;

    let animationSequence = [];

    switch (cameraMode) {
      case 'orbiting':
        // Smooth orbital camera movement around Earth
        animationSequence = [
          Animated.timing(cameraRotationY, {
            toValue: 360,
            duration: 25000,
            useNativeDriver: false,
          }),
        ];
        break;

      case 'idle':
        // Slow gentle panning
        animationSequence = [
          Animated.parallel([
            Animated.timing(cameraRotationX, {
              toValue: 15,
              duration: 4000,
              useNativeDriver: false,
            }),
            Animated.timing(cameraRotationY, {
              toValue: 30,
              duration: 5000,
              useNativeDriver: false,
            }),
          ]),
          Animated.parallel([
            Animated.timing(cameraRotationX, {
              toValue: -15,
              duration: 4000,
              useNativeDriver: false,
            }),
            Animated.timing(cameraRotationY, {
              toValue: -30,
              duration: 5000,
              useNativeDriver: false,
            }),
          ]),
        ];
        break;

      case 'tracking':
        // Dynamic tracking with subtle movement
        animationSequence = [
          Animated.timing(cameraZ, {
            toValue: 1.2,
            duration: 2000,
            useNativeDriver: false,
          }),
        ];
        break;

      case 'focus':
        // Zoom in with smooth rotation
        animationSequence = [
          Animated.parallel([
            Animated.timing(cameraZ, {
              toValue: 0.6,
              duration: 1500,
              useNativeDriver: false,
            }),
            Animated.timing(parallaxDepth, {
              toValue: 1.5,
              duration: 1500,
              useNativeDriver: false,
            }),
          ]),
        ];
        break;

      default:
        return;
    }

    // Create looped sequence for continuous animation
    if (cameraMode === 'idle') {
      const sequence = Animated.sequence(animationSequence);
      const loop = Animated.loop(sequence);
      loop.start();
      return () => loop.stop();
    } else if (cameraMode === 'orbiting') {
      const loop = Animated.loop(animationSequence[0]);
      loop.start();
      return () => loop.stop();
    } else {
      const animation = Animated.sequence(animationSequence);
      animation.start();
      return () => animation.stop();
    }
  }, [isActive, cameraMode, cameraRotationX, cameraRotationY, cameraZ, parallaxDepth]);

  // Convert animated values to transforms
  const getCameraTransform = () => {
    return {
      cameraX,
      cameraY,
      cameraZ,
      cameraRotationX,
      cameraRotationY,
      cameraRotationZ,
      parallaxDepth,
    };
  };

  // Manually set camera position (for tracking mode)
  const setCameraPosition = (x, y, z) => {
    Animated.parallel([
      Animated.timing(cameraX, {
        toValue: x,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(cameraY, {
        toValue: y,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(cameraZ, {
        toValue: z,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Reset camera to default
  const resetCamera = () => {
    Animated.parallel([
      Animated.timing(cameraX, { toValue: 0, duration: 800, useNativeDriver: false }),
      Animated.timing(cameraY, { toValue: 0, duration: 800, useNativeDriver: false }),
      Animated.timing(cameraZ, { toValue: 1, duration: 800, useNativeDriver: false }),
      Animated.timing(cameraRotationX, { toValue: 0, duration: 800, useNativeDriver: false }),
      Animated.timing(cameraRotationY, { toValue: 0, duration: 800, useNativeDriver: false }),
      Animated.timing(cameraRotationZ, { toValue: 0, duration: 800, useNativeDriver: false }),
      Animated.timing(parallaxDepth, { toValue: 1, duration: 800, useNativeDriver: false }),
    ]).start();
  };

  return {
    getCameraTransform,
    setCameraPosition,
    resetCamera,
    cameraX,
    cameraY,
    cameraZ,
    cameraRotationX,
    cameraRotationY,
    cameraRotationZ,
    parallaxDepth,
  };
};
