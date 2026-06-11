import { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

/**
 * Satellite Trails Component
 * Renders real-time glowing trails for satellite movement
 * Features:
 * - Glowing trail lines
 * - Fade-out effect (ghosting)
 * - Multiple trail segments
 * - Performance optimized
 */
export const SatelliteTrails = ({
  satellites = [],
  earthRadius = 80,
  size = 280,
  animationProgress = 0,
  trailLength = 20, // number of trail segments
}) => {
  // Keep trail history for each satellite
  const trailHistoryRef = useRef({});

  // Update trail positions based on animation progress
  useEffect(() => {
    satellites.forEach((sat) => {
      if (!trailHistoryRef.current[sat.id]) {
        trailHistoryRef.current[sat.id] = [];
      }

      const trail = trailHistoryRef.current[sat.id];
      const angle = (sat.angle + animationProgress * 3) % 360;
      const radian = (angle * Math.PI) / 180;
      const orbitRadius = earthRadius + sat.orbitAltitude * 0.3;

      const x = size / 2 + Math.cos(radian) * orbitRadius;
      const y = size / 2 + Math.sin(radian) * orbitRadius;

      trail.unshift({ x, y, timestamp: Date.now() });
      if (trail.length > trailLength) {
        trail.pop();
      }
    });
  }, [animationProgress, satellites, earthRadius, size, trailLength]);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        {/* Glowing trail gradient */}
        <LinearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00ffff" stopOpacity="0.8" />
          <Stop offset="50%" stopColor="#00e5ff" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#0099ff" stopOpacity="0" />
        </LinearGradient>

        {/* Blue glow for ISS */}
        <LinearGradient id="issTrail" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00ffff" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#0099ff" stopOpacity="0" />
        </LinearGradient>

        {/* Purple glow for other satellites */}
        <LinearGradient id="otherTrail" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#ff00ff" stopOpacity="0.7" />
          <Stop offset="100%" stopColor="#0099ff" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Render trails for each satellite */}
      {satellites.map((sat, idx) => {
        const trail = trailHistoryRef.current[sat.id] || [];
        const isISS = sat.name.toUpperCase().includes('ISS');
        const gradientId = isISS ? 'issTrail' : 'otherTrail';

        return (
          <G key={sat.id}>
            {/* Draw trail lines */}
            {trail.map((point, i) => {
              if (i >= trail.length - 1) return null;

              const nextPoint = trail[i + 1];
              const opacity = 1 - i / trail.length; // Fade out
              const strokeWidth = 2 - (i / trail.length) * 1.5; // Taper

              return (
                <Line
                  key={`${sat.id}-trail-${i}`}
                  x1={point.x}
                  y1={point.y}
                  x2={nextPoint.x}
                  y2={nextPoint.y}
                  stroke={isISS ? '#00ffff' : '#ff00ff'}
                  strokeWidth={Math.max(0.5, strokeWidth)}
                  opacity={opacity * 0.7}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Trail glow effect */}
            {trail.length > 0 && (
              <Circle
                cx={trail[0].x}
                cy={trail[0].y}
                r="4"
                fill={isISS ? '#00ffff' : '#ff00ff'}
                opacity="0.6"
              />
            )}
          </G>
        );
      })}
    </Svg>
  );
};

/**
 * Animated Orbit Paths Component
 * Shows rotating orbit paths with animated dashes
 */
export const AnimatedOrbitPaths = ({
  size = 280,
  earthRadius = 80,
  orbitCount = 3,
  rotationProgress = 0,
}) => {
  const dashOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dashLoop = Animated.loop(
      Animated.timing(dashOffset, {
        toValue: 50,
        duration: 8000,
        useNativeDriver: false,
      })
    );
    dashLoop.start();
    return () => dashLoop.stop();
  }, [dashOffset]);

  const dashOffsetInterpolation = dashOffset.interpolate({
    inputRange: [0, 50],
    outputRange: ['0', '50'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ rotate: `${rotationProgress}deg` }],
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Orbit gradient - cyan to blue */}
          <LinearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#0099ff" stopOpacity="0.2" />
          </LinearGradient>

          {/* Glow filter for orbits */}
          <LinearGradient id="orbitGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00ffff" stopOpacity="0.8" />
            <Stop offset="50%" stopColor="#00e5ff" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#0099ff" stopOpacity="0.1" />
          </LinearGradient>
        </Defs>

        {/* Center Earth marker */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={earthRadius}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Animated orbit paths */}
        {Array.from({ length: orbitCount }).map((_, i) => {
          const orbitRadius = earthRadius + (i + 1) * 50;
          const glowRadius = orbitRadius + 3;

          return (
            <G key={`orbit-${i}`}>
              {/* Outer glow */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={glowRadius}
                fill="none"
                stroke="url(#orbitGlow)"
                strokeWidth="4"
                opacity="0.3"
                strokeDasharray="5,5"
              />

              {/* Main orbit line with dashes */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={orbitRadius}
                fill="none"
                stroke="url(#orbitGradient)"
                strokeWidth="2"
                strokeDasharray="5,8"
                opacity="0.7"
              />

              {/* Highlight points on orbit */}
              {[0, 90, 180, 270].map((angle) => {
                const radian = (angle * Math.PI) / 180;
                const x = size / 2 + Math.cos(radian) * orbitRadius;
                const y = size / 2 + Math.sin(radian) * orbitRadius;

                return (
                  <Circle key={`point-${i}-${angle}`} cx={x} cy={y} r="1" fill="#00e5ff" opacity="0.5" />
                );
              })}
            </G>
          );
        })}
      </Svg>
    </Animated.View>
  );
};
