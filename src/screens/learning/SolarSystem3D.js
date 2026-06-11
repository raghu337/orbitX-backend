import { Canvas, useFrame } from '@react-three/fiber/native';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, PanResponder, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, PinchGestureHandler } from 'react-native-gesture-handler';
import OrbitRing from '../../components/space/OrbitRing';
import PlanetInfoModal from '../../components/space/PlanetInfoModal';
import PlanetMesh from '../../components/space/PlanetMesh';
import SpaceBackground from '../../components/space/SpaceBackground';
import { COLORS, SPACING } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

const SOLAR_SYSTEM = [
  {
    id: 'sun',
    name: 'Sun',
    color: '#FFD24D',
    emissive: '#FFB547',
    scale: 2.5,
    distance: 0,
    diameter: '1,391,000 km',
    distanceFromSun: '0 km',
    moons: '0',
    fact: 'The Sun contains 99.86% of the mass in our solar system and drives the planetary orbits.',
    tagline: 'The engine of our solar system',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#B5B5B5',
    scale: 0.35,
    distance: 6,
    orbitSpeed: 0.035,
    rotationSpeed: 0.018,
    diameter: '4,880 km',
    distanceFromSun: '57.9 million km',
    moons: '0',
    fact: 'Mercury has the shortest orbit around the Sun, completing a year in 88 days.',
    tagline: 'The swift messenger planet',
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#E6CC9F',
    scale: 0.75,
    distance: 9.5,
    orbitSpeed: 0.028,
    rotationSpeed: 0.02,
    diameter: '12,104 km',
    distanceFromSun: '108.2 million km',
    moons: '0',
    fact: 'Venus rotates backwards compared to most planets and has a thick acidic atmosphere.',
    tagline: 'The evening star',
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#3F8BFF',
    scale: 0.8,
    distance: 13.5,
    orbitSpeed: 0.024,
    rotationSpeed: 0.023,
    diameter: '12,742 km',
    distanceFromSun: '149.6 million km',
    moons: '1',
    fact: 'Earth is the only known planet with liquid surface water and a protective magnetic field.',
    tagline: 'Home of life',
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#D95A41',
    scale: 0.42,
    distance: 17,
    orbitSpeed: 0.019,
    rotationSpeed: 0.022,
    diameter: '6,779 km',
    distanceFromSun: '227.9 million km',
    moons: '2',
    fact: 'Mars has the largest volcano and canyon in the solar system: Olympus Mons and Valles Marineris.',
    tagline: 'The red explorer',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#D9B37D',
    scale: 1.7,
    distance: 22,
    orbitSpeed: 0.013,
    rotationSpeed: 0.04,
    diameter: '139,820 km',
    distanceFromSun: '778.5 million km',
    moons: '79+',
    fact: 'Jupiter is so massive that all other planets combined are still smaller than it.',
    tagline: 'The gas giant king',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#E8D09A',
    scale: 1.4,
    distance: 28,
    orbitSpeed: 0.010,
    rotationSpeed: 0.037,
    diameter: '116,460 km',
    distanceFromSun: '1.43 billion km',
    moons: '82+',
    fact: 'Saturn has the most extensive ring system in our solar system, created from ice and rock.',
    tagline: 'The ringed giant',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: '#6FD4E8',
    scale: 1.05,
    distance: 34,
    orbitSpeed: 0.007,
    rotationSpeed: 0.028,
    diameter: '50,724 km',
    distanceFromSun: '2.87 billion km',
    moons: '27',
    fact: 'Uranus rotates on its side so its poles point almost directly at the Sun.',
    tagline: 'The tilted ice giant',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: '#3550D9',
    scale: 1.0,
    distance: 40,
    orbitSpeed: 0.005,
    rotationSpeed: 0.029,
    diameter: '49,244 km',
    distanceFromSun: '4.50 billion km',
    moons: '14',
    fact: 'Neptune has the fastest winds in the solar system, reaching speeds over 2,400 km/h.',
    tagline: 'The deep blue world',
  },
];

const SolarSystem3D = ({ navigation }) => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const cameraRotation = useRef({ x: 0.1, y: 0 });
  const cameraZoom = useRef(32);
  const panStart = useRef({ x: 0, y: 0 });
  const rotationStart = useRef({ x: 0.1, y: 0 });
  const zoomStart = useRef(32);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panStart.current = { x: cameraRotation.current.x, y: cameraRotation.current.y };
      },
      onPanResponderMove: (_, gestureState) => {
        const x = rotationStart.current.x + gestureState.dx * 0.0022;
        const y = Math.max(-0.65, Math.min(0.86, rotationStart.current.y + gestureState.dy * 0.0018));
        cameraRotation.current = { x, y };
      },
      onPanResponderRelease: () => {
        rotationStart.current = { ...cameraRotation.current };
      },
    })
  ).current;

  const handlePinch = ({ nativeEvent }) => {
    const nextZoom = Math.max(16, Math.min(65, zoomStart.current / nativeEvent.scale));
    cameraZoom.current = nextZoom;
  };

  const handlePinchStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === 5) {
      zoomStart.current = cameraZoom.current;
    }
  };

  const handlePlanetSelect = (planet) => {
    if (planet.id === 'sun') return;
    setSelectedPlanet(planet);
  };

  const selectedPlanets = useMemo(() => SOLAR_SYSTEM.filter((planet) => planet.id !== 'sun'), []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.headerContainer} pointerEvents="box-none">
        <View style={styles.topBar}>
          <View>
            <Text style={styles.screenTitle}>Solar System 3D</Text>
            <Text style={styles.screenSubtitle}>Interactive planetary orbits, realistic motion, and glassmorphism details.</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.quickStats}>
          <Text style={styles.quickStat}>8 planets</Text>
          <Text style={styles.quickStat}>Real axis rotation</Text>
          <Text style={styles.quickStat}>Tap a planet for info</Text>
        </View>
      </SafeAreaView>

      <PinchGestureHandler onGestureEvent={handlePinch} onHandlerStateChange={handlePinchStateChange}>
        <View style={styles.gestureSurface} {...panResponder.panHandlers}>
          <View style={styles.canvasWrapper}>
            <Canvas
              style={styles.canvas}
              camera={{ position: [0, 10, cameraZoom.current], fov: 50 }}
              onCreated={({ camera }) => {
                camera.position.set(0, 10, cameraZoom.current);
              }}
            >
              <fog attach="fog" args={[COLORS.background, 20, 120]} />
              <ambientLight intensity={0.45} />
              <directionalLight position={[8, 16, 8]} intensity={1.05} />
              <SpaceBackground starCount={280} />
              <mesh>
                <sphereGeometry args={[2.5, 64, 64]} />
                <meshBasicMaterial color="#FFD24D" emissive="#FFB547" opacity={0.8} transparent />
              </mesh>
              {selectedPlanets.map((planet) => (
                <React.Fragment key={planet.id}>
                  <OrbitRing radius={planet.distance} />
                  <PlanetMesh
                    planet={planet}
                    scale={planet.scale}
                    distance={planet.distance}
                    orbitSpeed={planet.orbitSpeed}
                    rotationSpeed={planet.rotationSpeed}
                    onSelect={handlePlanetSelect}
                    isSelected={selectedPlanet?.id === planet.id}
                  />
                </React.Fragment>
              ))}
              <CameraController rotationRef={cameraRotation} zoomRef={cameraZoom} />
            </Canvas>
          </View>
        </View>
      </PinchGestureHandler>

      <View style={styles.navigatorHint} pointerEvents="none">
        <View style={styles.hintBadge}>
          <Text style={styles.hintText}>Drag to rotate • Pinch to zoom • Tap planets</Text>
        </View>
      </View>

      <PlanetInfoModal visible={Boolean(selectedPlanet)} planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
    </GestureHandlerRootView>
  );
};

const CameraController = ({ rotationRef, zoomRef }) => {
  useFrame(({ camera }) => {
    camera.position.x = Math.sin(rotationRef.current.x) * zoomRef.current;
    camera.position.y = 8 + rotationRef.current.y * 5;
    camera.position.z = Math.cos(rotationRef.current.x) * zoomRef.current;
    camera.lookAt(0, 0, 0);
    if (camera.zoom !== 1) camera.updateProjectionMatrix();
  });
  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    position: 'absolute',
    zIndex: 3,
    width: '100%',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  screenTitle: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '800',
  },
  screenSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 6,
    maxWidth: width * 0.7,
  },
  backButton: {
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.28)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  backButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  quickStats: {
    backgroundColor: 'rgba(3, 9, 34, 0.65)',
    borderRadius: 24,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.16)',
  },
  quickStat: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  canvasWrapper: {
    flex: 1,
    marginTop: 120,
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
  navigatorHint: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.18)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  hintText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});

export default SolarSystem3D;
