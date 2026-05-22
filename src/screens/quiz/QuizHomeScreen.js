import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const quizQuestions = [
  { id: '1', category: 'Planets', q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 'Mars' },
  { id: '2', category: 'Satellites', q: 'What is the largest artificial satellite currently in Earth orbit?', options: ['Hubble', 'Starlink', 'ISS', 'Sputnik'], answer: 'ISS' },
  { id: '3', category: 'Astronomy', q: 'What is the closest star to Earth?', options: ['Sirius', 'Alpha Centauri', 'Proxima Centauri', 'The Sun'], answer: 'The Sun' },
  { id: '4', category: 'Galaxies', q: 'What type of galaxy is the Milky Way?', options: ['Elliptical', 'Spiral', 'Irregular', 'Lenticular'], answer: 'Spiral' },
  { id: '5', category: 'Space Science', q: 'Who was the first human to journey into outer space?', options: ['Neil Armstrong', 'Yuri Gagarin', 'Buzz Aldrin', 'John Glenn'], answer: 'Yuri Gagarin' },
  { id: '6', category: 'Planets', q: 'Which planet has the most moons?', options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], answer: 'Saturn' },
];

const QuizHomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.text} />
        </TouchableOpacity>
        <MaterialCommunityIcons name="brain" size={28} color={COLORS.success} />
        <Text style={styles.headerTitle}>Quiz Zone</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>TEST YOUR KNOWLEDGE</Text>
          <Text style={styles.heroSubtitle}>Complete space missions to earn badges</Text>
          <TouchableOpacity style={styles.startButton} activeOpacity={0.8}>
            <Text style={styles.startButtonText}>START RANDOM MISSION</Text>
            <MaterialCommunityIcons name="rocket-launch" size={20} color={COLORS.background} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>SAMPLE QUESTIONS</Text>
        
        {(quizQuestions || []).map((quiz, index) => (
          <View key={quiz.id} style={styles.questionCard}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{quiz.category}</Text>
            </View>
            <Text style={styles.questionText}>{index + 1}. {quiz.q}</Text>
            
            <View style={styles.optionsGrid}>
              {(quiz.options || []).map((opt, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.optionBox, 
                    opt === quiz.answer && styles.correctOption
                  ]}
                >
                  <Text 
                    style={[
                      styles.optionText, 
                      opt === quiz.answer && styles.correctOptionText
                    ]}
                  >
                    {opt}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    letterSpacing: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  heroSection: {
    backgroundColor: 'rgba(0, 230, 118, 0.05)',
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  heroTitle: {
    fontFamily: FONTS.black,
    fontSize: 24,
    color: COLORS.success,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 30,
    alignItems: 'center',
  },
  startButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.background,
    marginRight: SPACING.sm,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  categoryText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.success,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionBox: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  correctOption: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderColor: COLORS.success,
  },
  optionText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  correctOptionText: {
    color: COLORS.success,
    fontFamily: FONTS.bold,
  },
});

export default QuizHomeScreen;
