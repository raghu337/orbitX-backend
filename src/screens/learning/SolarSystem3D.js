import { useIsFocused } from '@react-navigation/native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { BlurView } from 'expo-blur';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, PanResponder, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, PinchGestureHandler } from 'react-native-gesture-handler';
import * as THREE from 'three';
import Svg, { Path, Circle, Line as SvgLine, Text as SvgText } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import OrbitRing from '../../components/space/OrbitRing';
import PlanetMesh from '../../components/space/PlanetMesh';
import SpaceBackground from '../../components/space/SpaceBackground';
import { COLORS, SPACING, FONTS } from '../../theme/theme';

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

const SolarSystem3D = ({ navigation }) => {
  const isFocused = useIsFocused();
  
  // Set Mars as default target locked planet
  const [selectedPlanet, setSelectedPlanet] = useState(SOLAR_SYSTEM[4]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [scannedPlanets, setScannedPlanets] = useState({ mars: true });

  // 2D screen coordinate projection for selected planet
  const [marsScreenPos, setMarsScreenPos] = useState({ x: width / 2, y: height * 0.5 });

  // Camera coordinates refs - Adjusted for optimal portrait viewing angle
  const cameraRotation = useRef({ x: 0.0, y: 0.85 });
  const cameraZoom = useRef(55);
  const targetLookAt = useRef({ x: 0, y: -2, z: 0 });
  
  // Gesture start refs
  const rotationStart = useRef({ x: 0.0, y: 0.85 });
  const zoomStart = useRef(55);
  const lookAtStart = useRef({ x: 0, y: -2, z: 0 });

  // Share planet 3D coordinates ref
  const planetPositions = useRef({});

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        rotationStart.current = { x: cameraRotation.current.x, y: cameraRotation.current.y };
        zoomStart.current = cameraZoom.current;
        if (targetLookAt && targetLookAt.current) {
          lookAtStart.current = { ...targetLookAt.current };
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = gestureState.numberActiveTouches || (evt.nativeEvent.touches && evt.nativeEvent.touches.length) || 1;
        
        if (touches === 2) {
          const scaleFactor = 0.022 * (cameraZoom.current / 55);
          const dx = gestureState.dx * scaleFactor;
          const dy = gestureState.dy * scaleFactor;
          const theta = cameraRotation.current.x;
          if (targetLookAt && targetLookAt.current && lookAtStart && lookAtStart.current) {
            targetLookAt.current.x = lookAtStart.current.x - (dx * Math.cos(theta) - dy * Math.sin(theta));
            targetLookAt.current.z = lookAtStart.current.z - (dx * Math.sin(theta) + dy * Math.cos(theta));
          }
        } else {
          const x = rotationStart.current.x - gestureState.dx * 0.0028;
          const y = Math.max(0.1, Math.min(1.4, rotationStart.current.y + gestureState.dy * 0.0024));
          cameraRotation.current = { x, y };
        }
      },
      onPanResponderRelease: () => {
        rotationStart.current = { ...cameraRotation.current };
        if (targetLookAt && targetLookAt.current) {
          lookAtStart.current = { ...targetLookAt.current };
        }
      },
    })
  ).current;

  const handlePinch = ({ nativeEvent }) => {
    const nextZoom = Math.max(15, Math.min(85, zoomStart.current / nativeEvent.scale));
    cameraZoom.current = nextZoom;
  };

  const handlePinchStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === 5) {
      zoomStart.current = cameraZoom.current;
    }
  };

  const handlePlanetSelect = (planet) => {
    setIsScanning(false);
    setSelectedPlanet(planet);
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
      progress += 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsScanning(false);
        setScannedPlanets((prev) => ({ ...prev, [selectedPlanet.id]: true }));
      }
      setScanProgress(progress);
    }, 80);
  };

  const visiblePlanets = useMemo(() => SOLAR_SYSTEM.filter((planet) => planet.id !== 'sun'), []);

  // Compute indicator line path data
  const indicatorLinePath = useMemo(() => {
    if (!marsScreenPos) return '';
    const x1 = marsScreenPos.x;
    const y1 = marsScreenPos.y;
    const x2 = ANCHOR_X;
    const y2 = ANCHOR_Y;
    
    // Draw sci-fi joint line
    const dx = x1 < x2 ? 22 : -22;
    return `M ${x1} ${y1} L ${x1 + dx} ${y1 + 18} L ${x1 + dx * 2} ${y2} L ${x2} ${y2}`;
  }, [marsScreenPos]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#040714" />
      
      {/* Outer Sci-fi Neon Frame Overlay */}
      <View style={styles.outerBorderFrame} pointerEvents="none">
        <View style={[styles.cornerFrame, styles.topLeftCorner]} />
        <View style={[styles.cornerFrame, styles.topRightCorner]} />
        <View style={[styles.cornerFrame, styles.bottomLeftCorner]} />
        <View style={[styles.cornerFrame, styles.bottomRightCorner]} />
        
        {/* Telemetry Markers */}
        <Text style={[styles.hudMarkerText, { top: 92, left: 20 }]}>[SYS-HUD: 3D]</Text>
        <Text style={[styles.hudMarkerText, { top: 92, right: 20 }]}>GRID: TACTICAL</Text>
        <Text style={[styles.hudMarkerText, { bottom: 100, right: 20 }]}>
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
      </SafeAreaView>

      {/* 3D Canvas Viewport */}
      <PinchGestureHandler onGestureEvent={handlePinch} onHandlerStateChange={handlePinchStateChange}>
        <View style={styles.gestureSurface} {...panResponder.panHandlers}>
          <View style={styles.canvasWrapper}>
            {isFocused && (
              <Canvas
                style={styles.canvas}
                shadows={{ type: THREE.PCFShadowMap }}
                camera={{ position: [0, 22, 55], fov: 60 }}
              >
                <fog attach="fog" args={['#040714', 25, 140]} />
                <ambientLight intensity={0.25} />

                {/* Starry space background */}
                <SpaceBackground starCount={340} />

                {/* Center Sun mesh with emissive material */}
                <mesh position={[0, 0, 0]}>
                  <sphereGeometry args={[2.5, 64, 64]} />
                  <meshStandardMaterial color="#FFFFFF" emissive="#FF9D00" emissiveIntensity={3.5} />
                  <pointLight
                    castShadow
                    intensity={3.2}
                    distance={130}
                    decay={1.2}
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                  />
                </mesh>

                {/* Glowing coronas */}
                <mesh>
                  <sphereGeometry args={[2.5 * 1.15, 32, 32]} />
                  <meshBasicMaterial
                    color="#FF9D00"
                    transparent
                    opacity={0.45}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                  />
                </mesh>
                <mesh>
                  <sphereGeometry args={[2.5 * 1.35, 32, 32]} />
                  <meshBasicMaterial
                    color="#FF6B00"
                    transparent
                    opacity={0.2}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                  />
                </mesh>

                {/* Planet Orbits and Meshes */}
                {visiblePlanets.map((planet) => (
                  <React.Fragment key={planet.id}>
                    <OrbitRing radius={planet.distance} color={planet.color} opacity={0.14} />
                    <PlanetMesh
                      planet={planet}
                      scale={planet.scale}
                      distance={planet.distance}
                      orbitSpeed={planet.orbitSpeed}
                      rotationSpeed={planet.rotationSpeed}
                      onSelect={handlePlanetSelect}
                      isSelected={selectedPlanet?.id === planet.id}
                      planetPositionsRef={planetPositions}
                      isScanning={isScanning && selectedPlanet?.id === planet.id}
                    />
                  </React.Fragment>
                ))}

                {/* Camera controller & Planet projector */}
                <CameraController
                  rotationRef={cameraRotation}
                  zoomRef={cameraZoom}
                  targetLookAt={targetLookAt}
                  selectedPlanet={selectedPlanet}
                  planetPositionsRef={planetPositions}
                  onMarsProject={setMarsScreenPos}
                />
              </Canvas>
            )}
          </View>
        </View>
      </PinchGestureHandler>

      {/* SVG Indicator Line & Target Reticles Overlay */}
      {selectedPlanet && (
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

      {/* Floating Glassmorphic Unified Telemetry Data Panel */}
      {selectedPlanet && (
        <View style={styles.marsDataPanel}>
          <BlurView intensity={45} tint="dark" style={styles.hudCard}>
            <View style={styles.panelHeaderRow}>
              <View>
                <Text style={styles.panelTitle}>PLANET DATA: {selectedPlanet.name.toUpperCase()}</Text>
                <Text style={styles.panelSubtitle}>
                  {selectedPlanet.id === 'mars' ? 'TARGET LOCKED' : selectedPlanet.tagline}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {scannedPlanets[selectedPlanet.id] && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>SCANNED</Text>
                  </View>
                )}
                <TouchableOpacity style={[styles.closeButton, { marginLeft: 8 }]} onPress={() => setSelectedPlanet(null)}>
                  <Text style={styles.closeButtonText}>CLOSE</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Structured Telemetry Row Grids */}
            <View style={styles.dataGrid}>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>DIAMETER</Text>
                <Text style={styles.dataValue}>{selectedPlanet.diameter.toUpperCase()}</Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>AVG. DISTANCE</Text>
                <Text style={styles.dataValue}>{selectedPlanet.distanceFromSun.toUpperCase()}</Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>ORBITAL SPEED</Text>
                <Text style={styles.dataValue}>{selectedPlanet.velocity.toUpperCase()}</Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>SURFACE TEMP</Text>
                <Text style={styles.dataValue}>{selectedPlanet.temperature}</Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>GRAVITY</Text>
                <Text style={styles.dataValue}>{selectedPlanet.gravity || 'N/A'}</Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>MOONS</Text>
                <Text style={styles.dataValue}>{selectedPlanet.moons.toUpperCase()}</Text>
              </View>
            </View>

            {/* Interactive Scanning or Fact descriptions */}
            {isScanning ? (
              <View style={styles.scanProgressBlock}>
                <Text style={styles.scanProgressText}>PROBE SCANNING... {scanProgress}%</Text>
                <View style={styles.scanProgressBar}>
                  <View style={[styles.scanProgressFill, { width: `${scanProgress}%` }]} />
                </View>
              </View>
            ) : scannedPlanets[selectedPlanet.id] ? (
              <View style={styles.descriptionBlock}>
                <Text style={styles.descriptionText}>{selectedPlanet.fact}</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.tacticalScanButton} onPress={handleStartScan}>
                <Text style={styles.tacticalScanText}>INITIATE RADAR PROBE SCAN</Text>
              </TouchableOpacity>
            )}

            {/* Data Source Footer */}
            <View style={styles.sourceFooter}>
              <Text style={styles.sourceLabel}>DATA SOURCE:</Text>
              <Text style={styles.sourceValue}>ORBITX HELIOCORE ENHANCED</Text>
            </View>
          </BlurView>
        </View>
      )}

      {/* Heliocentric Quick Selector if no planet selected */}
      {!selectedPlanet && (
        <View style={styles.marsDataPanel}>
          <BlurView intensity={30} tint="dark" style={styles.hudCard}>
            <Text style={styles.systemCoreTitle}>HELIOCENTRIC CORE TELEMETRY</Text>
            <Text style={styles.systemCoreSubtitle}>SELECT A CELESTIAL BODY IN VIEWPORT OR CONSOLE LIST</Text>
            <View style={styles.quickSelector}>
              {SOLAR_SYSTEM.filter(p => p.id !== 'sun').map((p) => (
                <TouchableOpacity
                   key={p.id}
                   style={[styles.quickSelectBtn, { borderColor: p.color + '40' }]}
                   onPress={() => handlePlanetSelect(p)}
                >
                  <Text style={[styles.quickSelectBtnText, { color: p.color }]}>
                    {p.name.substring(0, 3).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
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
              onPress={() => handlePlanetSelect(SOLAR_SYSTEM[4])} // Lock Mars
            >
              <View style={styles.activeIconWrapper}>
                <MaterialCommunityIcons name="earth" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.tabLabelActive}>Explorer</Text>
              <View style={styles.activeIndicatorBar} />
            </TouchableOpacity>

            {/* Tab 4: Facts */}
            <TouchableOpacity 
              style={styles.tabItem}
              onPress={() => navigation.navigate('HomeDashboard', { screen: 'Facts' })}
            >
              <MaterialCommunityIcons name="rocket-launch-outline" size={20} color="rgba(255, 255, 255, 0.45)" />
              <Text style={styles.tabLabel}>Space Facts</Text>
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
    </GestureHandlerRootView>
  );
};

const CameraController = ({ rotationRef, zoomRef, targetLookAt, selectedPlanet, planetPositionsRef, onMarsProject }) => {
  const { camera, size } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentZoom = useRef(55);
  const currentRotation = useRef({ x: 0.0, y: 0.85 });

  useFrame((state) => {
    if (!camera) return;

    let targetX = 0;
    let targetY = 0;
    let targetZ = 0;
    let targetZoomVal = zoomRef ? zoomRef.current : 55;

    // Follow selected planet position dynamically if locked
    if (selectedPlanet && planetPositionsRef && planetPositionsRef.current && planetPositionsRef.current[selectedPlanet.id]) {
      const pos = planetPositionsRef.current[selectedPlanet.id];
      targetX = pos.x;
      targetY = pos.y;
      targetZ = pos.z;
      // Adjust target zoom value dynamically based on planet scale
      targetZoomVal = selectedPlanet.scale * 8 + 6;
    } else {
      if (targetLookAt && targetLookAt.current) {
        targetX = targetLookAt.current.x;
        targetY = targetLookAt.current.y;
        targetZ = targetLookAt.current.z;
      }
      if (zoomRef && zoomRef.current) {
        targetZoomVal = zoomRef.current;
      }
    }

    if (currentLookAt && currentLookAt.current) {
      // Apply damping interpolation (LERP)
      currentLookAt.current.x += (targetX - currentLookAt.current.x) * 0.08;
      currentLookAt.current.y += (targetY - currentLookAt.current.y) * 0.08;
      currentLookAt.current.z += (targetZ - currentLookAt.current.z) * 0.08;
    }

    if (currentZoom && currentZoom.current) {
      currentZoom.current += (targetZoomVal - currentZoom.current) * 0.08;
    }

    if (currentRotation && currentRotation.current && rotationRef && rotationRef.current) {
      currentRotation.current.x += (rotationRef.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (rotationRef.current.y - currentRotation.current.y) * 0.08;
    }

    if (camera && currentLookAt && currentLookAt.current && currentRotation && currentRotation.current && currentZoom) {
      // Position camera using cylindrical coordinates
      camera.position.x = currentLookAt.current.x + Math.sin(currentRotation.current.x) * currentZoom.current;
      camera.position.y = currentLookAt.current.y + Math.sin(currentRotation.current.y) * currentZoom.current * 0.6 + 6;
      camera.position.z = currentLookAt.current.z + Math.cos(currentRotation.current.x) * currentZoom.current;

      camera.lookAt(currentLookAt.current);
      camera.updateProjectionMatrix();
    }

    // Project selected planet position to 2D screen coordinates
    if (selectedPlanet && planetPositionsRef && planetPositionsRef.current && planetPositionsRef.current[selectedPlanet.id] && onMarsProject && camera && size) {
      const planetPos = planetPositionsRef.current[selectedPlanet.id];
      const vector = new THREE.Vector3(planetPos.x, planetPos.y, planetPos.z);
      vector.project(camera);
      const x = (vector.x * 0.5 + 0.5) * size.width;
      const y = (-(vector.y) * 0.5 + 0.5) * size.height;
      onMarsProject({ x, y });
    }
  });

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040714',
  },
  outerBorderFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.22)',
    margin: 10,
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
  canvasWrapper: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  canvas: {
    width: '100%',
    height: '100%',
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
});

export default SolarSystem3D;
