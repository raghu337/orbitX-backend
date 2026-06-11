import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Mission Control Status Bar
 * Displays system metrics in NASA mission control style
 */
export const MissionControlStatusBar = ({
  activeSatelliteCount = 0,
  systemHealth = 98,
  signalStrength = 95,
  dataRate = 2.4,
  showAnimation = true,
}) => {
  const healthPulse = useRef(new Animated.Value(1)).current;
  const signalWave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showAnimation) {
      Animated.loop(
        Animated.timing(healthPulse, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(signalWave, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(signalWave, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [showAnimation, healthPulse, signalWave]);

  const getHealthColor = () => {
    if (systemHealth >= 95) return '#00ff88';
    if (systemHealth >= 80) return '#ffff00';
    return '#ff0000';
  };

  return (
    <View style={styles.statusBar}>
      {/* System Status */}
      <BlurView intensity={90} style={styles.statusCard}>
        <View style={styles.statusContent}>
          <View style={styles.statusHeader}>
            <MaterialCommunityIcons name="heart-pulse" size={16} color="#ff0000" />
            <Text style={styles.statusLabel}>SYSTEM HEALTH</Text>
          </View>
          <View style={styles.statusValue}>
            <Animated.View
              style={{
                transform: [{ scale: healthPulse }],
              }}
            >
              <Text style={[styles.healthValue, { color: getHealthColor() }]}>
                {systemHealth}%
              </Text>
            </Animated.View>
            <View style={[styles.healthBar, { backgroundColor: 'rgba(0, 255, 136, 0.2)' }]}>
              <View
                style={[
                  styles.healthBarFill,
                  {
                    width: `${systemHealth}%`,
                    backgroundColor: getHealthColor(),
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </BlurView>

      {/* Signal Strength */}
      <BlurView intensity={90} style={styles.statusCard}>
        <View style={styles.statusContent}>
          <View style={styles.statusHeader}>
            <Animated.View
              style={{
                transform: [
                  {
                    scale: signalWave.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.3],
                    }),
                  },
                ],
              }}
            >
              <MaterialCommunityIcons name="wifi" size={16} color="#00ffff" />
            </Animated.View>
            <Text style={styles.statusLabel}>SIGNAL</Text>
          </View>
          <Text style={styles.statusValue}>
            <Text style={styles.signalBars}>■ ■ ■ ■ ■</Text>
          </Text>
          <Text style={styles.statusMetric}>{signalStrength}%</Text>
        </View>
      </BlurView>

      {/* Data Rate */}
      <BlurView intensity={90} style={styles.statusCard}>
        <View style={styles.statusContent}>
          <View style={styles.statusHeader}>
            <MaterialCommunityIcons name="speedometer" size={16} color="#00ff88" />
            <Text style={styles.statusLabel}>DATA RATE</Text>
          </View>
          <Text style={styles.statusMetric}>{dataRate} Mbps</Text>
        </View>
      </BlurView>

      {/* Active Satellites */}
      <BlurView intensity={90} style={styles.statusCard}>
        <View style={styles.statusContent}>
          <View style={styles.statusHeader}>
            <MaterialCommunityIcons name="satellite" size={16} color="#0099ff" />
            <Text style={styles.statusLabel}>TRACKING</Text>
          </View>
          <Text style={styles.statusMetric}>{activeSatelliteCount} SV</Text>
        </View>
      </BlurView>
    </View>
  );
};

/**
 * Cinematic Transition Overlay
 * Creates sci-fi style scene transitions
 */
export const CinematicTransitionOverlay = ({
  isActive = false,
  direction = 'fade', // 'fade', 'slideUp', 'slideDown', 'scanlines'
  duration = 500,
  onComplete = () => {},
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(height)).current;
  const scanlinesOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: duration / 2,
        useNativeDriver: true,
      }).start(() => onComplete());
      return;
    }

    if (direction === 'fade') {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => onComplete());
    } else if (direction === 'slideUp') {
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -height,
          duration: duration,
          useNativeDriver: true,
        }),
      ]).start(() => onComplete());
    } else if (direction === 'scanlines') {
      Animated.loop(
        Animated.timing(scanlinesOffset, {
          toValue: 20,
          duration: 1000,
          useNativeDriver: false,
        })
      ).start();
    }
  }, [isActive, direction, duration, opacity, translateY, scanlinesOffset, onComplete]);

  if (!isActive) return null;

  return (
    <Animated.View
      style={[
        styles.transitionOverlay,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {direction === 'scanlines' && (
        <Animated.View
          style={[
            styles.scanlines,
            {
              transform: [
                {
                  translateY: scanlinesOffset.interpolate({
                    inputRange: [0, 20],
                    outputRange: [0, 40],
                  }),
                },
              ],
            },
          ]}
        />
      )}

      <LinearGradient
        colors={['rgba(0, 229, 255, 0.3)', 'rgba(0, 153, 255, 0.2)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
    </Animated.View>
  );
};

/**
 * Floating Glassmorphism Data Card
 * Animated floating card with micro-interactions
 */
export const FloatingGlassmorphismCard = ({
  title = '',
  value = '',
  unit = '',
  icon = 'information',
  color = '#00e5ff',
  style = {},
  showGlow = true,
}) => {
  const float = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    if (showGlow) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1.2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [float, glow, showGlow]);

  const floatTranslation = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View
      style={[
        styles.floatingCard,
        style,
        {
          transform: [
            {
              translateY: floatTranslation,
            },
          ],
          shadowOpacity: glow,
        },
      ]}
    >
      {/* Background blur */}
      <BlurView intensity={85} style={styles.floatingCardBlur}>
        <LinearGradient
          colors={['rgba(0, 229, 255, 0.1)', 'rgba(0, 153, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.floatingCardGradient}
        >
          {/* Border glow */}
          <View
            style={[
              styles.floatingCardBorder,
              {
                borderColor: color,
                shadowColor: color,
                shadowOpacity: 0.6,
                shadowRadius: 8,
              },
            ]}
          >
            {/* Content */}
            <View style={styles.floatingCardContent}>
              <MaterialCommunityIcons
                name={icon}
                size={24}
                color={color}
                style={styles.floatingCardIcon}
              />
              <View style={styles.floatingCardText}>
                <Text style={styles.floatingCardTitle}>{title}</Text>
                <Text style={[styles.floatingCardValue, { color }]}>
                  {value} {unit}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'space-between',
    gap: 8,
  },
  statusCard: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    backgroundColor: 'rgba(2, 4, 11, 0.6)',
  },
  statusContent: {
    padding: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 8,
    color: '#00ccff',
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 4,
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthValue: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  healthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginLeft: 8,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  statusMetric: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  signalBars: {
    fontSize: 10,
    color: '#00ffff',
    letterSpacing: 2,
  },
  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    backgroundImage: `repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.15),
      rgba(0, 0, 0, 0.15) 1px,
      transparent 1px,
      transparent 2px
    )`,
  },
  floatingCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 10,
  },
  floatingCardBlur: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  floatingCardGradient: {
    borderRadius: 12,
  },
  floatingCardBorder: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  floatingCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingCardIcon: {
    marginRight: 8,
  },
  floatingCardText: {
    flex: 1,
  },
  floatingCardTitle: {
    fontSize: 10,
    color: '#00ccff',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  floatingCardValue: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
