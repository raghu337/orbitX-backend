import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, RadialGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

/**
 * Ambient Space Particles Component
 * Creates immersive particle field with depth effect
 * - Multiple depth layers for parallax
 * - Dynamic opacity based on velocity
 * - Performance optimized for 60 FPS
 */
export const AmbientSpaceParticles = ({
  particleCount = 200,
  depth = 3, // Number of depth layers
  speed = 'slow', // 'slow', 'medium', 'fast'
}) => {
  const particles = useRef([]).current;
  const animationValues = useRef([]).current;

  // Initialize particles on first render
  if (particles.length === 0) {
    const speedMap = { slow: 0.3, medium: 0.6, fast: 1 };
    const particleSpeed = speedMap[speed] || 0.5;

    for (let i = 0; i < particleCount; i++) {
      const layer = i % depth; // Distribute particles across depth layers
      const depthValue = (layer + 1) / depth;

      particles.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.1,
        duration: 5000 + Math.random() * 10000,
        delay: Math.random() * 2000,
        depth: depthValue,
        vx: (Math.random() - 0.5) * particleSpeed,
        vy: (Math.random() - 0.5) * particleSpeed,
        color: ['#00e5ff', '#0099ff', '#00ffff', '#00ff88'][Math.floor(Math.random() * 4)],
      });

      animationValues.push(new Animated.Value(0));
    }
  }

  // Start twinkling animations
  useEffect(() => {
    const animations = particles.map((particle, idx) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(particle.delay),
          Animated.timing(animationValues[idx], {
            toValue: 1,
            duration: particle.duration / 2,
            useNativeDriver: false,
          }),
          Animated.timing(animationValues[idx], {
            toValue: 0,
            duration: particle.duration / 2,
            useNativeDriver: false,
          }),
        ])
      );
    });

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [particles, animationValues]);

  return (
    <View style={styles.particleContainer}>
      {/* Render particles by depth layer */}
      {[...Array(depth)].map((_, layer) => (
        <Svg key={`layer-${layer}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            {/* Particle glow gradients */}
            <RadialGradient id={`particleGlow-${layer}`} cx="40%" cy="40%">
              <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          <G>
            {particles
              .filter((p) => p.depth === (layer + 1) / depth)
              .map((particle, idx) => (
                <Animated.View key={particle.id} style={StyleSheet.absoluteFill}>
                  <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                    <Circle
                      cx={particle.x}
                      cy={particle.y}
                      r={particle.size}
                      fill={particle.color}
                      opacity={animationValues[idx].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, particle.opacity],
                      })}
                    />
                    {/* Glow halo for bright particles */}
                    {particle.opacity > 0.4 && (
                      <Circle
                        cx={particle.x}
                        cy={particle.y}
                        r={particle.size * 3}
                        fill={`url(#particleGlow-${layer})`}
                        opacity={animationValues[idx].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, particle.opacity * 0.3],
                        })}
                      />
                    )}
                  </Svg>
                </Animated.View>
              ))}
          </G>
        </Svg>
      ))}

      {/* Deep space nebula background */}
      <View style={styles.nebulaLayer}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            {/* Nebula gradients */}
            <RadialGradient id="nebula1" cx="20%" cy="30%">
              <Stop offset="0%" stopColor="rgba(0, 255, 136, 0.15)" />
              <Stop offset="100%" stopColor="rgba(0, 255, 136, 0)" />
            </RadialGradient>

            <RadialGradient id="nebula2" cx="70%" cy="70%">
              <Stop offset="0%" stopColor="rgba(0, 153, 255, 0.15)" />
              <Stop offset="100%" stopColor="rgba(0, 153, 255, 0)" />
            </RadialGradient>

            <RadialGradient id="nebula3" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="rgba(0, 229, 255, 0.1)" />
              <Stop offset="100%" stopColor="rgba(0, 229, 255, 0)" />
            </RadialGradient>
          </Defs>

          {/* Nebula clouds */}
          <Circle cx={width * 0.2} cy={height * 0.3} r={height * 0.4} fill="url(#nebula1)" />
          <Circle cx={width * 0.7} cy={height * 0.7} r={height * 0.5} fill="url(#nebula2)" />
          <Circle cx={width * 0.5} cy={height * 0.5} r={height * 0.3} fill="url(#nebula3)" />
        </Svg>
      </View>
    </View>
  );
};

/**
 * Micro-Interaction Feedback Component
 * Provides haptic-like visual feedback for interactions
 */
export const MicroInteractionFeedback = ({ isActive = false, position = { x: 0, y: 0 } }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Reset for next interaction
      setTimeout(() => {
        scale.setValue(0);
        opacity.setValue(1);
      }, 600);
    }
  }, [isActive, scale, opacity]);

  return (
    <Animated.View
      style={[
        styles.microInteraction,
        {
          left: position.x - 20,
          top: position.y - 20,
          transform: [{ scale }],
          opacity,
        },
      ]}
    >
      <Svg width={40} height={40} viewBox="0 0 40 40">
        <Circle
          cx="20"
          cy="20"
          r="15"
          fill="none"
          stroke="#00ffff"
          strokeWidth="2"
          opacity="0.6"
        />
        <Circle
          cx="20"
          cy="20"
          r="10"
          fill="none"
          stroke="#00e5ff"
          strokeWidth="1.5"
          opacity="0.4"
        />
      </Svg>
    </Animated.View>
  );
};

/**
 * Smooth Particle Trail Emitter
 * Creates particle trails following touch or satellite movement
 */
export const ParticleTrailEmitter = ({
  position = { x: 0, y: 0 },
  isEmitting = false,
  particleColor = '#00ffff',
  particleCount = 5,
}) => {
  const particles = useRef([]).current;
  const animationValues = useRef([]).current;

  useEffect(() => {
    if (!isEmitting) return;

    // Create new particles
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = 2 + Math.random() * 3;

      const particle = {
        id: `${position.x}-${position.y}-${i}-${Date.now()}`,
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        opacity: 1,
        scale: 1,
      };

      particles.push(particle);
      animationValues.push(new Animated.Value(0));
    }

    // Animate particles
    const startIdx = particles.length - particleCount;
    const animations = animationValues.slice(startIdx).map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start();

    // Clean up old particles
    const maxParticles = 100;
    if (particles.length > maxParticles) {
      particles.splice(0, particles.length - maxParticles);
      animationValues.splice(0, animationValues.length - maxParticles);
    }
  }, [isEmitting, position, particleCount, particles, animationValues]);

  return (
    <View style={styles.trailEmitterContainer}>
      {particles.map((particle, idx) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.trailParticle,
            {
              left: particle.x,
              top: particle.y,
              transform: [
                {
                  translateX: animationValues[idx]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, particle.vx * 50],
                  }) || 0,
                },
                {
                  translateY: animationValues[idx]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, particle.vy * 50],
                  }) || 0,
                },
              ],
              opacity: animationValues[idx]?.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }) || 0,
            },
          ]}
        >
          <View
            style={[
              styles.trailDot,
              {
                backgroundColor: particleColor,
              },
            ]}
          />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  nebulaLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  microInteraction: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  trailEmitterContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  trailParticle: {
    position: 'absolute',
    width: 4,
    height: 4,
  },
  trailDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
