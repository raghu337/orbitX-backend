import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BackgroundGradient from '../../components/BackgroundGradient';
import GlassCard from '../../components/GlassCard';
import { LEADERBOARD_DATA } from '../../data/mockQuiz';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const LeaderboardScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <GlassCard style={styles.rankCard}>
      <Text style={styles.rankText}>#{item.rank}</Text>
      <View style={styles.avatarContainer}>
        <MaterialCommunityIcons name="account" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.nameContainer}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
      <Text style={styles.score}>{item.score.toLocaleString()} XP</Text>
    </GlassCard>
  );

  return (
    <BackgroundGradient>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Hall of Fame</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Top 3 Highlighting */}
        <View style={styles.topThree}>
          <View style={[styles.topThreeItem, { marginTop: 30 }]}>
            <Text style={styles.rankNumber}>2</Text>
            <View style={styles.topAvatar}>
              <MaterialCommunityIcons name="account" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.topName}>Star Voyager</Text>
          </View>

          <View style={styles.topThreeItem}>
            <MaterialCommunityIcons name="crown" size={24} color="#FFB800" style={styles.crown} />
            <Text style={[styles.rankNumber, { color: '#FFB800' }]}>1</Text>
            <View style={[styles.topAvatar, { borderColor: '#FFB800', width: 80, height: 80, borderRadius: 40 }]}>
              <MaterialCommunityIcons name="account" size={50} color="#FFB800" />
            </View>
            <Text style={[styles.topName, { color: '#FFB800' }]}>Commander Nova</Text>
          </View>

          <View style={[styles.topThreeItem, { marginTop: 40 }]}>
            <Text style={styles.rankNumber}>3</Text>
            <View style={styles.topAvatar}>
              <MaterialCommunityIcons name="account" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.topName}>Astro Lex</Text>
          </View>
        </View>

        {/* Rankings List */}
        <FlatList
          data={LEADERBOARD_DATA.slice(3)}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  topThree: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  topThreeItem: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  crown: {
    marginBottom: -5,
    zIndex: 1,
  },
  rankNumber: {
    fontFamily: FONTS.black,
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 5,
  },
  topAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 10,
  },
  topName: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  rankText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
    width: 30,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
  },
  score: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
});

export default LeaderboardScreen;
