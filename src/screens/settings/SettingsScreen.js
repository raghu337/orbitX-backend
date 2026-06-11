import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import BackgroundGradient from '../../components/BackgroundGradient';
import SectionHeader from '../../components/dashboard/SectionHeader';
import NeonButton from '../../components/NeonButton';
import NotificationSettingsCard from '../../components/settings/NotificationSettingsCard';
import SatelliteProximityAlertCard from '../../components/settings/SatelliteProximityAlertCard';
import { useAuth } from '../../hooks/useAuth';
import { useSatelliteAlerts } from '../../hooks/useSatelliteAlerts';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

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

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = async () => {
    await logout();
    // Navigation will be handled by AppNavigator observing auth state
  };

  return (
    <BackgroundGradient>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile Summary */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account" size={50} color={COLORS.primary} />
            <View style={styles.onlineBadge} />
          </View>
          <Text style={styles.profileName}>{user?.name || 'Explorer'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'Awaiting command...'}</Text>
        </View>

        {/* Real-Time Alerts */}
        <SectionHeader title="Real-Time Satellite Alerts" />
        <View style={styles.section}>
          <SatelliteProximityAlertCard
            enabled={proximityAlertsEnabled}
            onToggle={toggleProximityAlerts}
            trackedAlerts={trackedAlerts}
          />
        </View>

        {/* Legacy Notification Settings */}
        <SectionHeader title="Notification Preferences" />
        <View style={styles.section}>
          <NotificationSettingsCard
            title="Pass Predictions"
            description={notificationsEnabled ? 'Enabled - Get alerts for upcoming passes' : 'Get alerted 5 minutes before visible satellite passes.'}
            icon="satellite-variant"
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            color={COLORS.primary}
          />
          <NotificationSettingsCard
            title="Daily Space Facts"
            description="Receive a curated space fact every morning. (Coming soon)"
            icon="lightbulb-on"
            value={settings.facts}
            onValueChange={() => toggleSetting('facts')}
            color="#FFB800"
          />
          <NotificationSettingsCard
            title="Streak Reminders"
            description="Remind me to complete my daily quiz. (Coming soon)"
            icon="fire"
            value={settings.streak}
            onValueChange={() => toggleSetting('streak')}
            color="#FF4B4B"
          />
          <NotificationSettingsCard
            title="Silent Mode"
            description="Disable all sound and vibration for alerts."
            icon="bell-off"
            value={settings.silent}
            onValueChange={() => toggleSetting('silent')}
            color="#A5A5A5"
          />
        </View>

        {/* App Settings */}
        <SectionHeader title="App System" />
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingLink}>
            <MaterialCommunityIcons name="shield-check" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255, 255, 255, 0.2)" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingLink}>
            <MaterialCommunityIcons name="help-circle" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkText}>Help Center</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255, 255, 255, 0.2)" />
          </TouchableOpacity>
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
    marginBottom: SPACING.xxl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 15,
    height: 15,
    borderRadius: 7.5,
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
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  settingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  linkText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.md,
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
