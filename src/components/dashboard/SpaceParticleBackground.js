import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 150;

/**
 * Animated space particle background with glowing effects
 * Creates twinkling star field with moving particles
 */
export const SpaceParticleBackground = ({
  style,
  particleCount = PARTICLE_COUNT,
}) => {
  const particlesRef = useRef(
    Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5,
      opacity: Math.random() * 0.7 + 0.3,
      duration: Math.random() * 3000 + 2000,
      delay: Math.random() * 1000,
      color: ['#ffffff', '#00e5ff', '#0099ff', '#ffff00'][Math.floor(Math.random() * 4)],
    }))
  ).current;

  const animatedValues = useRef(
    particlesRef.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Start all particle twinkle animations
    const animations = animatedValues.map((anim, idx) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(particlesRef[idx].delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: particlesRef[idx].duration,
            useNativeDriver: false,
          }),
        ])
      );
    });

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, []);

  const renderParticles = () => {
    return particlesRef.map((particle, idx) => {
      const opacity = animatedValues[idx].interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [particle.opacity * 0.3, particle.opacity, particle.opacity * 0.3],
      });

      return (
        <Animated.View
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.radius * 2,
            height: particle.radius * 2,
            borderRadius: particle.radius,
            backgroundColor: particle.color,
            opacity,
            shadowColor: particle.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 3,
          }}
        />
      );
    });
  };

  return (
    <View style={[styles.container, style]}>
      {renderParticles()}

      {/* Additional glow layer with SVG */}
      <Svg
        width={width}
        height={height}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient id="particleGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Subtle animated nebula effect */}
        <Circle
          cx={width * 0.3}
          cy={height * 0.3}
          r={200}
          fill="url(#particleGlow)"
          opacity={0.15}
        />
        <Circle
          cx={width * 0.7}
          cy={height * 0.7}
          r={180}
          fill="url(#particleGlow)"
          opacity={0.12}
        />
        <Circle
          cx={width * 0.5}
          cy={height * 0.5}
          r={150}
          fill="url(#particleGlow)"
          opacity={0.08}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#02040b',
    overflow: 'hidden',
  },
});
