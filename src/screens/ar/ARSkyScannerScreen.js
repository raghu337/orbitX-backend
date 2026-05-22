import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { DeviceMotion } from 'expo-sensors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  useDerivedValue,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import ARHud from '../../components/ar/ARHud';
import ScannerOverlay from '../../components/ar/ScannerOverlay';
import CompassOverlay from '../../components/ar/CompassOverlay';
import SatelliteMarker from '../../components/ar/SatelliteMarker';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

const ARSkyScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [status, setStatus] = useState('SCANNING');
  
  // Reanimated shared values for high-performance sensor tracking
  const rotationAlpha = useSharedValue(0);
  const rotationBeta = useSharedValue(0);
  const rotationGamma = useSharedValue(0);

  // EMA Filter factor (0.1 = heavy smoothing, 1.0 = no smoothing)
  const FILTER_FACTOR = 0.2;

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(cameraStatus === 'granted');
    })();

    // Fast update interval for smooth tracking
    DeviceMotion.setUpdateInterval(16); // ~60 FPS

    const subscription = DeviceMotion.addListener(data => {
      if (data.rotation) {
        // Apply Low-Pass Filter (EMA) to reduce jitter
        rotationAlpha.value = rotationAlpha.value + FILTER_FACTOR * (data.rotation.alpha - rotationAlpha.value);
        rotationBeta.value = rotationBeta.value + FILTER_FACTOR * (data.rotation.beta - rotationBeta.value);
        rotationGamma.value = rotationGamma.value + FILTER_FACTOR * (data.rotation.gamma - rotationGamma.value);
      }
    });

    const timer = setTimeout(() => setStatus('SATELLITE_DETECTED'), 3000);

    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
  }, []);

  // Calculate dynamic heading for compass
  const derivedHeading = useDerivedValue(() => {
    return (rotationAlpha.value * 180 / Math.PI);
  });

  if (hasPermission === null) {
    return <View style={styles.center}><Text style={styles.text}>Requesting camera access...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.center}><Text style={styles.text}>No access to camera</Text></View>;
  }

  // Simulated satellites with dynamic offsets based on device orientation
  const simulatedSatellites = [
    { id: '1', name: 'ISS (ZARYA)', baseAz: 0, baseEl: 45 },
    { id: '2', name: 'STARLINK-5432', baseAz: 45, baseEl: 30 },
    { id: '3', name: 'GPS BIIF-10', baseAz: -30, baseEl: 60 },
  ];

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type="back">

        <ScannerOverlay />
        
        {simulatedSatellites.map(sat => (
          <SatelliteMarkerWrapper 
            key={sat.id}
            name={sat.name}
            baseAz={sat.baseAz}
            baseEl={sat.baseEl}
            alpha={rotationAlpha}
            beta={rotationBeta}
            visible={status === 'SATELLITE_DETECTED'}
          />
        ))}

        <ARHud 
          lat={-34.6037} 
          lon={-58.3816} 
          alt={25} 
          status={status} 
        />
        
        <AnimatedCompass heading={derivedHeading} />

        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.bottomInstruction}>
          <Text style={styles.instructionText}>
            {status === 'SCANNING' ? 'SCANNING HORIZON FOR ORBITALS...' : '3 SATELLITES DETECTED IN SECTOR'}
          </Text>
        </View>
      </Camera>
    </View>
  );
};

// Specialized wrapper for markers to ensure 60FPS position updates
const SatelliteMarkerWrapper = ({ name, baseAz, baseEl, alpha, beta, visible }) => {
  const animatedStyle = useAnimatedStyle(() => {
    // Basic AR projection (simplified for Expo sensors)
    const xOffset = interpolate(alpha.value * 180 / Math.PI, [baseAz - 20, baseAz + 20], [width, 0], Extrapolate.CLAMP);
    const yOffset = interpolate(beta.value * 180 / Math.PI, [baseEl - 20, baseEl + 20], [height, 0], Extrapolate.CLAMP);

    return {
      transform: [
        { translateX: xOffset - 25 },
        { translateY: yOffset - 25 },
        { scale: withTiming(visible ? 1 : 0) }
      ],
      opacity: withTiming(visible ? 1 : 0)
    };
  });

  return (
    <Animated.View style={[styles.markerContainer, animatedStyle]}>
      <SatelliteMarker name={name} visible={true} />
    </Animated.View>
  );
};

const AnimatedCompass = ({ heading }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-heading.value}deg` }]
  }));

  return (
    <View style={styles.compassWrapper}>
      <Animated.View style={animatedStyle}>
        <CompassOverlay heading={0} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 100,
  },
  bottomInstruction: {
    position: 'absolute',
    bottom: 120,
    width: '100%',
    alignItems: 'center',
  },
  instructionText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.primary,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    letterSpacing: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  markerContainer: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
  compassWrapper: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  }
});

export default ARSkyScannerScreen;
