import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    InteractionManager,
    PanResponder,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmbientSpaceParticles, MicroInteractionFeedback } from '../components/dashboard/AmbientSpaceParticles';
import { useDynamicCamera } from '../components/dashboard/DynamicCameraController';
import { AnimatedCloudLayer, EarthWithDayNightShader } from '../components/dashboard/EarthWithDayNightShader';
import { HolographicSatellitePopup } from '../components/dashboard/HolographicSatellitePopup';
import { CinematicTransitionOverlay, FloatingGlassmorphismCard, MissionControlStatusBar } from '../components/dashboard/MissionControlUI';
import { PlanetInfoPanel } from '../components/dashboard/PlanetInfoPanel';
import { SatelliteDataGrid } from '../components/dashboard/SatelliteDataPanel';
import { AnimatedOrbitPaths, SatelliteTrails } from '../components/dashboard/SatelliteTrailsAnimated';

const { width, height } = Dimensions.get('window');

// N2YO API Configuration
const N2YO_API_KEY = '893ARH-FAXAAK-PGN6C6-5RBF';
const N2YO_BASE_URL = 'https://api.n2yo.com/rest/v1/satellite';

// Enhanced satellite data
const DEFAULT_SATELLITES = [
  {
    id: '25544',
    name: 'ISS',
    label: 'ISS',
    noradId: 25544,
    angle: 0,
    orbitAltitude: 120,
    color: '#00ffff',
  },
  {
    id: '20580',
    name: 'HUBBLE',
    label: 'HST',
    noradId: 20580,
    angle: 120,
    orbitAltitude: 150,
    color: '#0099ff',
  },
  {
    id: '39444',
    name: 'NOAA 20',
    label: 'NOAA',
    noradId: 39444,
    angle: 240,
    orbitAltitude: 180,
    color: '#00ff88',
  },
  {
    id: '39634',
    name: 'SENTINEL-1A',
    label: 'SENT',
    noradId: 39634,
    angle: 60,
    orbitAltitude: 200,
    color: '#ffaa00',
  },
];

const EARTH_RADIUS = 80;
const ORBIT_VISUALIZATION_SIZE = 320;

/**
 * Enhanced Cinematic Planet Explorer Screen
 * Features:
 * - Dynamic camera movement with multiple modes
 * - Day/night Earth shader with city lights
 * - Satellite trails with glow effects
 * - Holographic interactive popups
 * - Mission control style UI
 * - Ambient space particles
 * - Smooth 60 FPS animations
 * - Android optimized performance
 * - Cinematic transitions
 */
const PlanetExplorer = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // State
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [satellites, setSatellites] = useState(DEFAULT_SATELLITES);
  const [activeSatellite, setActiveSatellite] = useState(DEFAULT_SATELLITES[0]);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [cameraMode, setCameraMode] = useState('idle');
  const [sunAngle, setSunAngle] = useState(0);
  const [systemHealth, setSystemHealth] = useState(98);
  const [signalStrength, setSignalStrength] = useState(95);
  const [transitioning, setTransitioning] = useState(false);

  // Animations
  const earthRotationAnim = useRef(new Animated.Value(0)).current;
  const orbitAnimationAnim = useRef(new Animated.Value(0)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const localScale = useRef(1);
  const scrollViewOpacity = useRef(new Animated.Value(1)).current;
  const microInteractionPos = useRef({ x: 0, y: 0 });
  const isMicroInteractionActive = useRef(false);

  // Camera controller
  const camera = useDynamicCamera(true, cameraMode);

  // Pan responder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 8 || Math.abs(gestureState.dy) > 8;
      },
      onPanResponderMove: (_, gestureState) => {
        setDragOffset({
          x: (gestureState.dx / width) * 30,
          y: (gestureState.dy / height) * 30,
        });
        setCameraMode('manual');
      },
      onPanResponderRelease: () => {
        setDragOffset({ x: 0, y: 0 });
        setCameraMode('idle');
      },
      onPanResponderTerminate: () => {
        setDragOffset({ x: 0, y: 0 });
        setCameraMode('idle');
      },
    })
  ).current;

  // Pinch gesture handler
  const handlePinch = Animated.event([{ nativeEvent: { scale: pinchScale } }], {
    useNativeDriver: false,
  });

  const handlePinchStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const newScale = Math.max(0.8, Math.min(2.5, localScale.current * event.nativeEvent.scale));
      localScale.current = newScale;
      pinchScale.setValue(newScale);
      triggerMicroInteraction(event.nativeEvent.x, event.nativeEvent.y);
    }
  };

  // Micro-interaction trigger
  const triggerMicroInteraction = (x, y) => {
    microInteractionPos.current = { x, y };
    isMicroInteractionActive.current = true;
    setTimeout(() => {
      isMicroInteractionActive.current = false;
    }, 600);
  };

  // Fetch satellite data from N2YO API
  const fetchSatelliteData = useCallback(async () => {
    try {
      setLoading(true);
      const userLat = 15.5047; // India
      const userLon = 77.376;
      const userAltitude = 0;

      // Update sun angle (simulated - in real app, calculate from time)
      setSunAngle((prev) => (prev + 45) % 360);

      // Fetch real satellite data
      const updatedSatellites = await Promise.all(
        DEFAULT_SATELLITES.slice(0, 3).map(async (sat) => {
          try {
            const url = `${N2YO_BASE_URL}/positions/${sat.noradId}/${userLat}/${userLon}/${userAltitude}/1?apiKey=${N2YO_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.positions && data.positions.length > 0) {
              const pos = data.positions[0];
              return {
                ...sat,
                latitude: pos.satlatitude,
                longitude: pos.satlongitude,
                altitude: pos.sataltitude,
                speed: (7.66 + Math.random() * 0.5).toFixed(2),
              };
            }
            return sat;
          } catch (error) {
            console.error(`Failed to fetch ${sat.name}:`, error);
            return sat;
          }
        })
      );

      setSatellites(updatedSatellites);
      if (updatedSatellites.length > 0) {
        setActiveSatellite(updatedSatellites[0]);
      }

      // Simulate system health fluctuation
      setSystemHealth((prev) => Math.min(100, prev + Math.random() * 4 - 1));
    } catch (error) {
      console.error('Failed to fetch satellites:', error);
      setSatellites(DEFAULT_SATELLITES);
    } finally {
      setLoading(false);
    }
  }, []);

  // Start rotation animations
  useEffect(() => {
    if (autoRotate && cameraMode === 'idle') {
      const earthRotLoop = Animated.loop(
        Animated.timing(earthRotationAnim, {
          toValue: 1,
          duration: 40000,
          useNativeDriver: false,
        })
      );

      const orbitLoop = Animated.loop(
        Animated.timing(orbitAnimationAnim, {
          toValue: 1,
          duration: 30000,
          useNativeDriver: false,
        })
      );

      earthRotLoop.start();
      orbitLoop.start();

      return () => {
        earthRotLoop.stop();
        orbitLoop.stop();
      };
    }
  }, [autoRotate, cameraMode, earthRotationAnim, orbitAnimationAnim]);

  // Initial load
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      fetchSatelliteData();
    });

    return () => task.cancel();
  }, [fetchSatelliteData]);

  // Interpolate animations
  const earthRotationZ = earthRotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const orbitRotation = orbitAnimationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Transform for Earth
  const earthTransform = {
    transform: [
      { rotateZ: earthRotationZ },
      { perspective: 1000 },
      { rotateY: `${dragOffset.x}deg` },
      { rotateX: `${dragOffset.y}deg` },
      { scale: pinchScale },
    ],
  };

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTransitioning(true);
    fetchSatelliteData().then(() => {
      setRefreshing(false);
      setTransitioning(false);
    });
  }, [fetchSatelliteData]);

  const toggleInfo = () => {
    Animated.timing(scrollViewOpacity, {
      toValue: showInfo ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowInfo(!showInfo);
  };

  const toggleCameraMode = () => {
    const modes = ['idle', 'orbiting', 'tracking'];
    const currentIdx = modes.indexOf(cameraMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    setCameraMode(nextMode);
  };

  const resetView = () => {
    setTransitioning(true);
    setDragOffset({ x: 0, y: 0 });
    localScale.current = 1;
    pinchScale.setValue(1);
    camera.resetCamera();
    setCameraMode('idle');
    setTimeout(() => setTransitioning(false), 800);
  };

  const handleSatellitePress = (satellite) => {
    setActiveSatellite(satellite);
    setShowPopup(true);
    triggerMicroInteraction(width / 2, height / 2);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Ambient space particles background */}
      <AmbientSpaceParticles particleCount={150} depth={3} speed="slow" />

      {/* Main gradient background */}
      <LinearGradient
        colors={['#02040b', '#020d1f', '#08112f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Cinematic transition overlay */}
      <CinematicTransitionOverlay
        isActive={transitioning}
        direction="fade"
        duration={600}
      />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Mission Control Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.sectionLabel}>◆ MISSION CONTROL ◆</Text>
            <Text style={styles.headerTitle}>CINEMATIC EXPLORER</Text>
            <Text style={styles.headerSubtitle}>Real-Time Satellite Tracking System</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={resetView}
              style={({ pressed }) => [
                styles.iconButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#00e5ff" />
            </Pressable>
            <Pressable
              onPress={toggleCameraMode}
              style={({ pressed }) => [
                styles.iconButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <MaterialCommunityIcons name="video-camera" size={22} color="#0099ff" />
            </Pressable>
            <Pressable
              onPress={toggleInfo}
              style={({ pressed }) => [
                styles.iconButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <MaterialCommunityIcons
                name={showInfo ? 'information' : 'information-outline'}
                size={22}
                color="#00ff88"
              />
            </Pressable>
          </View>
        </View>

        {/* Mission Control Status Bar */}
        <MissionControlStatusBar
          activeSatelliteCount={satellites.length}
          systemHealth={Math.round(systemHealth)}
          signalStrength={signalStrength}
          dataRate={2.4}
        />

        {/* Earth Visualization Container */}
        <View style={styles.earthContainer} {...panResponder.panHandlers}>
          <PinchGestureHandler
            onGestureEvent={handlePinch}
            onHandlerStateChange={handlePinchStateChange}
          >
            <Animated.View style={styles.pinchContainer}>
              {/* Enhanced Earth with day/night shader */}
              <Animated.View style={[styles.earthWrapper, earthTransform]}>
                {/* Animated orbit paths */}
                <AnimatedOrbitPaths
                  size={ORBIT_VISUALIZATION_SIZE}
                  earthRadius={EARTH_RADIUS}
                  orbitCount={3}
                  rotationProgress={dragOffset.x}
                />

                {/* Earth with day/night shader */}
                <EarthWithDayNightShader
                  size={EARTH_RADIUS * 2}
                  rotationZ={0}
                  rotationX={dragOffset.y}
                  rotationY={dragOffset.x}
                  scale={1}
                  sunAngle={sunAngle}
                />

                {/* Animated cloud layer */}
                <View style={styles.cloudLayerWrapper}>
                  <AnimatedCloudLayer size={EARTH_RADIUS * 2} cloudSpeed={8000} />
                </View>

                {/* Satellite trails */}
                <SatelliteTrails
                  satellites={satellites}
                  earthRadius={EARTH_RADIUS}
                  size={ORBIT_VISUALIZATION_SIZE}
                  animationProgress={orbitAnimationAnim}
                  trailLength={25}
                />
              </Animated.View>

              {/* Micro-interaction feedback */}
              {isMicroInteractionActive.current && (
                <MicroInteractionFeedback
                  isActive={true}
                  position={microInteractionPos.current}
                />
              )}
            </Animated.View>
          </PinchGestureHandler>
        </View>

        {/* Floating info cards */}
        <Animated.View style={[styles.floatingCardsContainer, { opacity: scrollViewOpacity }]}>
          <FloatingGlassmorphismCard
            title="ACTIVE TRACKING"
            value={satellites.length.toString()}
            unit="SV"
            icon="satellite"
            color="#00ffff"
            showGlow={true}
          />
          <FloatingGlassmorphismCard
            title="SYSTEM HEALTH"
            value={Math.round(systemHealth).toString()}
            unit="%"
            icon="heart-pulse"
            color="#00ff88"
            showGlow={true}
          />
        </Animated.View>

        {/* Satellite data cards */}
        <Animated.View style={[styles.satelliteCardsContainer, { opacity: scrollViewOpacity }]}>
          {loading ? (
            <ActivityIndicator size="large" color="#00e5ff" style={styles.loader} />
          ) : (
            <>
              <Text style={styles.sectionTitle}>LIVE SATELLITE DATA</Text>
              <SatelliteDataGrid
                satellites={satellites}
                onSelectSatellite={handleSatellitePress}
              />
            </>
          )}
        </Animated.View>

        {/* Planet info panel */}
        <Animated.View style={[styles.infoContainer, { opacity: scrollViewOpacity }]}>
          <PlanetInfoPanel
            planet={{
              temperature: '−88 to 58 °C',
              gravity: '9.81 m/s²',
              pressure: '101.3 kPa',
              magneticField: '30-60 µT',
              escapeVelocity: '11.2 km/s',
              rotationPeriod: '24 hours',
              distanceFromSun: '149.6M km',
            }}
          />
        </Animated.View>
      </ScrollView>

      {/* Holographic satellite popup */}
      <HolographicSatellitePopup
        satellite={activeSatellite}
        isVisible={showPopup}
        onClose={() => setShowPopup(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#02040b',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.1)',
  },
  sectionLabel: {
    fontSize: 10,
    color: '#00e5ff',
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#0099ff',
    fontWeight: '500',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earthContainer: {
    width: '100%',
    height: 400,
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinchContainer: {
    width: ORBIT_VISUALIZATION_SIZE + 40,
    height: ORBIT_VISUALIZATION_SIZE + 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earthWrapper: {
    width: ORBIT_VISUALIZATION_SIZE,
    height: ORBIT_VISUALIZATION_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cloudLayerWrapper: {
    position: 'absolute',
    width: EARTH_RADIUS * 2,
    height: EARTH_RADIUS * 2,
  },
  floatingCardsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  satelliteCardsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00e5ff',
    letterSpacing: 2,
    marginBottom: 12,
  },
  infoContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  loader: {
    marginVertical: 40,
  },
});

export default PlanetExplorer;
