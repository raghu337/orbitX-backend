import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
} from 'react-native';
import DashboardCard from '../components/DashboardCard';
import { COLORS, SPACING, SHADOWS } from '../theme/theme';

const HomeScreen = ({ navigation }) => {
  const features = [
    { id: '1', title: 'AI Space Tutor', icon: 'robot-outline', color: COLORS.warning },
    { id: '2', title: 'Live Satellite Tracker', icon: 'satellite-variant', color: COLORS.primary },
    { id: '3', title: 'Planet Explorer', icon: 'earth', color: COLORS.accent },
    { id: '4', title: 'Space Facts', icon: 'book-open-page-variant', color: '#00E5FF' },
    { id: '5', title: 'Quiz Zone', icon: 'brain', color: COLORS.success },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>ORBITX DASHBOARD</Text>
            <Text style={styles.userName}>Cmdr. Explorer</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.replace('Login')}
          >
            <MaterialCommunityIcons name="logout" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeaderWrapper}>
          <Text style={styles.sectionHeader}>Mission Control</Text>
        </View>
        
        <View style={styles.grid}>
          <View style={styles.fullWidthCardWrapper}>
            <DashboardCard
              title={features[0].title}
              icon={features[0].icon}
              color={features[0].color}
              onPress={() => {}}
            />
          </View>

          {features.slice(1).map((feature) => (
            <DashboardCard
              key={feature.id}
              title={feature.title}
              icon={feature.icon}
              color={feature.color}
              onPress={() => {}}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  welcomeText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    ...SHADOWS.neon,
  },
  userName: {
    fontWeight: '900',
    fontSize: 28,
    color: COLORS.text,
    marginTop: 4,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeaderWrapper: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
  },
  fullWidthCardWrapper: {
    width: '100%',
  },
});

export default HomeScreen;
