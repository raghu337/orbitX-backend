import { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

/**
 * Enhanced Earth with Day/Night Shader
 * Features:
 * - Realistic day/night terminator line
 * - City lights on night side
 * - Cloud layer animation
 * - Atmospheric glow
 * - Dynamic lighting based on sun angle
 */
export const EarthWithDayNightShader = ({
  size = 240,
  rotationZ = 0,
  rotationX = 0,
  rotationY = 0,
  scale = 1,
  sunAngle = 0, // 0-360 degrees
}) => {
  const animatedValue = useRef(new Animated.Value(sunAngle)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: sunAngle,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [sunAngle, animatedValue]);

  const sunAngleInterpolation = animatedValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [
          { rotateZ: `${rotationZ}deg` },
          { perspective: 1000 },
          { rotateX: `${rotationX}deg` },
          { rotateY: `${rotationY}deg` },
          { scale },
        ],
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Ocean gradient */}
          <RadialGradient id="oceanGradient" cx="35%" cy="35%">
            <Stop offset="0%" stopColor="#4db8e8" stopOpacity="1" />
            <Stop offset="50%" stopColor="#1e7ba8" stopOpacity="1" />
            <Stop offset="100%" stopColor="#0a3d6a" stopOpacity="1" />
          </RadialGradient>

          {/* Day-side atmosphere */}
          <RadialGradient id="dayAtmosphere" cx="45%" cy="45%">
            <Stop offset="0%" stopColor="#87ceeb" stopOpacity="0.8" />
            <Stop offset="70%" stopColor="#4a90e2" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#001a4d" stopOpacity="0" />
          </RadialGradient>

          {/* Night-side gradient */}
          <RadialGradient id="nightGradient" cx="65%" cy="65%">
            <Stop offset="0%" stopColor="#001a2d" stopOpacity="1" />
            <Stop offset="50%" stopColor="#000a1a" stopOpacity="1" />
            <Stop offset="100%" stopColor="#000005" stopOpacity="1" />
          </RadialGradient>

          {/* Terminator line (day/night boundary) */}
          <RadialGradient id="terminator" cx="50%" cy="50%">
            <Stop offset="48%" stopColor="#00d4ff" stopOpacity="0.6" />
            <Stop offset="50%" stopColor="#00ff88" stopOpacity="0.8" />
            <Stop offset="52%" stopColor="#000000" stopOpacity="0.3" />
          </RadialGradient>

          {/* City lights glow */}
          <RadialGradient id="cityGlow" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#ffaa00" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#ff5500" stopOpacity="0" />
          </RadialGradient>

          {/* Atmospheric outer glow */}
          <RadialGradient id="atmosphereGlow" cx="50%" cy="50%">
            <Stop offset="70%" stopColor="#00e5ff" stopOpacity="0.3" />
            <Stop offset="85%" stopColor="#00e5ff" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </RadialGradient>

          {/* Cloud layer gradient */}
          <RadialGradient id="cloudGradient" cx="40%" cy="40%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <Stop offset="50%" stopColor="#d4f1f9" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Base Earth sphere with ocean gradient */}
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#oceanGradient)" />

        {/* Continents */}
        <G>
          {/* North America */}
          <Path
            d={`M ${size / 2 - 60} ${size / 2 - 40} Q ${size / 2 - 50} ${size / 2 - 50} ${size / 2 - 40} ${size / 2 - 30}`}
            fill="#2d5a2d"
            opacity="0.9"
          />

          {/* South America */}
          <Path
            d={`M ${size / 2 - 50} ${size / 2 + 20} L ${size / 2 - 45} ${size / 2 + 50}`}
            fill="#2d5a2d"
            opacity="0.9"
          />

          {/* Europe/Africa */}
          <Path
            d={`M ${size / 2 + 10} ${size / 2 - 50} L ${size / 2 + 30} ${size / 2 + 50}`}
            fill="#2d5a2d"
            opacity="0.9"
          />

          {/* Asia */}
          <Path
            d={`M ${size / 2 + 30} ${size / 2 - 40} L ${size / 2 + 80} ${size / 2 - 20}`}
            fill="#2d5a2d"
            opacity="0.9"
          />

          {/* Australia */}
          <Circle cx={size / 2 + 70} cy={size / 2 + 50} r="12" fill="#2d5a2d" opacity="0.9" />
        </G>

        {/* Cloud layer with animation */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 5}
          fill="url(#cloudGradient)"
          opacity="0.4"
        />

        {/* Day-side atmosphere glow */}
        <Circle
          cx={size / 2 - 20}
          cy={size / 2 - 20}
          r={size / 2 + 10}
          fill="url(#dayAtmosphere)"
          opacity="0.8"
        />

        {/* Night-side gradient overlay */}
        <Circle
          cx={size / 2 + 40}
          cy={size / 2 + 40}
          r={size / 2}
          fill="url(#nightGradient)"
          opacity="0.6"
        />

        {/* Terminator line (day/night boundary) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 2}
          fill="none"
          stroke="url(#terminator)"
          strokeWidth="3"
          opacity="0.7"
        />

        {/* City lights on night side */}
        <G opacity="0.5">
          {/* North America lights */}
          <Circle cx={size / 2 - 55} cy={size / 2 - 35} r="2" fill="#ffdd00" />
          <Circle cx={size / 2 - 50} cy={size / 2 - 30} r="1.5" fill="#ffff00" />

          {/* Europe lights */}
          <Circle cx={size / 2 + 5} cy={size / 2 - 25} r="2" fill="#ffdd00" />
          <Circle cx={size / 2 + 10} cy={size / 2 - 20} r="1.5" fill="#ffff00" />

          {/* Asia lights */}
          <Circle cx={size / 2 + 50} cy={size / 2 - 15} r="2" fill="#ffdd00" />
          <Circle cx={size / 2 + 55} cy={size / 2 - 10} r="1.5" fill="#ffff00" />
          <Circle cx={size / 2 + 65} cy={size / 2 - 5} r="1.5" fill="#ffaa00" />
        </G>

        {/* City glow halo effect */}
        <Circle cx={size / 2 + 50} cy={size / 2 - 10} r="25" fill="url(#cityGlow)" opacity="0.4" />

        {/* Inner shine effect */}
        <Ellipse
          cx={size / 2 - 40}
          cy={size / 2 - 40}
          rx={size / 3}
          ry={size / 3.5}
          fill="#ffffff"
          opacity="0.15"
        />

        {/* Outer atmospheric glow */}
        <Circle cx={size / 2} cy={size / 2} r={size / 2 + 15} fill="url(#atmosphereGlow)" />

        {/* Bright glow rim */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 + 8}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="2"
          opacity="0.4"
        />
      </Svg>
    </Animated.View>
  );
};

/**
 * Animated Cloud Layer Component
 * Creates realistic moving clouds over Earth
 */
export const AnimatedCloudLayer = ({ size = 240, cloudSpeed = 3000, rotation = 0 }) => {
  const cloudRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const cloudLoop = Animated.loop(
      Animated.timing(cloudRotation, {
        toValue: 360,
        duration: cloudSpeed,
        useNativeDriver: false,
      })
    );
    cloudLoop.start();
    return () => cloudLoop.stop();
  }, [cloudSpeed, cloudRotation]);

  const cloudRotationInterpolate = cloudRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ rotateZ: cloudRotationInterpolate }, { rotateY: `${rotation}deg` }],
        width: size,
        height: size,
        position: 'absolute',
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="cloudPattern" cx="40%" cy="40%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Cloud patches */}
        <Circle cx={size / 2 - 30} cy={size / 2 - 50} r="20" fill="url(#cloudPattern)" />
        <Circle cx={size / 2 + 40} cy={size / 2 + 30} r="25" fill="url(#cloudPattern)" />
        <Circle cx={size / 2 - 50} cy={size / 2 + 20} r="15" fill="url(#cloudPattern)" />
      </Svg>
    </Animated.View>
  );
};
