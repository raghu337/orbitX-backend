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
    Alert,
    Image,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundGradient from '../../components/BackgroundGradient';
import SectionHeader from '../../components/dashboard/SectionHeader';
import NeonButton from '../../components/NeonButton';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS, SPACING } from '../../theme/theme';
import { BASE_URL } from '../../services/api/orbitxApi';

const MONOSPACE_FONT = Platform.OS === 'ios' ? 'Courier' : 'monospace';

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

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();


  const [settings, setSettings] = useState({
    passes: false,
    facts: false,
    streak: false,
    silent: false,
  });

  const [backendConnected, setBackendConnected] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permissionNotice, setPermissionNotice] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        loadMockUsers();
        return;
      }
      
      const response = await fetch(`${BASE_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRegisteredUsers(data);
      } else {
        loadMockUsers();
      }
    } catch (err) {
      loadMockUsers();
    }
  };

  const loadMockUsers = () => {
    const mockUsers = [
      { id: 1, name: 'Commander Explorer', email: 'astronaut@orbitx.com', role: 'admin', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
      { id: 2, name: 'Nova Pilot', email: 'nova@orbitx.com', role: 'user', created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
      { id: 3, name: 'Cosmo Engineer', email: 'cosmo@orbitx.com', role: 'user', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 4, name: 'Orion Captain', email: 'orion@orbitx.com', role: 'user', created_at: new Date(Date.now() - 60000).toISOString() },
    ];
    setRegisteredUsers(mockUsers);
  };

  const handlePickAvatar = async () => {
    try {
      setPermissionNotice(null);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        setPermissionNotice('Gallery access required for custom profile pictures.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        setProfileImage(selectedUri);
        await AsyncStorage.setItem('@orbitx_admin_avatar', selectedUri);
        setPermissionNotice(null);
      }
    } catch (error) {
      console.warn('Image picking error:', error);
      setPermissionNotice('Failed to open image gallery.');
    }
  };

  useEffect(() => {
    testBackendSync(true);

    const loadData = async () => {
      try {
        const savedImage = await AsyncStorage.getItem('@orbitx_admin_avatar');
        if (savedImage) setProfileImage(savedImage);
      } catch (e) {
        console.warn('Failed to load profile image uri', e);
      }
      await fetchUsers();
    };

    loadData();

    // Setup live subscription/ticker simulation
    const mockEmails = [
      'starlord@orbitx.com',
      'pegasus@orbitx.com',
      'galaxy_mapper@orbitx.com',
      'astro_nerd@orbitx.com',
      'nebula_scout@orbitx.com',
      'quasar@orbitx.com'
    ];
    const mockNames = [
      'Star Lord',
      'Pegasus Pilot',
      'Galaxy Mapper',
      'Astro Nerd',
      'Nebula Scout',
      'Quasar Rider'
    ];

    let emailIndex = 0;

    const interval = setInterval(() => {
      if (emailIndex >= mockEmails.length) {
        emailIndex = 0; // wrap around
      }
      const newEmail = mockEmails[emailIndex];
      const newName = mockNames[emailIndex];
      emailIndex++;

      const newUser = {
        id: Date.now(),
        name: newName,
        email: newEmail,
        role: 'user',
        created_at: new Date().toISOString()
      };

      // Add to registered list
      setRegisteredUsers(prev => [newUser, ...prev]);

      // Add to notification ticker feed
      const newNotification = {
        id: newUser.id,
        email: newUser.email,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setAdminNotifications(prev => [newNotification, ...prev].slice(0, 10)); // keep last 10
      setUnreadCount(prev => prev + 1);

    }, 15000); // Trigger every 15 seconds

    return () => clearInterval(interval);
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
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
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
          <TouchableOpacity activeOpacity={0.85} onPress={handlePickAvatar} style={styles.avatarGlowOuter}>
            <View style={styles.avatarGlowInner}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={profileImage ? { uri: profileImage } : require('../../assets/images/default-avatar.png')} 
                  style={styles.avatarImage} 
                />
              </View>
            </View>
            <View style={styles.onlineBadge} />
          </TouchableOpacity>
          <Text style={styles.profileName}>{user?.name || 'Explorer'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'Awaiting command...'}</Text>
          {permissionNotice && (
            <Text style={styles.permissionNoticeText}>{permissionNotice}</Text>
          )}
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

        {/* SYSTEM ADMIN PORTAL */}
        <SectionHeader title="[ SYSTEM ADMIN PORTAL: USER DIRECTORY ]" />
        <View style={styles.section}>
          <View style={styles.adminPortalContainer}>
            {/* Live Ticker Header */}
            <View style={styles.adminHeaderRow}>
              <Text style={styles.adminSectionTitle}>LIVE FEED</Text>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={() => setUnreadCount(0)} style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{unreadCount} NEW</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Notifications Ticker */}
            <View style={styles.tickerContainer}>
              {adminNotifications.length === 0 ? (
                <Text style={styles.tickerPlaceholder}>> Awaiting registration sync...</Text>
              ) : (
                adminNotifications.map((notif) => (
                  <Text key={notif.id} style={styles.tickerText}>
                    <Text style={styles.tickerTime}>[{notif.timestamp}]</Text> > Account entered: <Text style={styles.tickerEmail}>{notif.email}</Text>
                  </Text>
                ))
              )}
            </View>

            {/* Registered Users Directory */}
            <Text style={styles.adminSectionTitle}>REGISTERED CREW DIRECTORY ({registeredUsers.length})</Text>
            <ScrollView 
              style={styles.directoryScrollView} 
              nestedScrollEnabled={true}
            >
              <View style={styles.directoryContainer}>
                {registeredUsers.length === 0 ? (
                  <Text style={styles.tickerPlaceholder}>> No crew members indexed.</Text>
                ) : (
                  registeredUsers.map((item) => (
                    <View key={item.id} style={styles.userRow}>
                      <View style={styles.userInfoCol}>
                        <Text style={styles.userName}>{item.name}</Text>
                        <Text style={styles.userEmail}>{item.email}</Text>
                        <Text style={styles.userTime}>Registered: {new Date(item.created_at).toLocaleString()}</Text>
                      </View>
                      <View style={[
                        styles.roleBadge, 
                        { backgroundColor: item.role === 'admin' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)' }
                      ]}>
                        <Text style={[
                          styles.roleText, 
                          { color: item.role === 'admin' ? '#00E5FF' : 'rgba(255, 255, 255, 0.6)' }
                        ]}>
                          {item.role?.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
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
  adminPortalContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: '#00E5FF',
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  adminHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  adminSectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#00E5FF',
    letterSpacing: 1,
    marginVertical: SPACING.xs,
  },
  badgeContainer: {
    backgroundColor: '#FF4B4B',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    shadowColor: '#FF4B4B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: FONTS.bold,
  },
  tickerContainer: {
    backgroundColor: 'rgba(4, 7, 20, 0.7)',
    borderRadius: 8,
    padding: SPACING.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    marginBottom: SPACING.md,
    maxHeight: 120,
    overflow: 'hidden',
  },
  tickerPlaceholder: {
    fontFamily: MONOSPACE_FONT,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  tickerText: {
    fontFamily: MONOSPACE_FONT,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    marginVertical: 1,
  },
  tickerTime: {
    color: '#FFB800',
  },
  tickerEmail: {
    color: '#00E5FF',
    fontWeight: 'bold',
  },
  directoryScrollView: {
    maxHeight: 200,
  },
  directoryContainer: {
    backgroundColor: 'rgba(4, 7, 20, 0.4)',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  userEmail: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 1,
  },
  userTime: {
    fontFamily: FONTS.regular,
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  roleText: {
    fontFamily: FONTS.bold,
    fontSize: 8,
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  permissionNoticeText: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: '#FF4B4B',
    marginTop: 6,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 75, 75, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 75, 75, 0.2)',
  },
});

export default ProfileScreen;
