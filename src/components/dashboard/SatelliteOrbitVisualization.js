import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

/**
 * Real-time satellite orbit visualization with N2YO API data
 * Shows satellites orbiting around Earth with their data
 */
export const SatelliteOrbitVisualization = ({
  satellites = [],
  earthRadius = 100,
  size = 400,
  animationProgress = 0,
}) => {
  const center = size / 2;
  const [visibleSatellites, setVisibleSatellites] = useState(satellites);

  useEffect(() => {
    setVisibleSatellites(satellites);
  }, [satellites]);

  // Calculate satellite position on orbit
  const getSatellitePosition = (satellite, progress) => {
    const orbitRadius = earthRadius + satellite.orbitAltitude || 100;
    const angle = (progress * 360 + (satellite.angle || 0)) * (Math.PI / 180);

    const x = center + Math.cos(angle) * orbitRadius;
    const y = center + Math.sin(angle) * orbitRadius;

    return { x, y, angle };
  };

  const renderOrbitRing = (altitude, index) => {
    const radius = earthRadius + altitude;
    return (
      <Circle
        key={`orbit-${index}`}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#00e5ff"
        strokeWidth={0.5}
        opacity={0.2}
        strokeDasharray="5,5"
      />
    );
  };

  return (
    <Svg width={size} height={size} style={{ backgroundColor: 'transparent' }}>
      {/* Orbit rings for different altitudes */}
      {renderOrbitRing(100, 0)}
      {renderOrbitRing(150, 1)}
      {renderOrbitRing(200, 2)}

      {/* Satellites */}
      <G>
        {visibleSatellites.map((satellite, idx) => {
          const pos = getSatellitePosition(satellite, animationProgress);
          const glowRadius = 4;
          const coreRadius = 2.5;

          return (
            <G key={`satellite-${idx}`}>
              {/* Satellite glow */}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={glowRadius}
                fill="#00e5ff"
                opacity={0.3}
              />

              {/* Satellite core */}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={coreRadius}
                fill="#00e5ff"
              />

              {/* Inner bright spot */}
              <Circle
                cx={pos.x - 0.8}
                cy={pos.y - 0.8}
                r={1}
                fill="#ffffff"
                opacity={0.8}
              />

              {/* Orbit line to Earth center */}
              <Line
                x1={center}
                y1={center}
                x2={pos.x}
                y2={pos.y}
                stroke="#00e5ff"
                strokeWidth={0.5}
                opacity={0.1}
              />

              {/* Satellite label (if space allows) */}
              {satellite.label && (
                <SvgText
                  x={pos.x + 8}
                  y={pos.y - 5}
                  fontSize="10"
                  fill="#00e5ff"
                  opacity={0.7}
                  fontFamily="monospace"
                >
                  {satellite.label.substring(0, 3)}
                </SvgText>
              )}
            </G>
          );
        })}
      </G>
    </Svg>
  );
};
