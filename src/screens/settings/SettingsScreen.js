import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useEffect, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
    Alert
} from 'react-native';
import BackgroundGradient from '../../components/BackgroundGradient';
import SectionHeader from '../../components/dashboard/SectionHeader';
import NeonButton from '../../components/NeonButton';
import GlassCard from '../../components/GlassCard';
import SatelliteProximityAlertCard from '../../components/settings/SatelliteProximityAlertCard';
import { useAuth } from '../../hooks/useAuth';
import { useSatelliteAlerts } from '../../hooks/useSatelliteAlerts';
import { COLORS, FONTS, SPACING } from '../../theme/theme';
import { BASE_URL } from '../../services/api/orbitxApi';

const ManifestRow = ({ icon, title, value, onPress, hasChevron = true, children }) => {
  const translateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(translateAnim, {
      toValue: 6,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(translateAnim, {
      toValue: 0,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={hasChevron ? handlePressIn : undefined}
      onPressOut={hasChevron ? handlePressOut : undefined}
      style={styles.settingLink}
    >
      <View style={styles.settingLinkLeft}>
        <View style={styles.rowIconContainer}>
          <MaterialCommunityIcons name={icon} size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.linkText}>{title}</Text>
      </View>
      <View style={styles.settingLinkRight}>
        {value ? <Text style={styles.rowValueText}>{value}</Text> : null}
        {children}
        {hasChevron && (
          <Animated.View style={{ transform: [{ translateX: translateAnim }] }}>
            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.primary} />
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const {
    notificationsEnabled,
    proximityAlertsEnabled,
    trackedAlerts,
    toggleNotifications,
    toggleProximityAlerts,
  } = useSatelliteAlerts();

  const [settings, setSettings] = useState({
    passes: false,
    facts: false,
    streak: false,
    silent: false,
  });

  const [backendConnected, setBackendConnected] = useState(true);

  useEffect(() => {
    testBackendSync(true);
  }, []);

  const testBackendSync = async (silent = true) => {
    try {
      const response = await fetch(`${BASE_URL.replace('/api/v1', '')}/health`);
      if (response.ok || response.status === 200 || response.status === 404) {
        setBackendConnected(true);
        if (!silent) Alert.alert('📡 Diagnostics Pass', 'Backend connection check successful!');
      } else {
        setBackendConnected(false);
        if (!silent) Alert.alert('⚠️ Diagnostics Fail', 'Backend responded with an error.');
      }
    } catch (e) {
      setBackendConnected(false);
      if (!silent) Alert.alert('⚠️ Diagnostics Offline', 'Failed to connect to backend.');
    }
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <BackgroundGradient>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          {navigation.canGoBack() ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile Summary */}
        <View style={styles.profileSection}>
          <View style={styles.avatarGlowOuter}>
            <View style={styles.avatarGlowInner}>
              <View style={styles.avatarContainer}>
                <MaterialCommunityIcons name="account" size={50} color={COLORS.primary} />
              </View>
            </View>
            <View style={styles.onlineBadge} />
          </View>
          <Text style={styles.profileName}>{user?.name || 'Explorer'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'Awaiting command...'}</Text>
        </View>

        {/* Mission Stats Dashboard */}
        <View style={styles.statsContainer}>
          <GlassCard style={styles.statsCard}>
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>SATELLITES</Text>
              <Text style={styles.statSublabel}>TRACKED</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>COGNITIVE</Text>
              <Text style={styles.statSublabel}>MASTERY</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>CMD PILOT</Text>
              <Text style={styles.statLabel}>MISSION</Text>
              <Text style={styles.statSublabel}>RANK</Text>
            </View>
          </GlassCard>
        </View>

        {/* Real-Time Alerts */}
        <SectionHeader title="[ RADAR TELEMETRY // REAL-TIME ALERTS ]" />
        <View style={styles.section}>
          <SatelliteProximityAlertCard
            enabled={proximityAlertsEnabled}
            onToggle={toggleProximityAlerts}
            trackedAlerts={trackedAlerts}
          />
        </View>

        {/* 01 // PILOT IDENTIFICATION */}
        <SectionHeader title="[ 01 // PILOT IDENTIFICATION ]" />
        <View style={styles.section}>
          <GlassCard style={styles.glassPanel}>
            <ManifestRow icon="account" title="Full Name" value={user?.name || 'Explorer'} hasChevron={false} />
            <ManifestRow icon="email" title="Vessel Email" value={user?.email || 'Awaiting command...'} hasChevron={false} />
            <ManifestRow icon="shield-account" title="Mission Status" value="ACTIVE DUTY" hasChevron={false} />
          </GlassCard>
        </View>

        {/* 02 // COMMS & NOTIFICATIONS */}
        <SectionHeader title="[ 02 // COMMS & NOTIFICATIONS ]" />
        <View style={styles.section}>
          <GlassCard style={styles.glassPanel}>
            <ManifestRow icon="satellite-variant" title="Pass Predictions" hasChevron={false}>
              <Switch
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: `${COLORS.primary}40` }}
                thumbColor={notificationsEnabled ? COLORS.primary : '#f4f3f4'}
                ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                onValueChange={toggleNotifications}
                value={notificationsEnabled}
              />
            </ManifestRow>
            
            <ManifestRow icon="lightbulb-on" title="Daily Space Facts" hasChevron={false}>
              <Switch
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: `#FFB80040` }}
                thumbColor={settings.facts ? '#FFB800' : '#f4f3f4'}
                ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                onValueChange={() => toggleSetting('facts')}
                value={settings.facts}
              />
            </ManifestRow>

            <ManifestRow icon="fire" title="Streak Reminders" hasChevron={false}>
              <Switch
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: `#FF4B4B40` }}
                thumbColor={settings.streak ? '#FF4B4B' : '#f4f3f4'}
                ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                onValueChange={() => toggleSetting('streak')}
                value={settings.streak}
              />
            </ManifestRow>

            <ManifestRow icon="bell-off" title="Silent Mode" hasChevron={false}>
              <Switch
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: `#A5A5A540` }}
                thumbColor={settings.silent ? '#A5A5A5' : '#f4f3f4'}
                ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                onValueChange={() => toggleSetting('silent')}
                value={settings.silent}
              />
            </ManifestRow>
          </GlassCard>
        </View>

        {/* 03 // SECURE PROTOCOLS & DIAGNOSTICS */}
        <SectionHeader title="[ 03 // DIAGNOSTICS & SYSTEM ]" />
        <View style={styles.section}>
          <GlassCard style={styles.glassPanel}>
            <ManifestRow 
              icon="shield-check" 
              title="Privacy Policy" 
              onPress={() => Alert.alert('Secure Protocol', 'Privacy Policy encrypted and active.')} 
            />
            <ManifestRow 
              icon="help-circle" 
              title="Help Center" 
              onPress={() => Alert.alert('Comms Open', 'Help Center channel established.')} 
            />
            <ManifestRow 
              icon="sync" 
              title="Backend Sync Diagnostics" 
              value={backendConnected ? 'CONNECTED' : 'OFFLINE'}
              onPress={() => testBackendSync(false)} 
            />
          </GlassCard>
        </View>

        <View style={styles.logoutContainer}>
          <NeonButton 
            title="Deorbit (Logout)" 
            onPress={handleLogout}
            style={styles.logoutButton}
          />
          <Text style={styles.version}>OrbitX v1.0.4 - Stable Orbit</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarGlowOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: SPACING.md,
  },
  avatarGlowInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 0, 157, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(4, 7, 20, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  profileName: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
  },
  profileEmail: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(4, 7, 20, 0.35)',
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#00E5FF',
    textShadowColor: 'rgba(0, 229, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  statLabel: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: '#8E9AA6',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  statSublabel: {
    fontFamily: FONTS.regular,
    fontSize: 8,
    color: '#8E9AA6',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  glassPanel: {
    backgroundColor: 'rgba(4, 7, 20, 0.35)',
    borderColor: 'rgba(0, 229, 255, 0.2)',
    padding: SPACING.xs,
  },
  settingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  linkText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.text,
  },
  settingLinkRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValueText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#00E5FF',
    marginRight: 8,
  },
  logoutContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
  },
  version: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },
});

export default SettingsScreen;
