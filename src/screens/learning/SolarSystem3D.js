import { BlurView } from 'expo-blur';
import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    BackHandler,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Svg, { Path, Circle, Line as SvgLine, Text as SvgText } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../theme/theme';

const MONOSPACE_FONT = Platform.OS === 'ios' ? 'Courier' : 'monospace';

const { width, height } = Dimensions.get('window');

// Tactical Mars HUD layout coordinates
const PANEL_WIDTH = width - 32;
const PANEL_HEIGHT = 275;
const PANEL_LEFT = 16;
const PANEL_BOTTOM = 95;
const PANEL_TOP = height - PANEL_BOTTOM - PANEL_HEIGHT;

// Anchor connection point on the panel's top-right corner
const ANCHOR_X = PANEL_LEFT + PANEL_WIDTH;
const ANCHOR_Y = PANEL_TOP + 40;

const SOLAR_SYSTEM = [
  {
    id: 'sun',
    name: 'Sun',
    color: '#FF9D00', // Pure white-hot core with brilliant glowing deep orange-gold emissive corona
    emissive: '#FF9D00',
    scale: 2.5,
    distance: 0,
    diameter: '1,391,000 km',
    distanceFromSun: '0 km',
    moons: '0',
    fact: 'The Sun contains 99.86% of the mass in our solar system and drives the planetary orbits.',
    tagline: 'The engine of our solar system',
    temperature: '5,500°C',
    velocity: '0 km/s',
    gravity: '274 m/s²',
    initialAngle: 0,
  },
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#8C8C8C', // Matte, unreflective heavily cratered slate gray
    scale: 0.35,
    distance: 6,
    orbitSpeed: 0.007,
    rotationSpeed: 0.018,
    diameter: '4,880 km',
    distanceFromSun: '57.9 million km',
    moons: '0',
    fact: 'Mercury has the shortest orbit around the Sun, completing a year in 88 days.',
    tagline: 'The swift messenger planet',
    temperature: '167°C',
    velocity: '47.4 km/s',
    gravity: '3.7 m/s²',
    initialAngle: 0.12,
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#E3D1B5', // High-density, uniform reflective yellowish-cream cloud layers
    scale: 0.75,
    distance: 9.5,
    orbitSpeed: 0.0056,
    rotationSpeed: 0.02,
    diameter: '12,104 km',
    distanceFromSun: '108.2 million km',
    moons: '0',
    fact: 'Venus rotates backwards compared to most planets and has a thick acidic atmosphere.',
    tagline: 'The evening star',
    temperature: '464°C',
    velocity: '35.0 km/s',
    gravity: '8.87 m/s²',
    initialAngle: -0.08,
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#1A3B8B', // Brilliant sapphire blue oceans, green/brown land masses, faint glowing atmosphere
    scale: 0.8,
    distance: 13.5,
    orbitSpeed: 0.0048,
    rotationSpeed: 0.023,
    diameter: '12,742 km',
    distanceFromSun: '149.6 million km',
    moons: '1 (LUNA)',
    fact: 'Earth is the only known planet with liquid surface water and a protective magnetic field.',
    tagline: 'Home of life',
    temperature: '15°C',
    velocity: '29.8 km/s',
    gravity: '9.81 m/s²',
    initialAngle: 0.04,
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#C1440E', // Rich, oxidized iron-rust butterscotch-red with dark basaltic patches
    scale: 0.42,
    distance: 17,
    orbitSpeed: 0.0038,
    rotationSpeed: 0.022,
    diameter: '6,779 KM',
    distanceFromSun: '227.9 M KM',
    moons: '2 (PHOBOS, DEIMOS)',
    fact: 'Mars has the largest volcano and canyon in the solar system: Olympus Mons and Valles Marineris.',
    tagline: 'The red explorer',
    temperature: '-63°C',
    velocity: '24 KM/S',
    gravity: '3.71 M/S²',
    initialAngle: 0.0,
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#D4A373', // Striking alternating bronze, tan, and beige gas bands showing Great Red Spot
    scale: 1.7,
    distance: 22,
    orbitSpeed: 0.0026,
    rotationSpeed: 0.04,
    diameter: '139,820 km',
    distanceFromSun: '778.5 million km',
    moons: '95',
    fact: 'Jupiter is so massive that all other planets combined are still smaller than it.',
    tagline: 'The gas giant king',
    temperature: '-110°C',
    velocity: '13.1 km/s',
    gravity: '24.79 m/s²',
    initialAngle: 0.15,
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#E2BF7D', // Pale golden-yellow gas body with semi-translucent dust-gray rings
    scale: 1.4,
    distance: 28,
    orbitSpeed: 0.002,
    rotationSpeed: 0.037,
    diameter: '116,460 km',
    distanceFromSun: '1.43 billion km',
    moons: '146',
    fact: 'Saturn has the most extensive ring system in our solar system, created from ice and rock.',
    tagline: 'The ringed giant',
    temperature: '-140°C',
    velocity: '9.7 km/s',
    gravity: '10.44 m/s²',
    initialAngle: -0.12,
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: '#4BB8BC', // Cool, featureless pale aquamarine/ice cyan
    scale: 1.05,
    distance: 34,
    orbitSpeed: 0.0014,
    rotationSpeed: 0.028,
    diameter: '50,724 km',
    distanceFromSun: '2.87 billion km',
    moons: '28',
    fact: 'Uranus rotates on its side so its poles point almost directly at the Sun.',
    tagline: 'The tilted ice giant',
    temperature: '-195°C',
    velocity: '6.8 km/s',
    gravity: '8.69 m/s²',
    initialAngle: 0.08,
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: '#274687', // Deep intense azure/cobalt blue methane atmosphere with faint icy streaks
    scale: 1.0,
    distance: 40,
    orbitSpeed: 0.001,
    rotationSpeed: 0.029,
    diameter: '49,244 km',
    distanceFromSun: '4.50 billion km',
    moons: '16',
    fact: 'Neptune has the fastest winds in the solar system, reaching speeds over 2,400 km/h.',
    tagline: 'The deep blue world',
    temperature: '-200°C',
    velocity: '5.4 km/s',
    gravity: '11.15 m/s²',
    initialAngle: -0.05,
  },
];

const LOCAL_BACKUP_PLANETS = [
  {
    id: 'sun',
    name: 'Sun',
    color: '#FF9D00',
    scale: 4.0,
    radius: 4.0,
    distance: 0,
    diameter: '1,391,000 km',
    distanceFromSun: '0 km',
    moons: '0',
    fact: 'The Sun contains 99.86% of the mass in our solar system and drives the planetary orbits.',
    tagline: 'The engine of our solar system',
    temperature: '5,500°C',
    velocity: '0 km/s',
    gravity: '274 m/s²',
    initialAngle: 0,
    orbitSpeed: 0,
  },
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#8C8C8C',
    scale: 0.8,
    radius: 0.8,
    distance: 60,
    speed: 0.007,
    orbitSpeed: 0.007,
    rotationSpeed: 0.018,
    diameter: '4,880 km',
    distanceFromSun: '57.9 million km',
    moons: '0',
    fact: 'Mercury has the shortest orbit around the Sun, completing a year in 88 days.',
    tagline: 'The swift messenger planet',
    temperature: '167°C',
    velocity: '47.4 km/s',
    gravity: '3.7 m/s²',
    initialAngle: 0.12,
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#FFBF00',
    scale: 1.2,
    radius: 1.2,
    distance: 85,
    speed: 0.0056,
    orbitSpeed: 0.0056,
    rotationSpeed: 0.02,
    diameter: '12,104 km',
    distanceFromSun: '108.2 million km',
    moons: '0',
    fact: 'Venus rotates backwards compared to most planets and has a thick acidic atmosphere.',
    tagline: 'The evening star',
    temperature: '464°C',
    velocity: '35.0 km/s',
    gravity: '8.87 m/s²',
    initialAngle: -0.08,
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#00E5FF',
    scale: 1.4,
    radius: 1.4,
    distance: 110,
    speed: 0.0048,
    orbitSpeed: 0.0048,
    rotationSpeed: 0.023,
    diameter: '12,742 km',
    distanceFromSun: '149.6 million km',
    moons: '1 (LUNA)',
    fact: 'Earth is the only known planet with liquid surface water and a protective magnetic field.',
    tagline: 'Home of life',
    temperature: '15°C',
    velocity: '29.8 km/s',
    gravity: '9.81 m/s²',
    initialAngle: 0.04,
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#FF3B30',
    scale: 1.1,
    radius: 1.1,
    distance: 135,
    speed: 0.0038,
    orbitSpeed: 0.0038,
    rotationSpeed: 0.022,
    diameter: '6,779 KM',
    distanceFromSun: '227.9 M KM',
    moons: '2 (PHOBOS, DEIMOS)',
    fact: 'Mars has the largest volcano and canyon in the solar system: Olympus Mons and Valles Marineris.',
    tagline: 'The red explorer',
    temperature: '-63°C',
    velocity: '24 KM/S',
    gravity: '3.71 M/S²',
    initialAngle: 0.0,
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#FF9500',
    scale: 2.5,
    radius: 2.5,
    distance: 170,
    speed: 0.0022,
    orbitSpeed: 0.0022,
    rotationSpeed: 0.05,
    diameter: '139,820 km',
    distanceFromSun: '778.5 million km',
    moons: '95',
    fact: 'Jupiter is more than twice as massive as all the other planets combined.',
    tagline: 'King of planets',
    temperature: '-110°C',
    velocity: '13.1 km/s',
    gravity: '24.79 m/s²',
    initialAngle: 0.5,
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#FFCC00',
    scale: 2.1,
    radius: 2.1,
    distance: 210,
    speed: 0.0016,
    orbitSpeed: 0.0016,
    rotationSpeed: 0.04,
    diameter: '116,460 km',
    distanceFromSun: '1.4 billion km',
    moons: '146',
    fact: 'Saturn has the most extensive ring system in our solar system.',
    tagline: 'The ringed giant',
    temperature: '-140°C',
    velocity: '9.7 km/s',
    gravity: '10.44 m/s²',
    initialAngle: -0.3,
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: '#5AC8FA',
    scale: 1.6,
    radius: 1.6,
    distance: 245,
    speed: 0.0011,
    orbitSpeed: 0.0011,
    rotationSpeed: 0.03,
    diameter: '50,724 km',
    distanceFromSun: '2.9 billion km',
    moons: '28',
    fact: 'Uranus rotates on its side, meaning its poles point almost directly at the Sun.',
    tagline: 'The tilted ice giant',
    temperature: '-195°C',
    velocity: '6.8 km/s',
    gravity: '8.69 m/s²',
    initialAngle: 0.2,
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: '#007AFF',
    scale: 1.5,
    radius: 1.5,
    distance: 280,
    speed: 0.0008,
    orbitSpeed: 0.0008,
    rotationSpeed: 0.035,
    diameter: '49,244 km',
    distanceFromSun: '4.5 billion km',
    moons: '16',
    fact: 'Neptune is the most distant planet in our solar system, with supersonic winds.',
    tagline: 'The deep blue world',
    temperature: '-200°C',
    velocity: '5.4 km/s',
    gravity: '11.15 m/s²',
    initialAngle: -0.1,
  },
];

const BODIES_DATA = {
  sun: {
    name: 'Sun (Core Star)',
    type: 'Yellow Dwarf (G2V)',
    temperature: '~5,500 °C (Surface)',
    mass: '333,000 Earths',
    description: 'The heart of our solar system, driving the orbital vectors and lifecycle parameters of all surrounding satellites.',
  },
  mercury: {
    name: 'Mercury',
    type: 'Terrestrial Planet',
    temperature: '167 °C (Average)',
    mass: '0.055 Earths',
    description: 'The closest planet to the Sun, with a heavily cratered surface and the fastest orbit in the solar system.',
  },
  venus: {
    name: 'Venus',
    type: 'Terrestrial Planet',
    temperature: '464 °C (Average)',
    mass: '0.815 Earths',
    description: 'A planet shrouded in a thick, toxic atmosphere of carbon dioxide, making it the hottest planet in our solar system.',
  },
  earth: {
    name: 'Earth',
    type: 'Terrestrial Planet',
    temperature: '15 °C (Average)',
    mass: '1 Earth',
    description: 'Our home planet, the only known world with liquid water on its surface and active life-supporting ecosystems.',
  },
  mars: {
    name: 'Mars',
    type: 'Terrestrial Planet',
    temperature: '-63 °C (Average)',
    mass: '0.107 Earths',
    description: 'The Red Planet, featuring oxidized iron dust, Olympus Mons, and frozen polar caps that hold ancient water potential.',
  },
  jupiter: {
    name: 'Jupiter',
    type: 'Gas Giant',
    temperature: '-110 °C (Average)',
    mass: '317.8 Earths',
    description: 'The largest planet in our solar system, dominated by swirling gas bands and the massive, centuries-old Great Red Spot storm.',
  },
  saturn: {
    name: 'Saturn',
    type: 'Gas Giant',
    temperature: '-140 °C (Average)',
    mass: '95.2 Earths',
    description: 'A majestic gas giant renowned for its spectacular and complex ring system made of billions of ice and rock particles.',
  },
  uranus: {
    name: 'Uranus',
    type: 'Ice Giant',
    temperature: '-195 °C (Average)',
    mass: '14.5 Earths',
    description: 'A pale blue-green ice giant that uniquely rotates on a extreme sideways axis, potentially due to an ancient cosmic collision.',
  },
  neptune: {
    name: 'Neptune',
    type: 'Ice Giant',
    temperature: '-200 °C (Average)',
    mass: '17.1 Earths',
    description: 'A cold, blue world swept by supersonic winds and supersonic storms, marking the outermost boundary of the major planets.',
  }
};

const SolarSystem3D = ({ route, navigation }) => {
  const { width, height } = useWindowDimensions();

  // Tactical Mars HUD layout coordinates
  const PANEL_WIDTH = width - 32;
  const PANEL_HEIGHT = 275;
  const PANEL_LEFT = 16;
  const PANEL_BOTTOM = 95;
  const PANEL_TOP = height - PANEL_BOTTOM - PANEL_HEIGHT;

  // Anchor connection point on the panel's top-right corner
  const ANCHOR_X = PANEL_LEFT + PANEL_WIDTH;
  const ANCHOR_Y = PANEL_TOP + 40;

  const currentDay = useMemo(() => new Date().getDate(), []);

  // Mock backend fetch state hook (currently null or empty to simulate offline connection dropped)
  const [backendPlanetsData, setBackendPlanetsData] = useState([]);
  
  // Patch the Data Loading Condition using logical OR fallback
  const activePlanetsList = backendPlanetsData?.length > 0 ? backendPlanetsData : LOCAL_BACKUP_PLANETS;

  // Compute a unique day-based randomizer seed for starting orbital positions and solar cycle
  const dynamicSolarSystem = useMemo(() => {
    return activePlanetsList.map((planet) => {
      if (planet.id === 'sun') return planet;
      // Calculate a unique starting angular radian position based on calendar day
      const initialAngle = (currentDay * 360) / 31; 
      return {
        ...planet,
        initialAngle: (planet.initialAngle || 0) + (initialAngle * Math.PI) / 180,
      };
    });
  }, [currentDay, activePlanetsList]);

  // Set Mars as default target locked planet
  const [selectedPlanet, setSelectedPlanet] = useState(() => 
    dynamicSolarSystem.find(p => p.id === 'mars') || dynamicSolarSystem[0]
  );
  const [selectedBody, setSelectedBody] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [scannedPlanets, setScannedPlanets] = useState({ mars: true });

  // 2D Rotation Ticker state for animation
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animationFrameId;
    const tick = () => {
      setTime(t => t + 0.3); // Smooth progress increment
      animationFrameId = requestAnimationFrame(tick);
    };
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    const handleBackPress = () => {
      if (selectedBody || selectedPlanet) {
        setSelectedBody(null);
        setSelectedPlanet(null);
        return true; // Enforces absolute interception
      }
      return false; // Allows standard stack goBack if no modal is open
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
    return () => backHandler.remove();
  }, [selectedBody, selectedPlanet]);
  const CX = width / 2;
  const CY = height / 2 - 85; 

  const maxAvailableRadius = (width - 48) / 2;
  const minRadius = 35;
  const orbitingPlanets = useMemo(() => {
    return dynamicSolarSystem.filter((p) => p.id !== 'sun');
  }, [dynamicSolarSystem]);

  const radiusSpacing = useMemo(() => {
    return orbitingPlanets.length > 1
      ? (maxAvailableRadius - minRadius) / (orbitingPlanets.length - 1)
      : 20;
  }, [orbitingPlanets, maxAvailableRadius]);

  const planetPositions = useMemo(() => {
    const positions = {};
    orbitingPlanets.forEach((planet, index) => {
      const radius = planet.distance
        ? minRadius + (planet.distance / 280) * (maxAvailableRadius - minRadius)
        : minRadius + index * radiusSpacing;
      // Orbit rotation based on time, initialAngle, and speed modifier
      const angle = (planet.initialAngle || 0) + time * (planet.orbitSpeed || 0.01) * 4.0;
      positions[planet.id] = {
        x: CX + radius * Math.cos(angle),
        y: CY + radius * Math.sin(angle),
        radius,
      };
    });
    return positions;
  }, [orbitingPlanets, time, CX, CY, radiusSpacing, maxAvailableRadius, minRadius]);

  // Coordinate mapping for selected planet to feed Svg overlays (computed dynamically using useMemo to avoid setState recursion loop)
  const marsScreenPos = useMemo(() => {
    if (!selectedPlanet) return { x: CX, y: CY };
    if (selectedPlanet.id === 'sun') return { x: CX, y: CY };
    const pos = planetPositions[selectedPlanet.id];
    return pos ? { x: pos.x, y: pos.y } : { x: CX, y: CY };
  }, [selectedPlanet, planetPositions, CX, CY]);

  useEffect(() => {
    const passedId = route?.params?.initialPlanetId;
    const passedName = route?.params?.initialBodyName;
    if (passedId) {
      const match = dynamicSolarSystem.find(p => p.id === passedId.toLowerCase());
      if (match) setSelectedPlanet(match);
    } else if (passedName) {
      const match = dynamicSolarSystem.find(p => p.name.toLowerCase() === passedName.toLowerCase());
      if (match) setSelectedPlanet(match);
    }
  }, [route?.params?.initialPlanetId, route?.params?.initialBodyName, dynamicSolarSystem]);

  const handleSelectBody = (body) => {
    if (!body) {
      setSelectedBody(null);
      setSelectedPlanet(null);
      return;
    }
    if (typeof body === 'string') {
      const key = body.toLowerCase().split(' ')[0];
      const match = dynamicSolarSystem.find(p => p.id === key);
      if (match) {
        setSelectedBody(match);
        setSelectedPlanet(match);
      }
    } else {
      setSelectedBody(body);
      setSelectedPlanet(body);
    }
  };

  const handlePlanetSelect = (planet) => {
    setIsScanning(false);
    setSelectedPlanet(planet);
    setSelectedBody(planet);
    if (planet) {
      if (planet.id === 'mars') {
        setScanProgress(100);
        setScannedPlanets((prev) => ({ ...prev, mars: true }));
      } else if (scannedPlanets[planet.id]) {
        setScanProgress(100);
      } else {
        setScanProgress(0);
      }
    }
  };

  const handleStartScan = () => {
    if (!selectedPlanet || isScanning) return;
    setIsScanning(true);
    setScanProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsScanning(false);
        setScannedPlanets((prev) => ({ ...prev, [selectedPlanet.id]: true }));
      }
      setScanProgress(progress);
    }, 30);
  };

  const indicatorLinePath = useMemo(() => {
    if (!marsScreenPos || isNaN(marsScreenPos.x) || isNaN(marsScreenPos.y)) return '';
    const x1 = marsScreenPos.x;
    const y1 = marsScreenPos.y;
    const x2 = ANCHOR_X;
    const y2 = ANCHOR_Y;
    
    // Draw sci-fi joint line
    const dx = x1 < x2 ? 22 : -22;
    return `M ${x1} ${y1} L ${x1 + dx} ${y1 + 18} L ${x1 + dx * 2} ${y2} L ${x2} ${y2}`;
  }, [marsScreenPos, ANCHOR_X, ANCHOR_Y]);

  if (!activePlanetsList || activePlanetsList.length === 0) { return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b0f19' }}><Text style={{ color: '#fff' }}>Loading Orbital Radar Matrix...</Text></View>; }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0b0f19', minHeight: '100%', width: '100%', position: 'relative' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ width: '100%', minHeight: '100%', backgroundColor: '#0b0f19' }}
      >
        <StatusBar barStyle="light-content" backgroundColor="#040714" />
        <View style={{ width: '100%', padding: 15, backgroundColor: '#1e3a8a', alignItems: 'center' }}><Text style={{ color: '#ffffff', fontWeight: 'bold' }}>🛰️ ORBITAL DASHBOARD ACTIVE (ALL SYSTEMS ONLINE)</Text></View>
      
      {/* Outer Sci-fi Neon Frame Overlay */}
      <View style={styles.outerBorderFrame} pointerEvents="none">
        <View style={[styles.cornerFrame, styles.topLeftCorner]} />
        <View style={[styles.cornerFrame, styles.topRightCorner]} />
        <View style={[styles.cornerFrame, styles.bottomLeftCorner]} />
        <View style={[styles.cornerFrame, styles.bottomRightCorner]} />
        
        {/* Telemetry Markers */}
        <Text style={[styles.hudMarkerText, { top: 92, left: 20 }]}>[SYS-HUD: 3D]</Text>
        <Text style={[styles.hudMarkerText, { top: 92, right: 20 }]}>GRID: TACTICAL</Text>
        <Text style={[styles.hudMarkerText, { bottom: 15, right: 20 }]}>
          PROBE LOCK: {selectedPlanet ? selectedPlanet.name.toUpperCase() : 'NONE'}
        </Text>
      </View>

      {/* Structured Telemetry HUD Header */}
      <SafeAreaView style={styles.headerContainer} pointerEvents="box-none">
        <BlurView intensity={25} tint="dark" style={styles.topHudHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>EXIT HUD</Text>
          </TouchableOpacity>
          <View style={styles.hudHeaderLeft}>
            <Text style={styles.screenTitle}>ORBITX HELIOCORE</Text>
            <Text style={styles.techStatus}>SYS_STABLE: 99.8%</Text>
          </View>
          <View style={styles.hudHeaderRight}>
            <Text style={styles.hudTelemetryLine}>ALTITUDE: <Text style={styles.hudTelemetryVal}>408 KM</Text></Text>
            <Text style={styles.hudTelemetryLine}>SYSTEM: <Text style={styles.hudTelemetryVal}>STABLE</Text></Text>
            <Text style={styles.hudTelemetryLine}>LINK: <Text style={styles.hudTelemetryVal}>ACTIVE</Text></Text>
          </View>
        </BlurView>

        {/* Telemetry Banner Row */}
        <View style={styles.telemetryBannerRow}>
          <Text style={styles.telemetryBannerText}>COSMIC CLOCK: SYNCHRONIZED | CYCLE DATA: DYNAMIC</Text>
        </View>
      </SafeAreaView>

      {/* 2D Vector Radar Viewport */}
      <View style={[styles.radarViewport, { height: height }]}>
        <ScrollView
          maximumZoomScale={3.0}
          minimumZoomScale={0.5}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            width: width,
            height: height,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Starry background effect - simple stars scattered in the cosmic viewport */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {[...Array(60)].map((_, i) => {
            const starX = (Math.sin(i * 932) * 0.5 + 0.5) * width;
            const starY = (Math.cos(i * 423) * 0.5 + 0.5) * height;
            const opacity = Math.sin(i * 123) * 0.4 + 0.5;
            const size = i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: starX,
                  top: starY,
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: '#FFFFFF',
                  opacity: opacity,
                }}
              />
            );
          })}
        </View>

        {/* Concentric orbital track border lines */}
        {orbitingPlanets.map((planet, index) => {
          const radius = planet.distance
            ? minRadius + (planet.distance / 280) * (maxAvailableRadius - minRadius)
            : minRadius + index * radiusSpacing;
          const pos = planetPositions[planet.id];
          const badgeSize = Math.max(10, (planet.radius || planet.scale || 1) * 12);
          const isSelected = selectedPlanet?.id === planet.id;
          return (
            <React.Fragment key={planet.id}>
              {/* Orbit ring removed — no decorative background rings rendered */}

              {/* Planet Text Label */}
              {pos && (
                <Text
                  style={[
                    styles.planetLabel2D,
                    {
                      left: pos.x + badgeSize / 2 + 4,
                      top: pos.y - 7,
                      color: isSelected ? '#00E5FF' : 'rgba(255, 255, 255, 0.45)',
                      fontWeight: isSelected ? '900' : '500',
                    }
                  ]}
                >
                  {planet.name.toUpperCase()}
                </Text>
              )}

              {/* Planet badge */}
              {pos && (
                isSelected ? (
                  /*
                   * ── SELECTED PLANET: tracking circle wrapper ──────────────────────
                   * The outer TouchableOpacity IS the blue tracking circle.
                   * The planet coloured dot is absolutely centered inside it so both
                   * share the exact same pos.x / pos.y coordinate — zero positional lag.
                   */
                  <TouchableOpacity
                    activeOpacity={0.7}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    style={[
                      styles.trackingCircleWrapper,
                      {
                        left: pos.x - (badgeSize + 16) / 2,
                        top: pos.y - (badgeSize + 16) / 2,
                        width: badgeSize + 16,
                        height: badgeSize + 16,
                        borderRadius: (badgeSize + 16) / 2,
                      }
                    ]}
                    onPress={() => handleSelectBody(planet)}
                  >
                    {/* Planet coloured dot — explicitly centered via flex on trackingCircleWrapper */}
                    <View
                      style={[
                        styles.trackingPlanetDot,
                        {
                          width: badgeSize,
                          height: badgeSize,
                          borderRadius: badgeSize / 2,
                          backgroundColor: planet.color || '#FFFFFF',
                          shadowColor: planet.color,
                          shadowOpacity: 0.9,
                          shadowRadius: 8,
                        }
                      ]}
                    >
                      {/* White core pulse dot inside planet */}
                      <View style={styles.activeBadgeIndicator} />
                    </View>
                  </TouchableOpacity>
                ) : (
                  /* ── NON-SELECTED PLANET: simple coloured dot ─────────────────── */
                  <TouchableOpacity
                    activeOpacity={0.7}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    style={[
                      styles.planetBadge2D,
                      {
                        width: badgeSize,
                        height: badgeSize,
                        borderRadius: badgeSize / 2,
                        left: pos.x - badgeSize / 2,
                        top: pos.y - badgeSize / 2,
                        backgroundColor: planet.color || '#FFFFFF',
                        borderColor: '#0b0f19',
                        borderWidth: 1,
                        shadowColor: planet.color,
                        shadowOpacity: 0.5,
                        shadowRadius: 4,
                      }
                    ]}
                    onPress={() => handleSelectBody(planet)}
                  />
                )
              )}
            </React.Fragment>
          );
        })}

        {/* Central Sun component */}
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          style={[
            styles.sunContainer2D,
            {
              width: 48,
              height: 48,
              borderRadius: 24,
              left: CX - 24,
              top: CY - 24,
            }
          ]}
          onPress={() => handleSelectBody({ id: 'sun', name: 'Sun', color: '#f59e0b', type: 'Star', mass: '1.989 × 10^30 kg', radius: '696,340 km', velocity: '0 km/s (Static)', description: 'The star at the center of the Solar System, comprising 99.8% of its total mass.' })}
        >
          <View style={[styles.sunGlow2D, { width: 60, height: 60, borderRadius: 30 }]} />
          <View style={[styles.sunCore2D, { width: 36, height: 36, borderRadius: 18 }]} />
          <Text style={[styles.sunLabel2D, { top: 50 }]}>SUN</Text>
        </TouchableOpacity>

      {/* SVG Indicator Line & Target Reticles Overlay */}
      {selectedPlanet && marsScreenPos && !isNaN(marsScreenPos.x) && !isNaN(marsScreenPos.y) && (
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Neon Glow Leader Line */}
          <Path
            d={indicatorLinePath}
            fill="none"
            stroke="#00E5FF"
            strokeWidth={1.5}
            strokeDasharray="4, 4"
            opacity={0.8}
          />
          
          {/* Target Reticle at Planet */}
          <Circle
            cx={marsScreenPos.x}
            cy={marsScreenPos.y}
            r={16}
            fill="none"
            stroke="#00E5FF"
            strokeWidth={1.2}
            opacity={0.65}
          />
          <Circle
            cx={marsScreenPos.x}
            cy={marsScreenPos.y}
            r={4}
            fill="#00E5FF"
            opacity={0.95}
          />
          <SvgLine x1={marsScreenPos.x - 22} y1={marsScreenPos.y} x2={marsScreenPos.x - 12} y2={marsScreenPos.y} stroke="#00E5FF" strokeWidth={1.2} />
          <SvgLine x1={marsScreenPos.x + 12} y1={marsScreenPos.y} x2={marsScreenPos.x + 22} y2={marsScreenPos.y} stroke="#00E5FF" strokeWidth={1.2} />
          <SvgLine x1={marsScreenPos.x} y1={marsScreenPos.y - 22} x2={marsScreenPos.x} y2={marsScreenPos.y - 12} stroke="#00E5FF" strokeWidth={1.2} />
          <SvgLine x1={marsScreenPos.x} y1={marsScreenPos.y + 12} x2={marsScreenPos.x} y2={marsScreenPos.y + 22} stroke="#00E5FF" strokeWidth={1.2} />

          {/* Moons text labels along path trails for Mars */}
          {selectedPlanet.id === 'mars' && (
            <>
              <SvgText
                x={marsScreenPos.x + 24}
                y={marsScreenPos.y - 14}
                fill="#00E5FF"
                fontSize={7.5}
                fontWeight="bold"
                fontFamily={FONTS.bold || 'System'}
                letterSpacing={0.8}
                opacity={0.9}
              >
                PHOBOS
              </SvgText>

              <SvgText
                x={marsScreenPos.x - 42}
                y={marsScreenPos.y + 20}
                fill="#00E5FF"
                fontSize={7.5}
                fontWeight="bold"
                fontFamily={FONTS.bold || 'System'}
                letterSpacing={0.8}
                opacity={0.95}
              >
                DEIMOS
              </SvgText>
            </>
          )}

          {/* Moon text label for Earth */}
          {selectedPlanet.id === 'earth' && (
            <SvgText
              x={marsScreenPos.x + 24}
              y={marsScreenPos.y - 14}
              fill="#00E5FF"
              fontSize={7.5}
              fontWeight="bold"
              fontFamily={FONTS.bold || 'System'}
              letterSpacing={0.8}
              opacity={0.9}
            >
              LUNA
            </SvgText>
          )}
        </Svg>
      )}

      {/* Near-Planet SCANNING COMPLETE HUD Tag */}
      {selectedPlanet && (
        <View 
          style={[
            styles.scanningCompleteTag, 
            { 
              left: Math.max(16, Math.min(width - 165, marsScreenPos.x - 65)), 
              top: Math.max(120, Math.min(height - 200, marsScreenPos.y - 68)) 
            }
          ]}
        >
          <BlurView intensity={35} tint="dark" style={styles.tagBlur}>
            <View style={styles.tagContent}>
              <View style={[styles.tagDot, { backgroundColor: scannedPlanets[selectedPlanet.id] ? '#00FF9D' : '#00E5FF' }]} />
              <Text style={[styles.tagText, { color: scannedPlanets[selectedPlanet.id] ? '#00FF9D' : '#00E5FF' }]}>
                {scannedPlanets[selectedPlanet.id] ? 'SCANNING... COMPLETE' : isScanning ? 'SCANNING...' : 'ORBIT STABLE'}
              </Text>
            </View>
          </BlurView>
        </View>
      )}
        </ScrollView>
      </View>

      {/* Detailed information overlay card */}
      {selectedBody && (
        <View style={styles.detailCardContainer}>
          <BlurView intensity={70} tint="dark" style={styles.detailHudCard}>
            {/* Header row with Title and Close Button */}
            <View style={styles.detailCardHeader}>
              <View>
                <Text style={styles.detailCardTitle}>{selectedBody.name.toUpperCase()}</Text>
                <Text style={styles.detailCardSubtitle}>
                  {selectedBody.id === 'sun' ? 'SOLAR SYSTEM CENTER' : 'ORBITAL TELEMETRY'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.detailCloseButton} 
                onPress={() => {
                  setSelectedBody(null);
                  setSelectedPlanet(null);
                }}
              >
                <Text style={styles.detailCloseButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Metrics Grid */}
            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>MASS</Text>
                <Text style={styles.detailValue}>
                  {selectedBody.mass || BODIES_DATA[selectedBody.id]?.mass || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>RADIUS / SCALE</Text>
                <Text style={styles.detailValue}>
                  {selectedBody.radius ? `${selectedBody.radius}x` : selectedBody.diameter || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>ORBITAL SPEED</Text>
                <Text style={styles.detailValue}>
                  {selectedBody.velocity || selectedBody.orbitSpeed ? `${selectedBody.velocity || selectedBody.orbitSpeed}` : 'N/A'}
                </Text>
              </View>
            </View>

            {/* Educational Description Summary Block */}
            <View style={styles.detailDescBlock}>
              <Text style={styles.detailDescText}>
                {selectedBody.description || BODIES_DATA[selectedBody.id]?.description || selectedBody.fact || 'No data available.'}
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.detailFooter}>
              <Text style={styles.detailFooterLabel}>STATUS:</Text>
              <Text style={[styles.detailFooterVal, { color: '#00FF9D' }]}>DATA SYNCHRONIZED</Text>
            </View>
          </BlurView>
        </View>
      )}

      {/* Premium Bottom Tab Bar Navigation Mockup */}
      <View style={styles.bottomTabBarContainer}>
        <BlurView intensity={35} tint="dark" style={styles.tabBarBlur}>
          <View style={styles.tabBarInner}>
            {/* Tab 1: Home */}
            <TouchableOpacity 
              style={styles.tabItem}
              onPress={() => navigation.navigate('HomeDashboard', { screen: 'Home' })}
            >
              <MaterialCommunityIcons name="home-outline" size={20} color="rgba(255, 255, 255, 0.45)" />
              <Text style={styles.tabLabel}>Home</Text>
            </TouchableOpacity>

            {/* Tab 2: Tracker */}
            <TouchableOpacity 
              style={styles.tabItem}
              onPress={() => navigation.navigate('HomeDashboard', { screen: 'Tracker' })}
            >
              <MaterialCommunityIcons name="satellite-variant" size={20} color="rgba(255, 255, 255, 0.45)" />
              <Text style={styles.tabLabel}>Tracker</Text>
            </TouchableOpacity>

            {/* Tab 3: Explorer (Active) */}
            <TouchableOpacity 
              style={styles.tabItemActive}
              onPress={() => handleSelectBody('Mars')} // Lock Mars
            >
              <View style={styles.activeIconWrapper}>
                <MaterialCommunityIcons name="earth" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.tabLabelActive}>Explorer</Text>
              <View style={styles.activeIndicatorBar} />
            </TouchableOpacity>

            {/* Tab 5: Chat */}
            <TouchableOpacity 
              style={styles.tabItem}
              onPress={() => navigation.navigate('HomeDashboard', { screen: 'Chat' })}
            >
              <MaterialCommunityIcons name="robot-outline" size={20} color="rgba(255, 255, 255, 0.45)" />
              <Text style={styles.tabLabel}>AI Chat</Text>
            </TouchableOpacity>

            {/* Tab 6: Profile */}
            <TouchableOpacity 
              style={styles.tabItem}
              onPress={() => navigation.navigate('HomeDashboard', { screen: 'Profile' })}
            >
              <MaterialCommunityIcons name="account-outline" size={20} color="rgba(255, 255, 255, 0.45)" />
              <Text style={styles.tabLabel}>Profile</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
      {/* Bottom Horizontal Scrolling Selection Dock */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.bottomDock}
        contentContainerStyle={styles.bottomDockContent}
      >
        {activePlanetsList.map((planet) => (
          <TouchableOpacity
            key={planet.id}
            style={[
              styles.dockItem,
              selectedBody?.id === planet.id && styles.dockItemActive,
            ]}
            onPress={() => handleSelectBody(planet)}
          >
            <View style={[styles.dockBadge, { backgroundColor: planet.color }]} />
            <Text style={[
              styles.dockText,
              selectedBody?.id === planet.id && styles.dockTextActive,
            ]}>
              {planet.name.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040714',
  },
  outerBorderFrame: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 95, // Cleanly terminates above the bottom navigation bar (range 15-80)
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.22)',
    zIndex: 10,
    borderRadius: 18,
  },
  cornerFrame: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: '#00E5FF',
  },
  topLeftCorner: {
    top: -1,
    left: -1,
    borderLeftWidth: 3.5,
    borderTopWidth: 3.5,
    borderTopLeftRadius: 6,
  },
  topRightCorner: {
    top: -1,
    right: -1,
    borderRightWidth: 3.5,
    borderTopWidth: 3.5,
    borderTopRightRadius: 6,
  },
  bottomLeftCorner: {
    bottom: -1,
    left: -1,
    borderLeftWidth: 3.5,
    borderBottomWidth: 3.5,
    borderBottomLeftRadius: 6,
  },
  bottomRightCorner: {
    bottom: -1,
    right: -1,
    borderRightWidth: 3.5,
    borderBottomWidth: 3.5,
    borderBottomRightRadius: 6,
  },
  hudMarkerText: {
    position: 'absolute',
    color: 'rgba(0, 229, 255, 0.45)',
    fontSize: 8,
    fontFamily: FONTS.bold || 'System',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 22,
    left: 20,
    right: 20,
    zIndex: 15,
  },
  telemetryBannerRow: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderColor: 'rgba(0, 229, 255, 0.25)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  telemetryBannerText: {
    color: '#00E5FF',
    fontSize: 8,
    fontFamily: FONTS.bold || 'System',
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  topHudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    backgroundColor: 'rgba(6, 10, 28, 0.75)',
    overflow: 'hidden',
  },
  hudHeaderLeft: {
    flex: 1,
    marginLeft: 12,
  },
  screenTitle: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    fontFamily: FONTS.bold || 'System',
  },
  techStatus: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 8,
    marginTop: 2,
    fontFamily: FONTS.regular || 'System',
    letterSpacing: 0.5,
  },
  hudHeaderRight: {
    alignItems: 'flex-end',
  },
  hudTelemetryLine: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 8,
    fontFamily: FONTS.regular || 'System',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  hudTelemetryVal: {
    color: '#00E5FF',
    fontFamily: FONTS.bold || 'System',
    fontWeight: 'bold',
  },
  backButton: {
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.45)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  backButtonText: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 9,
    letterSpacing: 0.8,
    fontFamily: FONTS.bold || 'System',
  },
  gestureSurface: {
    flex: 1,
  },
  radarViewport: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0b0f19',
    position: 'relative',
    overflow: 'hidden',
  },
  orbitRing2D: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderStyle: 'dashed',
  },
  planetBadge2D: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  activeBadgeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
  // ── Selected planet tracking circle ───────────────────────────────────────────────
  trackingCircleWrapper: {
    position: 'absolute',
    // justifyContent + alignItems ensure the inner planet dot is always
    // exactly centered on the circle regardless of badgeSize
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 10,
  },
  trackingPlanetDot: {
    // The planet's own coloured dot, centered inside trackingCircleWrapper
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  planetLabel2D: {
    position: 'absolute',
    fontSize: 8.5,
    fontFamily: MONOSPACE_FONT,
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sunContainer2D: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunCore2D: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF9D00',
    shadowColor: '#FF9D00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 12,
    elevation: 6,
  },
  sunGlow2D: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 157, 0, 0.25)',
  },
  sunLabel2D: {
    position: 'absolute',
    top: 38,
    color: '#FF9D00',
    fontSize: 8,
    fontFamily: MONOSPACE_FONT,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scanningCompleteTag: {
    position: 'absolute',
    zIndex: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00E5FF',
    overflow: 'hidden',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  tagBlur: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(4, 7, 20, 0.82)',
  },
  tagContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00E5FF',
    marginRight: 6,
  },
  tagText: {
    color: '#00E5FF',
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: FONTS.bold || 'System',
    letterSpacing: 1,
  },
  marsDataPanel: {
    position: 'absolute',
    bottom: PANEL_BOTTOM,
    left: PANEL_LEFT,
    width: PANEL_WIDTH,
    zIndex: 20,
  },
  bodyDetailPanel: {
    position: 'absolute',
    bottom: 95,
    left: PANEL_LEFT,
    width: PANEL_WIDTH,
    zIndex: 30,
  },
  bodyDetailHudCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    backgroundColor: 'rgba(6, 10, 28, 0.75)',
    padding: 16,
  },
  hudCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    backgroundColor: 'rgba(6, 10, 28, 0.75)',
    padding: 12,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.12)',
    paddingBottom: 6,
    marginBottom: 8,
  },
  panelTitle: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    fontFamily: FONTS.bold || 'System',
  },
  panelSubtitle: {
    color: 'rgba(0, 229, 255, 0.5)',
    fontSize: 7.5,
    fontWeight: '700',
    marginTop: 1,
    letterSpacing: 0.5,
  },
  selectedBadge: {
    backgroundColor: 'rgba(0, 255, 157, 0.12)',
    borderColor: '#00FF9D',
    borderWidth: 0.8,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  selectedBadgeText: {
    color: '#00FF9D',
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dataItem: {
    width: '48%',
    marginBottom: 6,
  },
  dataLabel: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dataValue: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    marginTop: 1,
  },
  descriptionBlock: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  descriptionText: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 8,
    lineHeight: 11,
    fontFamily: FONTS.regular || 'System',
  },
  sourceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  sourceLabel: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 7,
    fontWeight: '700',
  },
  sourceValue: {
    color: 'rgba(0, 229, 255, 0.65)',
    fontSize: 7,
    fontWeight: '800',
    marginLeft: 3,
  },
  closeButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  closeButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 8,
    fontWeight: '700',
  },
  tacticalScanButton: {
    marginTop: SPACING.xs,
    width: '100%',
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    alignItems: 'center',
  },
  tacticalScanText: {
    color: '#00E5FF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scanProgressBlock: {
    marginTop: SPACING.xs,
  },
  scanProgressText: {
    color: '#00E5FF',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
  },
  scanProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scanProgressFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
  },
  planetDescriptionRow: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  planetDescriptionText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 14,
  },
  systemCoreTitle: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  systemCoreSubtitle: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 8,
    marginTop: 2,
    marginBottom: 8,
  },
  quickSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickSelectBtn: {
    width: '23%',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: 'rgba(6, 10, 28, 0.35)',
    marginBottom: 6,
  },
  quickSelectBtnText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomTabBarContainer: {
    position: 'absolute',
    bottom: 15,
    left: 12,
    right: 12,
    height: 65,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    backgroundColor: 'rgba(4, 7, 20, 0.3)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 25,
  },
  tabBarBlur: {
    flex: 1,
  },
  tabBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
    height: '100%',
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderRadius: 10,
    padding: 4,
    marginBottom: 1,
  },
  tabLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 8,
    marginTop: 2,
    fontFamily: FONTS.regular || 'System',
  },
  tabLabelActive: {
    color: '#00E5FF',
    fontSize: 8.5,
    fontWeight: '900',
    marginTop: 1,
    fontFamily: FONTS.bold || 'System',
  },
  activeIndicatorBar: {
    position: 'absolute',
    bottom: 4,
    width: 14,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
  canvasLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#040714',
  },
  canvasLoadingText: {
    marginTop: 12,
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.bold || 'System',
    letterSpacing: 1,
  },
  diagnosticsWidget: {
    position: 'absolute',
    top: 145,
    right: 16,
    width: 145,
    zIndex: 15,
  },
  cockpitDock: {
    position: 'absolute',
    top: 145,
    left: 16,
    width: 145,
    zIndex: 15,
  },
  hudTile: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
    backgroundColor: 'rgba(12, 18, 38, 0.85)',
    padding: 10,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  widgetTitle: {
    color: '#00E5FF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    fontFamily: MONOSPACE_FONT,
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 229, 255, 0.2)',
    paddingBottom: 4,
    textAlign: 'center',
  },
  widgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  widgetLabel: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 7,
    fontFamily: MONOSPACE_FONT,
    fontWeight: '700',
  },
  widgetVal: {
    color: '#00E5FF',
    fontSize: 7,
    fontFamily: MONOSPACE_FONT,
    fontWeight: 'bold',
  },
  cockpitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 6,
    marginBottom: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 229, 255, 0.15)',
  },
  cockpitBtnText: {
    color: '#00E5FF',
    fontSize: 6.8,
    fontWeight: 'bold',
    fontFamily: MONOSPACE_FONT,
    marginLeft: 4,
  },
  toastContainer: {
    position: 'absolute',
    top: height * 0.4,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  toastCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 157, 0.35)',
    backgroundColor: 'rgba(12, 18, 38, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#00FF9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: '#00FF9D',
    fontSize: 9.5,
    fontWeight: 'bold',
    fontFamily: MONOSPACE_FONT,
    letterSpacing: 0.8,
  },
  bottomDock: {
    position: 'absolute',
    bottom: 110, // Raised further upside to prevent touching the bottom tab bar/safe area
    left: 0,
    right: 0,
    height: 55, // Compact, sleek height
    backgroundColor: 'rgba(6, 10, 28, 0.85)',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
  },
  bottomDockContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6, // Marginally reduced for compact height
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dockItemActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderColor: '#00E5FF',
  },
  dockBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  dockText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: MONOSPACE_FONT,
  },
  dockTextActive: {
    color: '#00E5FF',
  },
  detailCardContainer: {
    position: 'absolute',
    bottom: 180, // Raised further to clear bottomDock (bottom: 110 + height: 55 = 165)
    left: 16,
    right: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 100,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  detailHudCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    backgroundColor: 'rgba(6, 10, 28, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.15)',
    paddingBottom: 10,
    marginBottom: 6,
  },
  detailCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.bold || 'System',
    letterSpacing: 1.5,
  },
  detailCardSubtitle: {
    color: '#00E5FF',
    fontSize: 9,
    fontFamily: MONOSPACE_FONT,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  detailCloseButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailItem: {
    flex: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 229, 255, 0.12)',
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 7.5,
    fontFamily: MONOSPACE_FONT,
    marginBottom: 4,
  },
  detailValue: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: MONOSPACE_FONT,
  },
  detailDescBlock: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailDescText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11.5,
    lineHeight: 16,
  },
  detailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailFooterLabel: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 8,
    fontFamily: MONOSPACE_FONT,
  },
  detailFooterVal: {
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: MONOSPACE_FONT,
    letterSpacing: 0.5,
  },
});

export default SolarSystem3D;
