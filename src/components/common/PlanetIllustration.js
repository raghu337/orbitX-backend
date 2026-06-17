import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  ClipPath,
  Rect,
  Circle,
  Ellipse,
  Path,
  G,
} from 'react-native-svg';

/**
 * PlanetIllustration Component
 * Renders a stylized, 3D-shaded SVG illustration of a planet
 * based on its name.
 * 
 * @param {string} planetName - The name of the planet (e.g. 'Mercury', 'Venus')
 * @param {number} size - Width and height of the SVG viewport (default: 100)
 */
const PlanetIllustration = ({ planetName = 'Earth', size = 100 }) => {
  const name = planetName.trim().toLowerCase();

  // Common gradients and clips used by multiple planets
  const renderDefs = () => (
    <Defs>
      {/* 3D Sphere Shading Overlay */}
      <RadialGradient
        id="sphereShading"
        cx="30"
        cy="30"
        r="48"
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
        <Stop offset="0.55" stopColor="#000000" stopOpacity="0.0" />
        <Stop offset="1" stopColor="#000000" stopOpacity="0.75" />
      </RadialGradient>

      {/* Saturn & Uranus Front Clip (reusable for 3D ring layering) */}
      <ClipPath id="frontRingClip">
        <Rect x="0" y="50" width="100" height="50" />
      </ClipPath>

      {/* Planet Base Gradients */}
      <LinearGradient id="mercuryBase" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#BDBDBD" />
        <Stop offset="60%" stopColor="#8C7853" />
        <Stop offset="100%" stopColor="#424242" />
      </LinearGradient>

      <LinearGradient id="venusBase" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFE082" />
        <Stop offset="40%" stopColor="#FFB300" />
        <Stop offset="100%" stopColor="#8D6E63" />
      </LinearGradient>

      <LinearGradient id="earthBase" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#4FC3F7" />
        <Stop offset="50%" stopColor="#0288D1" />
        <Stop offset="100%" stopColor="#01579B" />
      </LinearGradient>

      <LinearGradient id="marsBase" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FF7043" />
        <Stop offset="60%" stopColor="#CD5C5C" />
        <Stop offset="100%" stopColor="#8D1C1C" />
      </LinearGradient>

      <LinearGradient id="jupiterBase" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFE082" />
        <Stop offset="40%" stopColor="#C88B3A" />
        <Stop offset="100%" stopColor="#5D4037" />
      </LinearGradient>

      <LinearGradient id="saturnBase" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFE082" />
        <Stop offset="55%" stopColor="#F4D47F" />
        <Stop offset="100%" stopColor="#A78B45" />
      </LinearGradient>

      <LinearGradient id="uranusBase" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#E0F7FA" />
        <Stop offset="50%" stopColor="#4FD0E7" />
        <Stop offset="100%" stopColor="#00838F" />
      </LinearGradient>

      <LinearGradient id="neptuneBase" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#64B5F6" />
        <Stop offset="50%" stopColor="#4166F5" />
        <Stop offset="100%" stopColor="#0D47A1" />
      </LinearGradient>
    </Defs>
  );

  // Render a specific planet's vector artwork
  const renderPlanet = () => {
    switch (name) {
      case 'mercury':
        return (
          <G>
            {/* Base Planet Circle */}
            <Circle cx="50" cy="50" r="32" fill="url(#mercuryBase)" />

            {/* Craters */}
            <G opacity="0.6">
              <Circle cx="38" cy="42" r="5" fill="#3E3529" />
              <Circle cx="37.5" cy="42.5" r="5" fill="none" stroke="#E0E0E0" strokeWidth="0.5" opacity="0.4" />

              <Circle cx="60" cy="36" r="4.5" fill="#3E3529" />
              <Circle cx="59.5" cy="36.5" r="4.5" fill="none" stroke="#E0E0E0" strokeWidth="0.5" opacity="0.4" />

              <Circle cx="44" cy="65" r="6" fill="#3E3529" />
              <Circle cx="43.5" cy="65.5" r="6" fill="none" stroke="#E0E0E0" strokeWidth="0.5" opacity="0.4" />

              <Circle cx="58" cy="60" r="3" fill="#3E3529" />
              <Circle cx="31" cy="56" r="3.5" fill="#3E3529" />
            </G>

            {/* 3D Sphere Shading */}
            <Circle cx="50" cy="50" r="32" fill="url(#sphereShading)" />
          </G>
        );

      case 'venus':
        return (
          <G>
            {/* Base Planet Circle */}
            <Circle cx="50" cy="50" r="32" fill="url(#venusBase)" />

            {/* Swirling atmospheric bands */}
            <ClipPath id="venusClip">
              <Circle cx="50" cy="50" r="32" />
            </ClipPath>
            <G clipPath="url(#venusClip)">
              <Path d="M 10 32 Q 50 20 90 32 Q 50 42 10 32 Z" fill="#FFFFFF" opacity="0.22" />
              <Path d="M 10 46 Q 50 36 90 46 Q 50 56 10 46 Z" fill="#FFE082" opacity="0.3" />
              <Path d="M 12 58 Q 50 48 88 58 Q 50 68 12 58 Z" fill="#FFFFFF" opacity="0.18" />
              <Path d="M 15 70 Q 50 60 85 70 Q 50 80 15 70 Z" fill="#D7CCC8" opacity="0.25" />
            </G>

            {/* 3D Sphere Shading */}
            <Circle cx="50" cy="50" r="32" fill="url(#sphereShading)" />
          </G>
        );

      case 'earth':
        return (
          <G>
            {/* Base Planet Circle */}
            <Circle cx="50" cy="50" r="32" fill="url(#earthBase)" />

            {/* Continent shapes */}
            <ClipPath id="earthClip">
              <Circle cx="50" cy="50" r="32" />
            </ClipPath>
            <G clipPath="url(#earthClip)">
              {/* North America / Greenland */}
              <Path
                d="M 24 24 Q 28 28 32 20 T 44 26 Q 42 34 36 34 T 28 30 Z"
                fill="#4CAF50"
                opacity="0.85"
              />
              {/* South America */}
              <Path
                d="M 28 36 Q 34 44 36 50 T 30 70 Q 25 74 24 70 T 26 50 T 26 38 Z"
                fill="#4CAF50"
                opacity="0.85"
              />
              {/* Africa / Europe */}
              <Path
                d="M 52 24 Q 64 22 70 28 T 68 44 Q 60 56 56 68 Q 50 68 48 54 T 46 36 Z"
                fill="#4CAF50"
                opacity="0.85"
              />
              {/* Asia */}
              <Path
                d="M 70 20 Q 82 22 86 32 T 76 46 Q 70 42 72 32 Z"
                fill="#4CAF50"
                opacity="0.85"
              />
              {/* Australia */}
              <Path
                d="M 74 54 Q 82 56 80 62 T 72 60 Z"
                fill="#4CAF50"
                opacity="0.85"
              />

              {/* Translucent Clouds */}
              <Path d="M 20 38 Q 45 28 70 42 T 90 32" fill="none" stroke="#FFFFFF" strokeWidth="4" opacity="0.35" />
              <Path d="M 16 58 Q 40 50 64 64 T 84 56" fill="none" stroke="#FFFFFF" strokeWidth="3" opacity="0.3" />
            </G>

            {/* 3D Sphere Shading */}
            <Circle cx="50" cy="50" r="32" fill="url(#sphereShading)" />
          </G>
        );

      case 'mars':
        return (
          <G>
            {/* Base Planet Circle */}
            <Circle cx="50" cy="50" r="32" fill="url(#marsBase)" />

            {/* Dark Syrtis Major style markings */}
            <ClipPath id="marsClip">
              <Circle cx="50" cy="50" r="32" />
            </ClipPath>
            <G clipPath="url(#marsClip)">
              <Path
                d="M 30 46 Q 44 54 52 48 T 70 56 Q 60 68 30 46 Z"
                fill="#5D4037"
                opacity="0.3"
              />
              <Path
                d="M 45 30 Q 55 34 62 28 Z"
                fill="#5D4037"
                opacity="0.25"
              />

              {/* Polar Ice Cap */}
              <Ellipse cx="50" cy="20" rx="8" ry="3.5" fill="#FFFFFF" opacity="0.9" />
            </G>

            {/* 3D Sphere Shading */}
            <Circle cx="50" cy="50" r="32" fill="url(#sphereShading)" />
          </G>
        );

      case 'jupiter':
        return (
          <G>
            {/* Base Planet Circle */}
            <Circle cx="50" cy="50" r="32" fill="url(#jupiterBase)" />

            {/* Banded Gas Stripes */}
            <ClipPath id="jupiterClip">
              <Circle cx="50" cy="50" r="32" />
            </ClipPath>
            <G clipPath="url(#jupiterClip)">
              <Rect x="10" y="24" width="80" height="5" fill="#8D6E63" opacity="0.6" />
              <Rect x="10" y="32" width="80" height="7" fill="#D84315" opacity="0.45" />
              <Rect x="10" y="42" width="80" height="4" fill="#E0F2F1" opacity="0.3" />
              <Rect x="10" y="48" width="80" height="9" fill="#FF8A65" opacity="0.5" />
              <Rect x="10" y="59" width="80" height="6" fill="#8D6E63" opacity="0.5" />
              <Rect x="10" y="68" width="80" height="5" fill="#FFE082" opacity="0.4" />

              {/* The Great Red Spot */}
              <Ellipse cx="62" cy="54" rx="7.5" ry="4.8" fill="#B71C1C" />
              <Ellipse cx="62" cy="54" rx="5.5" ry="3.2" fill="#E64A19" />
              {/* Storm swirls */}
              <Path d="M 52 56 Q 58 58 64 58" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.4" />
            </G>

            {/* 3D Sphere Shading */}
            <Circle cx="50" cy="50" r="32" fill="url(#sphereShading)" />
          </G>
        );

      case 'saturn':
        return (
          // Saturn rotated slightly for ring inclination
          <G transform="rotate(-14, 50, 50)">
            {/* 1. BACK RINGS (Drawn behind planet. Full ellipse, but will be covered by planet sphere) */}
            <G opacity="0.85">
              {/* Outer Ring A */}
              <Ellipse cx="50" cy="50" rx="45" ry="11" stroke="#D7CCC8" strokeWidth="3" fill="none" />
              {/* Inner Ring B */}
              <Ellipse cx="50" cy="50" rx="38" ry="9.2" stroke="#FFE082" strokeWidth="2.5" fill="none" />
              {/* Crepe Ring C */}
              <Ellipse cx="50" cy="50" rx="32" ry="7.5" stroke="#BCAAA4" strokeWidth="1.5" fill="none" opacity="0.6" />
            </G>

            {/* 2. PLANET BODY (Slightly smaller r=22 so rings fit beautifully in 100x100) */}
            <Circle cx="50" cy="50" r="22" fill="url(#saturnBase)" />

            {/* Planet gas stripes */}
            <ClipPath id="saturnClip">
              <Circle cx="50" cy="50" r="22" />
            </ClipPath>
            <G clipPath="url(#saturnClip)">
              <Rect x="20" y="38" width="60" height="3" fill="#D7CCC8" opacity="0.4" />
              <Rect x="20" y="44" width="60" height="5" fill="#FFE082" opacity="0.4" />
              <Rect x="20" y="52" width="60" height="4" fill="#BCAAA4" opacity="0.5" />
              <Rect x="20" y="58" width="60" height="3" fill="#E0F2F1" opacity="0.3" />

              {/* 3D Sphere Shading */}
              <Circle cx="50" cy="50" r="22" fill="url(#sphereShading)" />
            </G>

            {/* 3. FRONT RINGS (Clipped to lower half y > 50 so they wrap in front) */}
            <G clipPath="url(#frontRingClip)" opacity="0.85">
              {/* Outer Ring A */}
              <Ellipse cx="50" cy="50" rx="45" ry="11" stroke="#D7CCC8" strokeWidth="3" fill="none" />
              {/* Inner Ring B */}
              <Ellipse cx="50" cy="50" rx="38" ry="9.2" stroke="#FFE082" strokeWidth="2.5" fill="none" />
              {/* Crepe Ring C */}
              <Ellipse cx="50" cy="50" rx="32" ry="7.5" stroke="#BCAAA4" strokeWidth="1.5" fill="none" opacity="0.6" />
            </G>
          </G>
        );

      case 'uranus':
        return (
          // Uranus rotated steeply (rotating by 78 deg for vertical rings)
          <G transform="rotate(-78, 50, 50)">
            {/* 1. BACK RINGS (Drawn behind planet. Very thin vertical rings) */}
            <G opacity="0.55">
              <Ellipse cx="50" cy="50" rx="42" ry="6" stroke="#B2EBF2" strokeWidth="1" fill="none" />
              <Ellipse cx="50" cy="50" rx="38" ry="5.4" stroke="#80DEEA" strokeWidth="0.8" fill="none" />
            </G>

            {/* 2. PLANET BODY (r=24) */}
            <Circle cx="50" cy="50" r="24" fill="url(#uranusBase)" />

            {/* Planet atmosphere details */}
            <ClipPath id="uranusClip">
              <Circle cx="50" cy="50" r="24" />
            </ClipPath>
            <G clipPath="url(#uranusClip)">
              {/* Subtle bands */}
              <Rect x="20" y="38" width="60" height="4" fill="#B2EBF2" opacity="0.2" />
              <Rect x="20" y="48" width="60" height="3" fill="#E0F7FA" opacity="0.15" />

              {/* 3D Sphere Shading */}
              <Circle cx="50" cy="50" r="24" fill="url(#sphereShading)" />
            </G>

            {/* 3. FRONT RINGS (Clipped to lower half y > 50 so they wrap in front) */}
            <G clipPath="url(#frontRingClip)" opacity="0.55">
              <Ellipse cx="50" cy="50" rx="42" ry="6" stroke="#B2EBF2" strokeWidth="1" fill="none" />
              <Ellipse cx="50" cy="50" rx="38" ry="5.4" stroke="#80DEEA" strokeWidth="0.8" fill="none" />
            </G>
          </G>
        );

      case 'neptune':
        return (
          <G>
            {/* Base Planet Circle */}
            <Circle cx="50" cy="50" r="32" fill="url(#neptuneBase)" />

            {/* Atmospheric features */}
            <ClipPath id="neptuneClip">
              <Circle cx="50" cy="50" r="32" />
            </ClipPath>
            <G clipPath="url(#neptuneClip)">
              {/* Great Dark Spot */}
              <Ellipse cx="36" cy="48" rx="6" ry="4" fill="#0D47A1" opacity="0.5" />
              <Ellipse cx="36" cy="48" rx="4" ry="2.5" fill="#0A247A" opacity="0.7" />

              {/* Wispy Cirrus-like white clouds */}
              <Path d="M 28 36 Q 50 32 72 38" fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.35" />
              <Path d="M 38 60 Q 56 56 74 62" fill="none" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.3" />
            </G>

            {/* 3D Sphere Shading */}
            <Circle cx="50" cy="50" r="32" fill="url(#sphereShading)" />
          </G>
        );

      default:
        // Fallback representation (Generic Ringed Planet)
        return (
          <G transform="rotate(-15, 50, 50)">
            <Ellipse cx="50" cy="50" rx="42" ry="10" stroke="#00E5FF" strokeWidth="2" fill="none" opacity="0.8" />
            <Circle cx="50" cy="50" r="24" fill="#0288D1" />
            <Circle cx="50" cy="50" r="24" fill="url(#sphereShading)" />
            <G clipPath="url(#frontRingClip)">
              <Ellipse cx="50" cy="50" rx="42" ry="10" stroke="#00E5FF" strokeWidth="2" fill="none" opacity="0.8" />
            </G>
          </G>
        );
    }
  };

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ overflow: 'visible' }}
    >
      {renderDefs()}
      {renderPlanet()}
    </Svg>
  );
};

export default PlanetIllustration;
