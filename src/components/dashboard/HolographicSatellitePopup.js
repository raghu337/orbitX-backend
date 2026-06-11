import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Holographic Satellite Detail Popup
 * Features:
 * - Neon holographic frame
 * - Animated entrance/exit
 * - Real-time data display
 * - Interactive close button
 * - Mission control styling
 */
export const HolographicSatellitePopup = ({
  satellite = {},
  isVisible = false,
  onClose = () => {},
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsActive(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Gentle rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 360,
          duration: 20000,
          useNativeDriver: false,
        })
      ).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setIsActive(false));
    }

    return () => {
      rotateAnim.setValue(0);
    };
  }, [isVisible, scaleAnim, opacityAnim, rotateAnim]);

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  if (!isActive && !isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: opacityAnim,
        },
      ]}
    >
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

      <Animated.View
        style={[
          styles.popupContainer,
          {
            transform: [
              {
                scale: scaleAnim,
              },
            ],
          },
        ]}
      >
        {/* Holographic border frame */}
        <View style={styles.holographicFrame}>
          {/* Corner decorations */}
          <View style={[styles.corner, styles.topLeft]}>
            <View style={styles.cornerLine} />
          </View>
          <View style={[styles.corner, styles.topRight]}>
            <View style={styles.cornerLine} />
          </View>
          <View style={[styles.corner, styles.bottomLeft]}>
            <View style={styles.cornerLine} />
          </View>
          <View style={[styles.corner, styles.bottomRight]}>
            <View style={styles.cornerLine} />
          </View>

          {/* Border glow */}
          <View style={styles.borderGlow} />

          {/* Content */}
          <BlurView intensity={85} style={styles.blurContainer}>
            <LinearGradient
              colors={['rgba(0, 229, 255, 0.05)', 'rgba(0, 153, 255, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.contentGradient}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.titleContainer}>
                  <MaterialCommunityIcons
                    name="satellite"
                    size={28}
                    color="#00ffff"
                    style={styles.titleIcon}
                  />
                  <View>
                    <Text style={styles.satelliteName}>{satellite.name || 'UNKNOWN'}</Text>
                    <Text style={styles.satelliteLabel}>{satellite.label}</Text>
                  </View>
                </View>
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <MaterialCommunityIcons name="close" size={24} color="#00ffff" />
                </Pressable>
              </View>

              {/* Status indicator */}
              <View style={styles.statusBar}>
                <View style={[styles.statusDot, styles.statusActive]} />
                <Text style={styles.statusText}>LIVE TRACKING ACTIVE</Text>
              </View>

              {/* Data grid */}
              <View style={styles.dataGrid}>
                {/* Speed */}
                <View style={styles.dataCard}>
                  <View style={styles.dataIconContainer}>
                    <MaterialCommunityIcons
                      name="speedometer"
                      size={20}
                      color="#00ffff"
                    />
                  </View>
                  <View>
                    <Text style={styles.dataLabel}>VELOCITY</Text>
                    <Text style={styles.dataValue}>
                      {satellite.speed || '7.66'} km/s
                    </Text>
                  </View>
                </View>

                {/* Altitude */}
                <View style={styles.dataCard}>
                  <View style={styles.dataIconContainer}>
                    <MaterialCommunityIcons name="altimeter" size={20} color="#0099ff" />
                  </View>
                  <View>
                    <Text style={styles.dataLabel}>ALTITUDE</Text>
                    <Text style={styles.dataValue}>
                      {satellite.altitude || '408'} km
                    </Text>
                  </View>
                </View>

                {/* Latitude */}
                <View style={styles.dataCard}>
                  <View style={styles.dataIconContainer}>
                    <MaterialCommunityIcons
                      name="latitude"
                      size={20}
                      color="#00ff88"
                    />
                  </View>
                  <View>
                    <Text style={styles.dataLabel}>LATITUDE</Text>
                    <Text style={styles.dataValue}>
                      {satellite.latitude
                        ? satellite.latitude.toFixed(2) + '°'
                        : '0.00°'}
                    </Text>
                  </View>
                </View>

                {/* Longitude */}
                <View style={styles.dataCard}>
                  <View style={styles.dataIconContainer}>
                    <MaterialCommunityIcons name="longitude" size={20} color="#ffaa00" />
                  </View>
                  <View>
                    <Text style={styles.dataLabel}>LONGITUDE</Text>
                    <Text style={styles.dataValue}>
                      {satellite.longitude
                        ? satellite.longitude.toFixed(2) + '°'
                        : '0.00°'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Orbit info */}
              <View style={styles.orbitInfo}>
                <Text style={styles.orbitLabel}>ORBITAL ALTITUDE:</Text>
                <Text style={styles.orbitValue}>{satellite.orbitAltitude || 120} km</Text>
              </View>

              {/* NASA badge */}
              <View style={styles.nasaBadge}>
                <Text style={styles.nasaText}>MISSION CONTROL</Text>
              </View>
            </LinearGradient>
          </BlurView>
        </View>

        {/* Rotating border accent */}
        <Animated.View
          style={[
            styles.rotatingBorder,
            {
              transform: [{ rotate: rotateInterpolation }],
            },
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  popupContainer: {
    width: Math.min(width - 40, 360),
    borderRadius: 12,
    overflow: 'hidden',
  },
  holographicFrame: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 2,
    borderColor: '#00e5ff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 15,
  },
  borderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: '#00ffff',
    borderRadius: 12,
    opacity: 0.3,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  topLeft: {
    top: -8,
    left: -8,
  },
  topRight: {
    top: -8,
    right: -8,
  },
  bottomLeft: {
    bottom: -8,
    left: -8,
  },
  bottomRight: {
    bottom: -8,
    right: -8,
  },
  cornerLine: {
    width: '100%',
    height: '100%',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#00ffff',
    borderTopLeftRadius: 8,
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: 10,
  },
  contentGradient: {
    padding: 20,
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.2)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleIcon: {
    marginRight: 12,
  },
  satelliteName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00ffff',
    letterSpacing: 2,
    marginBottom: 2,
  },
  satelliteLabel: {
    fontSize: 11,
    color: '#0099ff',
    letterSpacing: 1,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 255, 136, 0.08)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00ff88',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: '#00ff88',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusActive: {
    animation: 'pulse',
  },
  statusText: {
    fontSize: 11,
    color: '#00ff88',
    fontWeight: '600',
    letterSpacing: 1,
  },
  dataGrid: {
    marginBottom: 16,
  },
  dataCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(0, 153, 255, 0.06)',
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#00e5ff',
  },
  dataIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dataLabel: {
    fontSize: 10,
    color: '#00ccff',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  dataValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  orbitInfo: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  orbitLabel: {
    fontSize: 10,
    color: '#00ccff',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  orbitValue: {
    fontSize: 16,
    color: '#00ffff',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  nasaBadge: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#ff9900',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 153, 0, 0.08)',
  },
  nasaText: {
    fontSize: 11,
    color: '#ff9900',
    fontWeight: '700',
    letterSpacing: 2,
  },
  rotatingBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 1,
    borderColor: 'transparent',
    borderTopColor: '#00ffff',
    borderRightColor: '#0099ff',
    borderBottomColor: 'rgba(0, 229, 255, 0.3)',
    borderLeftColor: 'rgba(0, 153, 255, 0.3)',
    borderRadius: 12,
    pointerEvents: 'none',
  },
});
