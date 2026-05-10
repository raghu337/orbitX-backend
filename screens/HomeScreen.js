import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Theme } from '../styles/theme';
import SpaceBackground from '../components/SpaceBackground';
import GlassCard from '../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import AnimatedDashboardCard from '../components/AnimatedDashboardCard';

export default function HomeScreen() {
  return (
    <SpaceBackground>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Commander,</Text>
          <Text style={styles.username}>StarGazer99</Text>
        </View>
        <TouchableOpacity>
          <GlassCard style={styles.profileBtn} intensity={30}>
            <Ionicons name="person" size={24} color={Theme.colors.primary} />
          </GlassCard>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AnimatedDashboardCard 
          title="Live Tracker" 
          icon="planet" 
          isLarge={true} 
          index={0}
          onPress={() => {}} 
        />
        
        <View style={styles.grid}>
          <AnimatedDashboardCard 
            title="Space Tutor" 
            icon="chatbubbles" 
            index={1}
            onPress={() => {}} 
          />
          <AnimatedDashboardCard 
            title="Explorer" 
            icon="telescope" 
            index={2}
            onPress={() => {}} 
          />
          <AnimatedDashboardCard 
            title="Space Facts" 
            icon="book" 
            index={3}
            onPress={() => {}} 
          />
          <AnimatedDashboardCard 
            title="Quiz Zone" 
            icon="help-circle" 
            index={4}
            onPress={() => {}} 
          />
        </View>
      </ScrollView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xxl + Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
    zIndex: 2,
  },
  greeting: {
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textSecondary,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  username: {
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    fontSize: 24,
    textShadowColor: Theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  profileBtn: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.round,
    borderColor: Theme.colors.primary,
    borderWidth: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingTop: 0,
    paddingBottom: Theme.spacing.xxl,
    zIndex: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
