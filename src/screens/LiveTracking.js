import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';

import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

import { sendSatellitePassNotification } from '../notifications/notificationService';
import gpsService from '../services/gpsService';
import { requestNotificationPermissions } from '../services/notificationService';
import satelliteService from '../services/satelliteService';

const { width } = Dimensions.get('window');
const ISS_IMAGE = require('../../assets/images/iss.png');
const SATELLITE_IMAGE = require('../../assets/images/satellite.png');
const DEFAULT_SATELLITE_IMAGE = SATELLITE_IMAGE; // Fallback to the existing satellite icon when no custom image is available
const INITIAL_SATELLITES = satelliteService.createSatelliteFleet();

export default function LiveTracking() {
  const mapRef = useRef(null);
  const userLocationRef = useRef({
    latitude: 20,
    longitude: 0,
    altitude: 0,
    speed: 0,
    heading: 0,
    timestamp: new Date().toISOString(),
  });
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarSweepAnim = useRef(new Animated.Value(0)).current;
  const radarGlowAnim = useRef(new Animated.Value(0)).current;
  const satelliteFlashAnim = useRef(new Animated.Value(0)).current;
  const alertBannerAnim = useRef(new Animated.Value(-124)).current;
  const redFlashAnim = useRef(new Animated.Value(0)).current;
  const redFlashLoop = useRef(null);
  const redLinePulseAnim = useRef(new Animated.Value(0)).current;
  const redLinePulseLoop = useRef(null);
  const overheadPopupAnim = useRef(new Animated.Value(0)).current;
  const starFieldAnim = useRef(new Animated.Value(0)).current;
  const nebulaPulseAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const orbitProgressAnim = useRef(new Animated.Value(0)).current;
  const [orbitProgress, setOrbitProgress] = useState(0);
  const popupAnim = useRef(new Animated.Value(0)).current;

  const [userLocation, setUserLocation] = useState(userLocationRef.current);
  const [gpsStatus, setGpsStatus] = useState('unknown');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [followUser, setFollowUser] = useState(true);
  const [followSatellite, setFollowSatellite] = useState(false);
  const [liveLocationActive, setLiveLocationActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mute, setMute] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [pendingNotificationData, setPendingNotificationData] = useState(null);
  const [alertState, setAlertState] = useState({
    active: false,
    satellite: null,
    level: null,
    distanceKm: null,
    minutesUntilArrival: null,
    title: '',
    description: '',
    isOverhead: false,
    passDirection: '',
  });
  const [alertHistory, setAlertHistory] = useState([]);
  const [nearestSatellite, setNearestSatellite] = useState(null);
  const [simulatedSatellite, setSimulatedSatellite] = useState(null);
  const [alertingSatelliteId, setAlertingSatelliteId] = useState(null);
  const [countdownText, setCountdownText] = useState('');
  const simulatedDistanceRef = useRef(5200);
  const simulatedBearingRef = useRef(45);
  const alarmSoundRef = useRef(null);
  const lastAlertRef = useRef({ id: null, level: null, time: 0 });
  const locationSubscriptionRef = useRef(null);
  const [satellites, setSatellites] = useState(
    INITIAL_SATELLITES.map((sat, index) => {
      const now = Date.now();
      const latitude = Math.sin(now / 50000 + index) * 70;
      const longitude = ((now / 300) + index * 25) % 360 - 180;
      const altitude = Number(sat.orbitAltitudeKm || 420);
      const velocity = Number(7.7 + ((450 - altitude) / 450) * 0.24);

      return {
        ...sat,
        latitude,
        longitude,
        altitude: Number(altitude),
        velocity: Number(velocity),
        visibility: true,
        nextPass: null,
        lastUpdated: new Date().toISOString(),
        isLive: false,
      };
    })
  );
  const [selectedId, setSelectedId] = useState(null);
  const [focusedSatellite, setFocusedSatellite] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [tappedSatelliteId, setTappedSatelliteId] = useState(null);
  const tapScaleAnim = useRef(new Animated.Value(1)).current;
  const lastFocusedSatelliteIdRef = useRef(null);

  const selectedSatellite = useMemo(
    () => satellites.find((sat) => sat.id === selectedId) ?? null,
    [satellites, selectedId]
  );

  const currentPopupSatellite =
    selectedSatellite || (alertState.active ? alertState.satellite : null);

  const validSatellites = useMemo(
    () =>
      satellites.filter(
        (sat) =>
          typeof sat.latitude === 'number' &&
          typeof sat.longitude === 'number' &&
          !Number.isNaN(sat.latitude) &&
          !Number.isNaN(sat.longitude) &&
          sat.latitude >= -90 &&
          sat.latitude <= 90 &&
          sat.longitude >= -180 &&
          sat.longitude <= 180
      ),
    [satellites]
  );

  const normalizeNumber = (value) => {
    if (value === null || value === undefined) {
      return null;
    }

    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  };

  const isCoordinateValid = (latitude, longitude) => {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !Number.isNaN(latitude) &&
      !Number.isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  };

  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  };

  const getAlertInfo = (distanceKm) => {
    if (distanceKm <= 500) {
      return {
        level: 4,
        label: 'OVERHEAD',
        color: '#FF2D55',
        radius: 180000,
      };
    }
    if (distanceKm <= 1500) {
      return {
        level: 3,
        label: 'RED ALERT',
        color: '#FF4D4D',
        radius: 280000,
      };
    }
    if (distanceKm <= 3000) {
      return {
        level: 2,
        label: 'ORANGE ALERT',
        color: '#FFAA29',
        radius: 500000,
      };
    }
    if (distanceKm <= 5000) {
      return {
        level: 1,
        label: 'BLUE ALERT',
        color: '#00E5FF',
        radius: 1000000,
      };
    }
    return null;
  };

  const getArrivalMinutes = (distanceKm, speedKms) => {
    if (!distanceKm || !speedKms) return null;
    const kmPerMin = speedKms * 60;
    if (!kmPerMin) return null;
    return Math.max(1, Math.round(distanceKm / kmPerMin));
  };

  const getBearingBetweenPoints = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δλ = toRad(lon2 - lon1);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  };

  const getApproachDirectionName = (satellite, location) => {
    if (!satellite || !location) return 'UNKNOWN';
    const bearing = getBearingBetweenPoints(
      location.latitude,
      location.longitude,
      satellite.latitude,
      satellite.longitude
    );
    if (bearing >= 337.5 || bearing < 22.5) return 'NORTH';
    if (bearing >= 22.5 && bearing < 67.5) return 'NORTH-EAST';
    if (bearing >= 67.5 && bearing < 112.5) return 'EAST';
    if (bearing >= 112.5 && bearing < 157.5) return 'SOUTH-EAST';
    if (bearing >= 157.5 && bearing < 202.5) return 'SOUTH';
    if (bearing >= 202.5 && bearing < 247.5) return 'SOUTH-WEST';
    if (bearing >= 247.5 && bearing < 292.5) return 'WEST';
    if (bearing >= 292.5 && bearing < 337.5) return 'NORTH-WEST';
    return 'UNKNOWN';
  };

  const getApproachDirectionLabel = (satellite, location) => {
    const direction = getApproachDirectionName(satellite, location);
    return `from the ${direction}`;
  };

  const getSatelliteImage = (satellite) => {
    const name = (satellite?.name || '').toLowerCase();
    if (satellite?.id === 'ISS' || name.includes('iss')) {
      return ISS_IMAGE;
    }
    if (satellite?.id === 'GPS' || name.includes('gps')) {
      return SATELLITE_IMAGE;
    }
    if (name.includes('noaa') || name.includes('weather')) {
      return SATELLITE_IMAGE;
    }
    return DEFAULT_SATELLITE_IMAGE;
  };

  const getSatelliteIconTheme = (satellite) => {
    const name = (satellite?.name || '').toLowerCase();
    if (satellite?.id === 'ISS' || name.includes('iss')) {
      return {
        tintColor: '#EAF8FF',
        glowColor: 'rgba(0, 221, 255, 0.24)',
        badgeColor: '#00E5FF',
      };
    }
    if (satellite?.id === 'GPS' || name.includes('gps')) {
      return {
        tintColor: '#BEFF6C',
        glowColor: 'rgba(186, 255, 108, 0.22)',
        badgeColor: '#A4FF6A',
      };
    }
    if (name.includes('noaa') || name.includes('weather')) {
      return {
        tintColor: '#FFB74D',
        glowColor: 'rgba(255, 183, 77, 0.22)',
        badgeColor: '#FF9D3D',
      };
    }
    return {
      tintColor: satellite?.color || '#42CFFF',
      glowColor: 'rgba(66, 207, 255, 0.18)',
      badgeColor: '#7CFFB2',
    };
  };

  const animateSatelliteTap = useCallback(
    (satelliteId) => {
      setTappedSatelliteId(satelliteId);
      tapScaleAnim.setValue(1);
      Animated.sequence([
        Animated.spring(tapScaleAnim, {
          toValue: 1.15,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.spring(tapScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start(() => setTappedSatelliteId(null));
    },
    [tapScaleAnim]
  );

  const destinationPoint = (latitude, longitude, distanceKm, bearingDegrees) => {
    const radius = 6371;
    const brng = (bearingDegrees * Math.PI) / 180;
    const lat1 = (latitude * Math.PI) / 180;
    const lon1 = (longitude * Math.PI) / 180;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(distanceKm / radius) +
        Math.cos(lat1) * Math.sin(distanceKm / radius) * Math.cos(brng)
    );

    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(brng) * Math.sin(distanceKm / radius) * Math.cos(lat1),
        Math.cos(distanceKm / radius) - Math.sin(lat1) * Math.sin(lat2)
      );

    return {
      latitude: (lat2 * 180) / Math.PI,
      longitude: (((lon2 * 180) / Math.PI + 540) % 360) - 180,
    };
  };

  const buildSimulatedSatellite = (observer, distanceKm) => {
    const bearing = simulatedBearingRef.current;
    const coords = destinationPoint(
      observer.latitude,
      observer.longitude,
      distanceKm,
      bearing
    );
    const alertInfo = getAlertInfo(distanceKm);

    return {
      id: 'SIM-APPROACH',
      name: 'SIMULATED APPROACH',
      latitude: coords.latitude,
      longitude: coords.longitude,
      altitude: 450,
      velocity: 7.8,
      visibility: true,
      distanceKm,
      alertLevel: alertInfo?.level ?? 0,
      alertLabel: alertInfo?.label ?? 'DISTANT',
      alertColor: alertInfo?.color ?? '#00E5FF',
      alertRadius: alertInfo?.radius ?? 220000,
      nextPass: null,
      lastUpdated: new Date().toISOString(),
      isLive: true,
    };
  };

  const buildOrbitPath = (satellite, stepCount = 72) => {
    if (!satellite) return [];

    const inclination = Math.max(20, Math.min(85, Math.abs(satellite.latitude || 0)));
    const normalizedLat = Math.max(-inclination, Math.min(inclination, satellite.latitude || 0));
    const phase = Math.asin(normalizedLat / inclination);

    return Array.from({ length: stepCount }, (_, index) => {
      const theta = phase + (index / (stepCount - 1)) * Math.PI * 2;
      const latitude = inclination * Math.sin(theta);
      const longitude =
        (((satellite.longitude || 0) + ((theta - phase) * 180) / Math.PI + 540) % 360) -
        180;
      return { latitude, longitude };
    });
  };

  const getOrbitPathState = (satellite, progress) => {
    const path = buildOrbitPath(satellite, 72);
    const pointIndex = Math.min(
      path.length - 1,
      Math.max(0, Math.round(progress * (path.length - 1)))
    );
    return {
      path,
      futureState: path[pointIndex] || path[0],
    };
  };

  const orbitPaths = useMemo(
    () =>
      validSatellites.map((sat) => {
        const { path, futureState } = getOrbitPathState(sat, orbitProgress);
        return {
          satellite: sat,
          path,
          futureState,
        };
      }),
    [validSatellites, orbitProgress]
  );

  const selectedOrbitPoint = useMemo(() => {
    if (!selectedId) return null;
    const selectedOrbit = orbitPaths.find((item) => item.satellite.id === selectedId);
    return selectedOrbit?.futureState ?? null;
  }, [orbitPaths, selectedId]);

  const starPositions = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        left: (index * 11) % 92,
        top: (index * 9) % 88,
        size: 1 + (index % 3),
        opacity: 0.3 + ((index % 4) * 0.12),
      })),
    []
  );

  const particlePositions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        left: 4 + (index * 7) % 84,
        top: 6 + (index * 10) % 76,
        size: 2 + (index % 3),
        opacity: 0.16 + ((index % 5) * 0.1),
      })),
    []
  );

  const loadAlertSound = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playsInSilentModeAndroid: true,
      });
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/alert.mp3')
      );
      alarmSoundRef.current = sound;
    } catch (error) {
      console.warn('[LiveTracking] Alert sound load failed', error);
    }
  }, []);

  const playAlertSound = useCallback(async (forceLoud = false) => {
    if (mute || !alarmSoundRef.current) return;
    try {
      if (forceLoud && alarmSoundRef.current?.setVolumeAsync) {
        await alarmSoundRef.current.setVolumeAsync(1.0);
      }
      await alarmSoundRef.current.replayAsync();
    } catch (error) {
      console.warn('[LiveTracking] Alert sound playback failed', error);
    }
  }, [mute]);

  const getPermissionLabel = (status) => {
    if (status === 'granted') return 'GPS ACTIVE';
    if (status === 'denied') return 'GPS DENIED';
    return 'GPS UNAVAILABLE';
  };

  const getFallbackCoordinates = (index) => {
    const now = Date.now();
    return {
      latitude: Math.sin(now / 50000 + index) * 70,
      longitude: ((now / 300) + index * 25) % 360 - 180,
    };
  };

  const buildSatelliteState = (sat, index, observer, liveData) => {
    const live =
      sat.noradId && Array.isArray(liveData)
        ? liveData.find((item) => Number(item.satid) === Number(sat.noradId))
        : null;

    const fallback = getFallbackCoordinates(index);
    const latitude = normalizeNumber(live?.satlatitude ?? fallback.latitude);
    const longitude = normalizeNumber(live?.satlongitude ?? fallback.longitude);
    const altitude = normalizeNumber(live?.sataltitude ?? sat.orbitAltitudeKm ?? 420);
    const velocity = normalizeNumber(live?.velocity ?? 7.7 + ((450 - (altitude || 420)) / 450) * 0.24);

    const valid = isCoordinateValid(latitude, longitude);
    const finalLatitude = valid ? latitude : fallback.latitude;
    const finalLongitude = valid ? longitude : fallback.longitude;
    const finalAltitude = Number.isFinite(altitude) ? altitude : Number(sat.orbitAltitudeKm || 420);
    const finalVelocity = Number.isFinite(velocity)
      ? velocity
      : Number(7.7 + ((450 - finalAltitude) / 450) * 0.24);

    const distanceKm =
      isCoordinateValid(observer.latitude, observer.longitude) &&
      isCoordinateValid(finalLatitude, finalLongitude)
        ? calculateDistanceKm(
            observer.latitude,
            observer.longitude,
            finalLatitude,
            finalLongitude
          )
        : null;

    const alertInfo = distanceKm != null ? getAlertInfo(distanceKm) : null;

    console.log('SAT:', sat.name, finalLatitude, finalLongitude, 'distanceKm=', distanceKm);

    return {
      ...sat,
      latitude: finalLatitude,
      longitude: finalLongitude,
      altitude: finalAltitude,
      velocity: finalVelocity,
      visibility: true,
      distanceKm,
      alertLevel: alertInfo?.level ?? 0,
      alertLabel: alertInfo?.label ?? null,
      alertColor: alertInfo?.color ?? null,
      alertRadius: alertInfo?.radius ?? null,
      nextPass: sat.nextPass ?? null,
      lastUpdated: new Date().toISOString(),
      isLive: Boolean(live),
    };
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.35,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(radarSweepAnim, {
        toValue: 1,
        duration: 4200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(radarGlowAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(radarGlowAnim, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(satelliteFlashAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(satelliteFlashAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(starFieldAnim, {
        toValue: 1,
        duration: 26000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(nebulaPulseAnim, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(nebulaPulseAnim, {
          toValue: 0,
          duration: 5200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 4200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim, {
          toValue: 0,
          duration: 4200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [radarSweepAnim, radarGlowAnim, satelliteFlashAnim, starFieldAnim, nebulaPulseAnim, particleAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(orbitProgressAnim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [orbitProgressAnim]);

  useEffect(() => {
    const listenerId = orbitProgressAnim.addListener(({ value }) => {
      setOrbitProgress(value);
    });
    return () => {
      orbitProgressAnim.removeListener(listenerId);
    };
  }, [orbitProgressAnim]);

  useEffect(() => {
    Animated.timing(popupAnim, {
      toValue: popupOpen ? 1 : 0,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [popupOpen, popupAnim]);

  useEffect(() => {
    if (alertState.active) {
      Animated.spring(alertBannerAnim, {
        toValue: 0,
        speed: 18,
        bounciness: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(alertBannerAnim, {
        toValue: -124,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [alertState.active, alertBannerAnim]);

  useEffect(() => {
    if (alertState.active && alertState.level >= 3) {
      if (redFlashLoop.current) {
        redFlashLoop.current.stop();
      }

      redFlashAnim.setValue(0);
      redFlashLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(redFlashAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(redFlashAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      redFlashLoop.current.start();
    } else {
      if (redFlashLoop.current) {
        redFlashLoop.current.stop();
      }
      redFlashAnim.setValue(0);
    }
  }, [alertState.active, alertState.level, redFlashAnim]);

  useEffect(() => {
    if (alertState.active && alertState.level >= 3) {
      if (redLinePulseLoop.current) {
        redLinePulseLoop.current.stop();
      }

      redLinePulseAnim.setValue(0);
      redLinePulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(redLinePulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(redLinePulseAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      redLinePulseLoop.current.start();
    } else {
      if (redLinePulseLoop.current) {
        redLinePulseLoop.current.stop();
      }
      redLinePulseAnim.setValue(0);
    }
  }, [alertState.active, alertState.level, redLinePulseAnim]);

  useEffect(() => {
    Animated.timing(overheadPopupAnim, {
      toValue: alertState.isOverhead ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [alertState.isOverhead, overheadPopupAnim]);

  const redLineStrokeWidth = redLinePulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 8],
  });

  const redEndpointScale = redLinePulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35],
  });

  useEffect(() => {
    if (alertState.active && alertState.level >= 3 && alertState.satellite) {
      focusMapOnPair(alertState.satellite);
    }
  }, [alertState.active, alertState.level, alertState.satellite, focusMapOnPair]);

  const updateSatelliteState = useCallback(
    (liveData) => {
      setSatellites((prev) => {
        const merged = satelliteService.mergeLiveAndSimulatedPositions(
          prev,
          liveData,
          userLocationRef.current
        );

        const updated = merged.map((sat) => {
          const distanceKm =
            isCoordinateValid(userLocationRef.current.latitude, userLocationRef.current.longitude) &&
            isCoordinateValid(sat.latitude, sat.longitude)
              ? calculateDistanceKm(
                  userLocationRef.current.latitude,
                  userLocationRef.current.longitude,
                  sat.latitude,
                  sat.longitude
                )
              : null;
          const alertInfo = distanceKm != null ? getAlertInfo(distanceKm) : null;

          console.log(
            '[Satellite] updated',
            sat.name,
            sat.latitude,
            sat.longitude,
            `distanceKm=${distanceKm?.toFixed(1) ?? 'n/a'}`,
            `alert=${alertInfo?.label ?? 'none'}`
          );

          return {
            ...sat,
            distanceKm,
            alertLevel: alertInfo?.level ?? 0,
            alertLabel: alertInfo?.label ?? null,
            alertColor: alertInfo?.color ?? null,
            alertRadius: alertInfo?.radius ?? null,
          };
        });

        evaluateProximity(updated);
        return updated;
      });
    },
    [evaluateProximity]
  );

  const fetchLivePositions = async () => {
    try {
      const ids = INITIAL_SATELLITES.filter((sat) => sat.noradId).map(
        (sat) => sat.noradId
      );

      const observerState = userLocationRef.current;
      const liveData = await satelliteService.fetchN2YOPositions(
        ids,
        observerState.latitude,
        observerState.longitude,
        observerState.altitude || 0
      );

      updateSatelliteState(liveData);
    } catch (error) {
      console.warn('[LiveTracking] fetchLivePositions error', error);
      updateSatelliteState(null);
    } finally {
      setLoading(false);
    }
  };

  const centerOnUserLocation = useCallback(
    (location) => {
      if (!location || !mapRef.current?.animateToRegion) return;
      if (!isCoordinateValid(location.latitude, location.longitude)) return;

      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        },
        1000
      );
    },
    []
  );

  const focusMapOnPair = useCallback((satellite) => {
    if (!satellite || !mapRef.current?.fitToCoordinates) return;
    if (!isCoordinateValid(satellite.latitude, satellite.longitude)) return;

    const coordinates = [userLocationRef.current, {
      latitude: satellite.latitude,
      longitude: satellite.longitude,
    }];

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: { top: 100, right: 80, bottom: 120, left: 80 },
      animated: true,
    });
  }, []);

  const handleLocationUpdate = useCallback(
    async (position) => {
      const latitude = normalizeNumber(position.latitude || position.coords?.latitude);
      const longitude = normalizeNumber(position.longitude || position.coords?.longitude);
      const altitude = normalizeNumber(position.altitude || position.coords?.altitude) ?? 0;
      const speed = normalizeNumber(position.coords?.speed ?? position.speed) ?? 0;
      const heading = normalizeNumber(position.coords?.heading ?? position.heading) ?? 0;
      const timestamp = position.timestamp
        ? new Date(position.timestamp).toISOString()
        : new Date().toISOString();

      if (!isCoordinateValid(latitude, longitude)) {
        console.warn('[GPS] invalid live coordinates', latitude, longitude);
        setPermissionDenied(true);
        setGpsStatus('invalid');
        setLiveLocationActive(false);
        return null;
      }

      const updatedLocation = {
        latitude,
        longitude,
        altitude,
        speed,
        heading,
        timestamp,
      };
      userLocationRef.current = updatedLocation;
      setUserLocation(updatedLocation);
      setPermissionDenied(false);
      setGpsStatus('granted');
      setLiveLocationActive(true);
      setLoading(false);

      console.log('[GPS] live fix', latitude, longitude, 'alt=', altitude);

      if (followUser && !followSatellite) {
        centerOnUserLocation(updatedLocation);
      }

      await fetchLivePositions();
      return updatedLocation;
    },
    [centerOnUserLocation, followUser, followSatellite]
  );

  const startLocationWatch = useCallback(async () => {
    const initial = await gpsService.getCurrentLocationSafe();

    if (!initial || initial.status !== 'granted') {
      console.log('[GPS] permission denied or unavailable', initial?.status);
      setPermissionDenied(true);
      setGpsStatus(initial?.status || 'denied');
      setLiveLocationActive(false);
      setLoading(false);
      return;
    }

    await handleLocationUpdate(initial);

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 2000,
          distanceInterval: 0,
          mayShowUserSettingsDialog: true,
        },
        (position) => {
          handleLocationUpdate(position);
        }
      );

      locationSubscriptionRef.current = subscription;
    } catch (error) {
      console.warn('[GPS] watchPositionAsync failed', error);
    }
  }, [handleLocationUpdate]);

  useEffect(() => {
    const setup = async () => {
      try {
        await loadAlertSound();
      } catch (error) {
        console.warn('[LiveTracking] loadAlertSound failed', error);
      }

      try {
        await startLocationWatch();
      } catch (error) {
        console.warn('[LiveTracking] startLocationWatch failed', error);
      }
    };

    setup();

    return () => {
      locationSubscriptionRef.current?.remove();
      if (alarmSoundRef.current) {
        alarmSoundRef.current.unloadAsync().catch(() => null);
      }
    };
  }, [loadAlertSound, startLocationWatch]);

  useEffect(() => {
    if (!liveLocationActive) return;

    const interval = setInterval(() => {
      fetchLivePositions().catch((error) =>
        console.warn('[LiveTracking] periodic fetch failed', error)
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [liveLocationActive, fetchLivePositions]);

  useEffect(() => {
    if (!focusedSatellite) return;
    const activeSat = satellites.find((sat) => sat.id === focusedSatellite.id);
    if (!activeSat) return;
    if (!isCoordinateValid(activeSat.latitude, activeSat.longitude)) return;

    console.log('[FOLLOW] updating camera for', activeSat.name);
    centerOnSatellite(activeSat);
  }, [satellites, focusedSatellite, centerOnSatellite]);

  const centerOnSatellite = useCallback(
    (sat, attempt = 0) => {
      if (!sat) {
        console.warn('[MAP] invalid coordinates', sat);
        return false;
      }

      const latitude = normalizeNumber(sat.latitude);
      const longitude = normalizeNumber(sat.longitude);

      if (!isCoordinateValid(latitude, longitude)) {
        console.warn('[MAP] invalid coordinates', sat.id, latitude, longitude);
        return false;
      }

      const region = {
        latitude,
        longitude,
        latitudeDelta: 4,
        longitudeDelta: 4,
      };

      if (!mapRef.current?.animateToRegion) {
        if (attempt < 3) {
          setTimeout(() => centerOnSatellite(sat, attempt + 1), 400);
        }
        return false;
      }

      try {
        mapRef.current.animateToRegion(region, 1200);
        console.log('[MAP] animateToRegion success', sat.name, latitude, longitude);
        return true;
      } catch (error) {
        console.warn('[MAP] animateToRegion failed', sat.id, error);
        if (attempt < 3) {
          setTimeout(() => centerOnSatellite(sat, attempt + 1), 400);
        }
        return false;
      }
    },
    []
  );

  const triggerSatelliteAlert = useCallback(
    async (satellite) => {
      if (!satellite || !satellite.distanceKm) return;
      const alertInfo = getAlertInfo(satellite.distanceKm);
      if (!alertInfo) return;

      const now = Date.now();
      const sameAlert =
        lastAlertRef.current.id === satellite.id &&
        lastAlertRef.current.level === alertInfo.level;
      if (sameAlert && now - lastAlertRef.current.time < 180000) {
        console.log(
          '[Alert] duplicate suppressed',
          satellite.name,
          alertInfo.label
        );
        return;
      }

      lastAlertRef.current = {
        id: satellite.id,
        level: alertInfo.level,
        time: now,
      };

      const minutesUntilArrival = getArrivalMinutes(
        satellite.distanceKm,
        satellite.velocity
      );
      const approachDirectionName = getApproachDirectionName(
        satellite,
        userLocationRef.current
      );
      const approachDirectionLabel = getApproachDirectionLabel(
        satellite,
        userLocationRef.current
      );
      const description = `${satellite.name} is ${satellite.distanceKm.toFixed(1)} km away and arriving in ${minutesUntilArrival ?? 'soon'} minutes ${approachDirectionLabel}.`;

      setAlertState({
        active: true,
        satellite,
        level: alertInfo.level,
        distanceKm: satellite.distanceKm,
        minutesUntilArrival,
        title: alertInfo.label,
        description,
        isOverhead: alertInfo.level === 4,
        passDirection: approachDirectionName,
      });
      setAlertHistory((prev) => [
        {
          id: `${satellite.id}_${now}`,
          name: satellite.name,
          distanceKm: satellite.distanceKm,
          level: alertInfo.label,
          time: now,
          direction: approachDirectionName,
          altitude: satellite.altitude,
        },
        ...prev.slice(0, 4),
      ]);
      setAlertingSatelliteId(satellite.id);
      setSelectedId(satellite.id);
      setFocusedSatellite(satellite);
      setPopupOpen(true);

      if (followUser) {
        setFollowUser(false);
      }

      if (alertInfo.level >= 3) {
        focusMapOnPair(satellite);
      } else {
        centerOnSatellite(satellite);
      }

      if (!mute) {
        await playAlertSound(alertInfo.level === 4);
      }

      Vibration.vibrate(
        alertInfo.level === 4
          ? [0, 220, 40, 220, 40, 220]
          : [0, 180, 80, 180]
      );

      const permissionGranted =
        notificationPermission || (await requestNotificationPermissions());
      if (permissionGranted) {
        setNotificationPermission(true);
      }

      await sendSatellitePassNotification(
        satellite.name,
        satellite.distanceKm,
        minutesUntilArrival ?? 1,
        approachDirectionName,
        satellite.id
      );
    },
    [centerOnSatellite, focusMapOnPair, followUser, mute, notificationPermission, playAlertSound]
  );

  useEffect(() => {
    const target = alertState.active ? alertState.satellite : nearestSatellite;
    if (!target || target.distanceKm == null || !target.velocity) {
      setCountdownText('');
      return;
    }

    const tick = () => {
      const seconds = Math.max(0, Math.round(target.distanceKm / target.velocity));
      const minutes = Math.floor(seconds / 60);
      const remainder = seconds % 60;
      setCountdownText(`${minutes}m ${String(remainder).padStart(2, '0')}s`);
    };

    tick();
    const countdownTimer = setInterval(tick, 1000);
    return () => clearInterval(countdownTimer);
  }, [alertState.active, alertState.satellite, nearestSatellite]);

  const evaluateProximity = useCallback(
    async (updatedSatellites) => {
      if (!Array.isArray(updatedSatellites) || !userLocationRef.current) return;

      const nearest = updatedSatellites.reduce((best, sat) => {
        if (sat.distanceKm == null) return best;
        if (!best || sat.distanceKm < best.distanceKm) return sat;
        return best;
      }, null);

      setNearestSatellite(nearest);
      console.log(
        '[Proximity] nearest satellite',
        nearest?.name,
        'distanceKm=',
        nearest?.distanceKm,
        'alertLevel=',
        nearest?.alertLevel
      );

      const alerts = updatedSatellites
        .filter((sat) => sat.distanceKm != null && sat.alertLevel >= 2)
        .sort((a, b) => a.distanceKm - b.distanceKm);

      if (alerts.length) {
        setSimulatedSatellite(null);
        await triggerSatelliteAlert(alerts[0]);
        return;
      }

      if (!nearest) {
        setAlertState({
          active: false,
          satellite: null,
          level: null,
          distanceKm: null,
          minutesUntilArrival: null,
          title: '',
          description: '',
          isOverhead: false,
          passDirection: '',
        });
        setAlertingSatelliteId(null);
        return;
      }

      if (nearest.distanceKm > 5000) {
        const currentDistance = simulatedDistanceRef.current;
        const nextDistance = Math.max(120, currentDistance - 260);
        simulatedDistanceRef.current = nextDistance;
        const simulated = buildSimulatedSatellite(userLocationRef.current, nextDistance);
        setSimulatedSatellite(simulated);
        setNearestSatellite(simulated);

        console.log(
          '[Proximity] simulation active',
          simulated.name,
          'distanceKm=',
          simulated.distanceKm,
          'alert=',
          simulated.alertLabel
        );

        if (simulated.alertLevel > 0) {
          await triggerSatelliteAlert(simulated);
          return;
        }

        setAlertState((prev) => ({ ...prev, active: false, isOverhead: false, passDirection: '' }));
        setAlertingSatelliteId(null);
        return;
      }

      setSimulatedSatellite(null);
      setAlertState((prev) => ({ ...prev, active: false, isOverhead: false, passDirection: '' }));
      setAlertingSatelliteId(null);
    },
    [triggerSatelliteAlert]
  );

  const startFollowSatellite = useCallback(() => {
    if (!focusedSatellite) return;
    setFollowSatellite(true);
  }, [focusedSatellite]);

  useEffect(() => {
    if (!followSatellite || !focusedSatellite) return;

    const interval = setInterval(() => {
      const activeSat = satellites.find((sat) => sat.id === focusedSatellite.id);
      if (activeSat) {
        centerOnSatellite(activeSat);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [followSatellite, focusedSatellite, satellites, centerOnSatellite]);

  const handleSelectSatellite = useCallback(
    (sat) => {
      if (!sat) return;
      console.log('[FOCUS]', sat.name, sat.latitude, sat.longitude);

      setSelectedId(sat.id);
      setFocusedSatellite(sat);
      setPopupOpen(false);
      lastFocusedSatelliteIdRef.current = sat.id;

      centerOnSatellite(sat);
      setTimeout(() => {
        if (lastFocusedSatelliteIdRef.current === sat.id) {
          setPopupOpen(true);
        }
      }, 1200);
    },
    [centerOnSatellite]
  );

  const handleMapPress = useCallback(() => {
    lastFocusedSatelliteIdRef.current = null;
    setSelectedId(null);
    setFocusedSatellite(null);
    setPopupOpen(false);
  }, []);

  const formattedNextPass =
    selectedSatellite?.nextPass &&
    !Number.isNaN(Date.parse(selectedSatellite.nextPass))
      ? new Date(selectedSatellite.nextPass).toLocaleString()
      : 'TBD';

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <View>
          <Text style={styles.statusText}>
            {liveLocationActive ? 'LIVE LOCATION ACTIVE' : 'LIVE GPS OFF'}
          </Text>
          {liveLocationActive && (
            <Text style={styles.statusTextSecondary}>
              {`Speed: ${userLocation.speed?.toFixed(1) ?? 0} m/s • Heading: ${userLocation.heading?.toFixed(0) ?? 0}°`}
            </Text>
          )}
          {alertState.active && (
            <Text style={[styles.statusText, styles.alertLabel]}>
              {alertState.title} • {alertState.distanceKm?.toFixed(1)} km
            </Text>
          )}
        </View>

        <View style={styles.statusActions}>
          <TouchableOpacity
            style={[styles.smallButton, mute && styles.smallButtonActive]}
            onPress={() => setMute((value) => !value)}
          >
            <Text style={styles.smallButtonText}>{mute ? 'UNMUTE' : 'MUTE'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallButton, followSatellite && styles.smallButtonActive]}
            onPress={() => {
              if (followSatellite) {
                setFollowSatellite(false);
              } else {
                setFollowSatellite(true);
                setFollowUser(false);
              }
            }}
          >
            <Text style={styles.smallButtonText}>
              {followSatellite ? 'TRACKING' : 'TRACK SAT'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallButton, followUser && styles.smallButtonActive]}
            onPress={() => {
              setFollowUser((value) => !value);
              if (followSatellite) {
                setFollowSatellite(false);
              }
            }}
          >
            <Text style={styles.smallButtonText}>
              {followUser ? 'FOLLOW USER' : 'FREE VIEW'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {permissionDenied && (
        <View style={styles.permissionAlert}>
          <Text style={styles.permissionAlertText}>
            GPS permission denied. Please enable location services and retry.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={startLocationWatch}
          >
            <Text style={styles.permissionButtonText}>Request Again</Text>
          </TouchableOpacity>
        </View>
      )}

      <Animated.View
        style={[
          styles.warningBanner,
          styles[`warning${alertState.level}`],
          {
            transform: [{ translateY: alertBannerAnim }],
            opacity:
              alertState.active && alertState.level >= 3
                ? redFlashAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.72],
                  })
                : 1,
          },
        ]}
      >
        <Text style={styles.warningText}>
          {alertState.active ? `${alertState.title} — ${alertState.satellite?.name}` : 'SATELLITE APPROACHING'}
        </Text>
        <Text style={styles.warningSubtext} numberOfLines={1}>
          {alertState.active
            ? `${alertState.distanceKm?.toFixed(1)} km away • ETA ${countdownText || `${alertState.minutesUntilArrival ?? '--'} min`}`
            : 'Tracking orbital threats...'}
        </Text>
      </Animated.View>

      <MapView
        ref={mapRef}
        style={[
          styles.map,
          alertState.active && alertState.level >= 3 && styles.mapAlert,
        ]}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 120,
          longitudeDelta: 120,
        }}
        showsCompass={true}
        showsScale={true}
        showsMyLocationButton={true}
        followsUserLocation={followUser}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
        showsUserLocation={true}
        onPress={handleMapPress}
        onMapReady={() =>
          console.log('[LiveTracking] Map ready', !!mapRef.current)
        }
      >
        <Marker key="user-location" coordinate={userLocation}>
          <View style={styles.userMarkerWrapper}>
            <Animated.View
              style={[
                styles.userRadarSweep,
                {
                  transform: [
                    {
                      rotate: radarSweepAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.radarWedge} />
            </Animated.View>
            <Animated.View
              style={[
                styles.userRadarCircle,
                {
                  transform: [
                    {
                      scale: radarGlowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1.35],
                      }),
                    },
                  ],
                  opacity: radarGlowAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.18, 0.45, 0.18],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.userRadarCircleSmall,
                {
                  transform: [
                    {
                      scale: radarGlowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1.2],
                      }),
                    },
                  ],
                  opacity: radarGlowAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.1, 0.28, 0.1],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.userPulse,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <View style={styles.userDot} />
          </View>
        </Marker>

        {liveLocationActive && (
          <Circle
            center={userLocation}
            radius={15000}
            strokeColor="rgba(0,229,255,0.24)"
            fillColor="rgba(0,229,255,0.08)"
            strokeWidth={2}
          />
        )}

        {alertState.active && alertState.satellite && (
          <Circle
            center={{
              latitude: alertState.satellite.latitude,
              longitude: alertState.satellite.longitude,
            }}
            radius={alertState.satellite.alertRadius || 220000}
            strokeColor={alertState.satellite.alertColor || 'rgba(0,230,255,0.85)'}
            fillColor="rgba(0,230,255,0.08)"
            strokeWidth={2}
          />
        )}

        {alertState.active &&
          alertState.level >= 3 &&
          alertState.satellite && (
            <>
              <AnimatedPolyline
                coordinates={[userLocation, {
                  latitude: alertState.satellite.latitude,
                  longitude: alertState.satellite.longitude,
                }]}
                strokeColor={alertState.alertColor || '#FF4D4D'}
                strokeWidth={redLineStrokeWidth}
                lineCap="round"
                lineJoin="round"
                geodesic
              />

              <Marker key="red-alert-user" coordinate={userLocation}>
                <Animated.View
                  style={[
                    styles.redAlertEndpoint,
                    {
                      transform: [{ scale: redEndpointScale }],
                      backgroundColor: 'rgba(255, 59, 48, 0.95)',
                    },
                  ]}
                />
              </Marker>

              <Marker
                key={`${alertState.satellite.id}-red-alert-sat`}
                coordinate={{
                  latitude: alertState.satellite.latitude,
                  longitude: alertState.satellite.longitude,
                }}
              >
                <Animated.View
                  style={[
                    styles.redAlertEndpoint,
                    {
                      transform: [{ scale: redEndpointScale }],
                      backgroundColor: 'rgba(255, 59, 48, 0.95)',
                    },
                  ]}
                />
              </Marker>
            </>
          )}

        {simulatedSatellite && (
          <Marker
            key={simulatedSatellite.id}
            coordinate={{
              latitude: simulatedSatellite.latitude,
              longitude: simulatedSatellite.longitude,
            }}
          >
            <View style={styles.simulatedMarkerWrapper}>
              <View style={styles.simulatedMarkerCore} />
            </View>
          </Marker>
        )}

        {orbitPaths.map(({ satellite: sat, path, futureState }) =>
          path.length > 1 ? (
            <Polyline
              key={`${sat.id}-orbit`}
              coordinates={path}
              strokeColor={
                selectedId === sat.id
                  ? 'rgba(0, 229, 255, 0.95)'
                  : 'rgba(0, 229, 255, 0.22)'
              }
              strokeWidth={selectedId === sat.id ? 4 : 2}
              lineCap="round"
              lineJoin="round"
              geodesic
            />
          ) : null
        )}
        {orbitPaths.map(({ satellite: sat, futureState }) =>
          futureState ? (
            <Marker
              key={`${sat.id}-future`}
              coordinate={{
                latitude: futureState.latitude,
                longitude: futureState.longitude,
              }}
            >
              <View
                style={[
                  styles.predictedMarker,
                  selectedId === sat.id && styles.predictedMarkerSelected,
                ]}
              />
            </Marker>
          ) : null
        )}
        {selectedOrbitPoint && (
          <Marker
            key="selected-orbit-head"
            coordinate={selectedOrbitPoint}
          >
            <View style={styles.orbitHead} />
          </Marker>
        )}
        {validSatellites.map((sat) => {
          const iconSource = getSatelliteImage(sat);
          const { tintColor, glowColor, badgeColor } = getSatelliteIconTheme(sat);
          const isSelected = selectedId === sat.id;
          const isTapped = tappedSatelliteId === sat.id;

          return (
            <Marker
              key={sat.id}
              coordinate={{
                latitude: sat.latitude,
                longitude: sat.longitude,
              }}
              onPress={() => {
                animateSatelliteTap(sat.id);
                handleSelectSatellite(sat);
              }}
            >
              <Animated.View
                style={[
                  styles.satelliteMarkerWrapper,
                  {
                    transform: [
                      { scale: isSelected ? pulseAnim : 1 },
                      { scale: isTapped ? tapScaleAnim : 1 },
                    ],
                  },
                  isSelected && styles.markerSelected,
                ]}
              >
                <View
                  style={[
                    styles.satelliteGlow,
                    {
                      backgroundColor: glowColor,
                      shadowColor: tintColor,
                    },
                  ]}
                />
                <Image
                  source={iconSource}
                  style={[
                    styles.satelliteIcon,
                    { tintColor },
                    sat.alertLevel > 0 && styles.satelliteAlertIcon,
                    isSelected && styles.satelliteIconSelected,
                  ]}
                  resizeMode="contain"
                />
                <View
                  style={[
                    styles.satelliteBadge,
                    { backgroundColor: badgeColor },
                    sat.alertLevel > 0 && { opacity: 0.95 },
                  ]}
                />
                {alertingSatelliteId === sat.id && (
                  <Animated.View
                    style={[
                      styles.alertRing,
                      {
                        borderColor: sat.alertColor || '#00E5FF',
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  />
                )}
              </Animated.View>
            </Marker>
          );
        })}
      </MapView>

      <Animated.View
        pointerEvents="none"
        style={styles.spaceOverlay}
      >
        <Animated.View
          style={[
            styles.darkSpaceGradient,
            {
              opacity: nebulaPulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.42, 0.55],
              }),
            },
          ]}
        />

        <Animated.View
          style={[
            styles.nebulaGlow,
            {
              transform: [
                {
                  scale: nebulaPulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.14],
                  }),
                },
              ],
              opacity: nebulaPulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.18, 0.28],
              }),
            },
          ]}
        />

        <Animated.View
          style={[
            styles.starField,
            {
              transform: [
                {
                  translateY: starFieldAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -58],
                  }),
                },
              ],
            },
          ]}
        >
          {starPositions.map((star, index) => (
            <Animated.View
              key={`star-${index}`}
              style={[
                styles.starDot,
                {
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  width: star.size,
                  height: star.size,
                  opacity: star.opacity,
                },
              ]}
            />
          ))}
        </Animated.View>

        <Animated.View
          style={[
            styles.particleField,
            {
              transform: [
                {
                  translateX: particleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 18],
                  }),
                },
                {
                  translateY: particleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -12],
                  }),
                },
              ],
            },
          ]}
        >
          {particlePositions.map((particle, index) => (
            <Animated.View
              key={`particle-${index}`}
              style={[
                styles.particleDot,
                {
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  width: particle.size,
                  height: particle.size,
                  opacity: particle.opacity,
                },
              ]}
            />
          ))}
        </Animated.View>

        <View style={styles.earthAtmosphere} />
      </Animated.View>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#00E5FF" />
        </View>
      )}

      <Animated.View
        pointerEvents={alertState.isOverhead ? 'auto' : 'none'}
        style={[
          styles.overheadPopup,
          {
            opacity: overheadPopupAnim,
            transform: [
              {
                translateY: overheadPopupAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          },
        ]}
      >
        {alertState.isOverhead && alertState.satellite && (
          <View style={styles.overheadCard}>
            <Text style={styles.overheadTitle}>SATELLITE OVERHEAD</Text>
            <Text style={styles.overheadSatellite}>{alertState.satellite.name}</Text>
            <Text style={styles.overheadDirection}>
              Exact pass direction: {alertState.passDirection || 'UNKNOWN'}
            </Text>
            <Text style={styles.overheadDistance}>
              {alertState.distanceKm?.toFixed(1)} km away
            </Text>
          </View>
        )}
      </Animated.View>

      <Animated.View
        style={[
          styles.popup,
          {
            opacity: popupAnim,
            transform: [
              {
                translateY: popupAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [22, 0],
                }),
              },
            ],
          },
        ]}
        pointerEvents={popupOpen ? 'auto' : 'none'}
      >
        {currentPopupSatellite ? (
          <>
            <View style={styles.popupRadar} />
            <View style={styles.popupHeader}>
              <Text style={styles.title}>{currentPopupSatellite.name}</Text>
              <Text style={styles.statusLabel}>
                {currentPopupSatellite.isLive ? 'LIVE' : 'SIMULATED'}
              </Text>
            </View>

            <Text style={styles.text}>
              Lat: {currentPopupSatellite.latitude?.toFixed(4)}
            </Text>
            <Text style={styles.text}>
              Lon: {currentPopupSatellite.longitude?.toFixed(4)}
            </Text>
            <Text style={styles.text}>
              Alt: {currentPopupSatellite.altitude?.toFixed(2)} km
            </Text>
            <Text style={styles.text}>
              Speed: {currentPopupSatellite.velocity?.toFixed(2)} km/s
            </Text>
            {currentPopupSatellite.distanceKm != null && (
              <Text style={styles.text}>
                Distance: {currentPopupSatellite.distanceKm.toFixed(1)} km
              </Text>
            )}
            <Text style={styles.text}>
              Visibility:{' '}
              {currentPopupSatellite.visibility ? 'Visible' : 'Not visible'}
            </Text>
            <Text style={styles.text}>
              Orbit: {currentPopupSatellite.orbitType ?? 'Unknown'}
            </Text>
            <Text style={styles.text}>
              ETA: {alertState.minutesUntilArrival != null ? `${alertState.minutesUntilArrival} min` : 'Approaching'}
            </Text>
            <Text style={styles.text}>
              Direction: {getApproachDirectionName(currentPopupSatellite, userLocationRef.current)}
            </Text>
            <Text style={styles.text}>
              Updated: {currentPopupSatellite.lastUpdated ? new Date(currentPopupSatellite.lastUpdated).toLocaleString() : 'TBD'}
            </Text>
          </>
        ) : (
          <Text style={styles.text}>
            Tap any satellite marker or card to inspect its live orbit.
          </Text>
        )}
      </Animated.View>

      <View style={styles.historyPanel}>
        <Text style={styles.historyTitle}>Recent Contact</Text>
        {alertHistory.length === 0 ? (
          nearestSatellite ? (
            <View style={styles.historyFocus}>
              <Text style={styles.historyAlert}>Nearest Approach: {nearestSatellite.name}</Text>
              <Text style={styles.historyDetails}>
                Threat: {nearestSatellite.alertLabel ?? 'SCANNING'}
              </Text>
              <Text style={styles.historyDetails}>
                Distance: {nearestSatellite.distanceKm?.toFixed(1) ?? 'n/a'} km
              </Text>
              <Text style={styles.historyDetails}>
                ETA: {nearestSatellite.distanceKm != null ? `${getArrivalMinutes(nearestSatellite.distanceKm, nearestSatellite.velocity) ?? 'soon'} min` : 'calculating'}
              </Text>
              {countdownText ? (
                <Text style={styles.historyDetails}>
                  Countdown: {countdownText}
                </Text>
              ) : null}
              <Text style={styles.historyDetails}>
                Direction: {getApproachDirectionName(nearestSatellite, userLocationRef.current)}
              </Text>
              <Text style={styles.historyDetails}>
                Status: {nearestSatellite.isLive ? 'LIVE TRACKING' : 'AUTO TEST MODE'}
              </Text>
            </View>
          ) : (
            <Text style={styles.historyEmpty}>Scanning satellite skies for the nearest approach...</Text>
          )
        ) : (
          alertHistory.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View>
                <Text style={styles.historyAlert}>{item.name}</Text>
                <Text style={styles.historyDetails}>
                  {item.level} • {item.distanceKm.toFixed(1)} km • {item.direction}
                </Text>
              </View>
              <Text style={styles.historyTime}>
                {new Date(item.time).toLocaleTimeString()}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.bottom}>
        <Text style={styles.bottomTitle}>Live Satellite Fleet</Text>
        <ScrollView contentContainerStyle={styles.cardList}>
          {satellites.map((sat) => (
            <TouchableOpacity
              key={sat.id}
              style={[
                styles.card,
                selectedId === sat.id && styles.cardSelected,
              ]}
              onPress={() => handleSelectSatellite(sat)}
            >
              <Text style={styles.cardTitle}>{sat.name}</Text>
              <Text style={styles.cardSubtitle}>
                {sat.isLive ? 'LIVE' : 'SIMULATED'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { flex: 1 },
  loading: {
    position: 'absolute',
    top: '48%',
    left: '45%',
  },
  marker: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: '#001018',
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00E5FF',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  markerSelected: {
    shadowColor: '#00E5FF',
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  userMarkerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userRadarSweep: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.26)',
    overflow: 'hidden',
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.02)',
  },
  radarWedge: {
    position: 'absolute',
    right: 0,
    width: 60,
    height: 120,
    backgroundColor: 'rgba(0, 229, 255, 0.18)',
    borderTopRightRadius: 60,
    borderBottomRightRadius: 60,
  },
  userRadarCircle: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  userRadarCircleSmall: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  userPulse: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0, 229, 255, 0.24)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.4)',
  },
  userDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#00E5FF',
    borderWidth: 2,
    borderColor: '#fff',
  },
  predictedMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#00E5FF',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  predictedMarkerSelected: {
    backgroundColor: '#00FFFF',
    borderColor: '#00E5FF',
    width: 16,
    height: 16,
  },
  orbitHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00FFFF',
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#00FFFF',
    shadowOpacity: 0.75,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  redAlertEndpoint: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    backgroundColor: 'rgba(255, 59, 48, 0.95)',
    shadowColor: '#FF3B30',
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  spaceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  darkSpaceGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050816',
  },
  nebulaGlow: {
    position: 'absolute',
    left: '18%',
    top: '10%',
    width: '78%',
    height: '46%',
    borderRadius: 260,
    backgroundColor: '#2a3cff',
    opacity: 0.2,
    shadowColor: '#2a3cff',
    shadowOpacity: 0.35,
    shadowRadius: 120,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  starField: {
    ...StyleSheet.absoluteFillObject,
  },
  starDot: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: '#FFF',
  },
  particleField: {
    ...StyleSheet.absoluteFillObject,
  },
  particleDot: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: 'rgba(173, 216, 255, 0.36)',
  },
  earthAtmosphere: {
    position: 'absolute',
    right: -120,
    bottom: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#0f3d7c',
    opacity: 0.24,
    shadowColor: '#2e86ff',
    shadowOpacity: 0.24,
    shadowRadius: 86,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  overheadPopup: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 22,
  },
  overheadCard: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 78, 78, 0.6)',
    backgroundColor: 'rgba(18, 8, 10, 0.94)',
    shadowColor: '#FF3B30',
    shadowOpacity: 0.3,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 18,
  },
  overheadTitle: {
    color: '#FF4D4D',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.8,
  },
  overheadSatellite: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  overheadDirection: {
    color: '#A4F0FF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  overheadDistance: {
    color: '#DDEBFF',
    fontSize: 14,
    textAlign: 'center',
  },
  statusBar: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(1, 26, 42, 0.88)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.16)',
    shadowColor: '#00E5FF',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  statusText: {
    color: '#00E5FF',
    fontSize: 13,
    fontWeight: '700',
  },
  statusTextSecondary: {
    color: '#A4F0FF',
    fontSize: 12,
    marginTop: 2,
  },
  statusActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(1, 26, 42, 0.8)',
    marginLeft: 4,
  },
  smallButtonActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.18)',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  followButtonActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  popupRadar: {
    position: 'absolute',
    top: -12,
    right: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    shadowColor: '#00E5FF',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  historyPanel: {
    backgroundColor: '#00121f',
    borderTopWidth: 1,
    borderColor: '#033',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  historyTitle: {
    color: '#a4f0ff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  historyEmpty: {
    color: '#8cbfd4',
    fontSize: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.08)',
  },
  historyAlert: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  historyDetails: {
    color: '#8cdcff',
    fontSize: 11,
    marginTop: 2,
  },
  historyTime: {
    color: '#7df7ff',
    fontSize: 10,
  },
  historyFocus: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  warningBanner: {
    position: 'absolute',
    top: 90,
    left: 16,
    right: 16,
    zIndex: 15,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
    minHeight: 66,
    justifyContent: 'center',
  },
  warningText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  warningSubtext: {
    color: '#dceffc',
    fontSize: 12,
  },
  warning1: {
    backgroundColor: 'rgba(0, 173, 255, 0.16)',
    borderColor: '#00AAFF',
  },
  warning2: {
    backgroundColor: 'rgba(255, 170, 41, 0.16)',
    borderColor: '#FFAA29',
  },
  warning3: {
    backgroundColor: 'rgba(255, 77, 77, 0.18)',
    borderColor: '#FF4D4D',
  },
  warning4: {
    backgroundColor: 'rgba(255, 45, 85, 0.18)',
    borderColor: '#FF2D55',
  },
  mapAlert: {
    borderWidth: 2,
    borderColor: '#FF4D4D',
  },
  simulatedMarkerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 45, 85, 0.18)',
  },
  simulatedMarkerCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF2D55',
    borderWidth: 1,
    borderColor: '#fff',
  },
  satelliteMarkerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
  },
  satelliteGlow: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 28,
    opacity: 0.42,
    shadowOpacity: 0.75,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  satelliteIcon: {
    width: 38,
    height: 38,
    tintColor: '#fff',
  },
  satelliteIconSelected: {
    transform: [{ scale: 1.08 }],
  },
  satelliteAlertIcon: {
    tintColor: '#FF5C5C',
  },
  satelliteBadge: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#fff',
    opacity: 0.8,
  },
  permissionAlert: {
    position: 'absolute',
    top: 90,
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ff7b7b',
    padding: 14,
    marginBottom: 12,
  },
  permissionAlertText: {
    color: '#ffdddd',
    fontSize: 13,
    marginBottom: 10,
  },
  permissionButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#ff5c5c',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  markerLabel: {
    fontWeight: '700',
    fontSize: 12,
  },
  alertLabel: {
    color: '#ff6b6b',
    fontWeight: '800',
  },
  popup: {
    position: 'absolute',
    top: 36,
    left: 16,
    right: 16,
    backgroundColor: '#011b2b',
    padding: 16,
    borderRadius: 18,
    borderColor: '#03385f',
    borderWidth: 1,
    shadowColor: '#00e5ff',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#00E5FF',
    fontSize: 18,
    fontWeight: '700',
  },
  statusLabel: {
    color: '#7df7ff',
    fontSize: 12,
    fontWeight: '700',
  },
  text: {
    color: '#fff',
    marginTop: 6,
    fontSize: 13,
  },
  bottom: {
    maxHeight: 240,
    backgroundColor: '#011217',
    borderTopWidth: 1,
    borderColor: '#033',
  },
  bottomTitle: {
    color: '#8ce3ff',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  cardList: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#022133',
    marginHorizontal: 8,
    marginVertical: 6,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#033',
  },
  cardSelected: {
    borderColor: '#00E5FF',
    backgroundColor: '#00324f',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: '#93d7ff',
    marginTop: 4,
    fontSize: 12,
  },
});

