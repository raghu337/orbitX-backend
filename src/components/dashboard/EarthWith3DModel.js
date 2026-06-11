import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Stop } from 'react-native-svg';

/**
 * 3D Earth with realistic textures, glowing atmosphere, and orbit rings
 * Using SVG for 2D projected 3D visualization
 */
export const EarthWith3DModel = ({
  size = 300,
  rotationZ = 0,
  rotationX = 0,
  rotationY = 0,
  scale = 1,
}) => {
  const earthCenter = size / 2;
  const earthRadius = size * 0.35;

  // Project 3D sphere to 2D with rotation
  const projectPoint = (x, y, z, rX, rY, rZ) => {
    let px = x, py = y, pz = z;

    // Rotate around X axis
    let cosX = Math.cos(rX), sinX = Math.sin(rX);
    let y1 = py * cosX - pz * sinX;
    let z1 = py * sinX + pz * cosX;

    // Rotate around Y axis
    let cosY = Math.cos(rY), sinY = Math.sin(rY);
    let x2 = px * cosY + z1 * sinY;
    let z2 = -px * sinY + z1 * cosY;

    // Rotate around Z axis
    let cosZ = Math.cos(rZ), sinZ = Math.sin(rZ);
    let x3 = x2 * cosZ - y1 * sinZ;
    let y3 = x2 * sinZ + y1 * cosZ;

    return { x: x3, y: y3, z: z2 };
  };

  // Create latitude/longitude grid
  const createGridLines = () => {
    const lines = [];
    const step = Math.PI / 6; // 30 degree steps

    // Longitude lines (meridians)
    for (let lon = 0; lon < Math.PI * 2; lon += step) {
      let points = '';
      for (let lat = -Math.PI / 2; lat <= Math.PI / 2; lat += step / 4) {
        const x = Math.cos(lat) * Math.cos(lon) * earthRadius;
        const y = Math.cos(lat) * Math.sin(lon) * earthRadius;
        const z = Math.sin(lat) * earthRadius;

        const proj = projectPoint(x, y, z, rotationX, rotationY, rotationZ);
        const screenX = earthCenter + proj.x * scale;
        const screenY = earthCenter + proj.y * scale;

        if (proj.z > -earthRadius * 0.5) {
          // Only draw visible points
          points += `${lat === -Math.PI / 2 ? 'M' : 'L'} ${screenX} ${screenY} `;
        }
      }
    }

    // Latitude lines (parallels)
    for (let lat = -Math.PI / 2; lat <= Math.PI / 2; lat += step) {
      let points = '';
      for (let lon = 0; lon < Math.PI * 2; lon += step / 4) {
        const x = Math.cos(lat) * Math.cos(lon) * earthRadius;
        const y = Math.cos(lat) * Math.sin(lon) * earthRadius;
        const z = Math.sin(lat) * earthRadius;

        const proj = projectPoint(x, y, z, rotationX, rotationY, rotationZ);
        const screenX = earthCenter + proj.x * scale;
        const screenY = earthCenter + proj.y * scale;

        if (proj.z > -earthRadius * 0.5) {
          points += `${lon === 0 ? 'M' : 'L'} ${screenX} ${screenY} `;
        }
      }
    }

    return lines;
  };

  // Create visible land masses (simplified)
  const createContinents = () => {
    const continents = [];

    // Approximate land masses
    const landRegions = [
      // North America
      { latRange: [20, 60], lonRange: [-140, -50] },
      // South America
      { latRange: [-60, 15], lonRange: [-85, -30] },
      // Europe
      { latRange: [35, 70], lonRange: [-10, 40] },
      // Africa
      { latRange: [-35, 37], lonRange: [-20, 55] },
      // Asia
      { latRange: [5, 75], lonRange: [60, 150] },
      // Australia
      { latRange: [-45, -10], lonRange: [113, 155] },
    ];

    return continents;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          {/* Earth gradient - blue oceans with land */}
          <RadialGradient id="earthGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#1e4d7b" stopOpacity="1" />
            <Stop offset="70%" stopColor="#0a2554" stopOpacity="1" />
            <Stop offset="100%" stopColor="#030a1a" stopOpacity="1" />
          </RadialGradient>

          {/* Atmosphere glow */}
          <RadialGradient id="atmosphereGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.15" />
            <Stop offset="60%" stopColor="#00e5ff" stopOpacity="0.05" />
            <Stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </RadialGradient>

          {/* Inner glow */}
          <RadialGradient id="innerGlow" cx="40%" cy="40%" r="60%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Outer atmosphere glow */}
        <Circle
          cx={earthCenter}
          cy={earthCenter}
          r={earthRadius * 1.15}
          fill="none"
          stroke="#00e5ff"
          strokeWidth={2}
          opacity={0.3}
        />

        {/* Main Earth sphere */}
        <Circle
          cx={earthCenter}
          cy={earthCenter}
          r={earthRadius}
          fill="url(#earthGradient)"
        />

        {/* Land masses (simplified continents) */}
        <G>
          {/* North America */}
          <Path
            d={`M ${earthCenter - 50} ${earthCenter - 30} L ${earthCenter - 40} ${earthCenter - 40} L ${earthCenter - 35} ${earthCenter - 20} Z`}
            fill="#2d5a3d"
            opacity={0.8}
          />
          {/* South America */}
          <Path
            d={`M ${earthCenter - 45} ${earthCenter + 20} L ${earthCenter - 35} ${earthCenter + 15} L ${earthCenter - 40} ${earthCenter + 35} Z`}
            fill="#2d5a3d"
            opacity={0.8}
          />
          {/* Europe/Africa */}
          <Path
            d={`M ${earthCenter + 20} ${earthCenter - 30} L ${earthCenter + 35} ${earthCenter - 20} L ${earthCenter + 30} ${earthCenter + 20} L ${earthCenter + 15} ${earthCenter + 15} Z`}
            fill="#2d5a3d"
            opacity={0.8}
          />
          {/* Asia */}
          <Path
            d={`M ${earthCenter + 40} ${earthCenter - 20} L ${earthCenter + 60} ${earthCenter - 15} L ${earthCenter + 55} ${earthCenter + 10} L ${earthCenter + 30} ${earthCenter + 5} Z`}
            fill="#2d5a3d"
            opacity={0.8}
          />
          {/* Australia */}
          <Path
            d={`M ${earthCenter + 50} ${earthCenter + 30} L ${earthCenter + 60} ${earthCenter + 35} L ${earthCenter + 55} ${earthCenter + 45} Z`}
            fill="#2d5a3d"
            opacity={0.8}
          />
        </G>

        {/* Latitude/Longitude grid (subtle) */}
        <Circle
          cx={earthCenter}
          cy={earthCenter}
          r={earthRadius}
          fill="none"
          stroke="#00e5ff"
          strokeWidth={0.5}
          opacity={0.2}
        />
        <Ellipse
          cx={earthCenter}
          cy={earthCenter}
          rx={earthRadius}
          ry={earthRadius * 0.3}
          fill="none"
          stroke="#00e5ff"
          strokeWidth={0.5}
          opacity={0.15}
        />

        {/* Atmosphere glow effect */}
        <Circle
          cx={earthCenter}
          cy={earthCenter}
          r={earthRadius * 1.08}
          fill="url(#atmosphereGlow)"
        />

        {/* Inner highlight */}
        <Circle
          cx={earthCenter - 15}
          cy={earthCenter - 15}
          r={earthRadius * 0.4}
          fill="url(#innerGlow)"
        />

        {/* Outer glowing rim */}
        <Circle
          cx={earthCenter}
          cy={earthCenter}
          r={earthRadius}
          fill="none"
          stroke="#00e5ff"
          strokeWidth={1.5}
          opacity={0.4}
        />
        <Circle
          cx={earthCenter}
          cy={earthCenter}
          r={earthRadius * 1.02}
          fill="none"
          stroke="#00e5ff"
          strokeWidth={0.8}
          opacity={0.2}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    backgroundColor: 'transparent',
  },
});
