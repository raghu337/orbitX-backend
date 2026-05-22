import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import BackgroundGradient from '../../components/BackgroundGradient';
import GlassCard from '../../components/GlassCard';
import NeonButton from '../../components/NeonButton';
import AnswerOption from '../../components/quiz/AnswerOption';
import ProgressTracker from '../../components/quiz/ProgressTracker';
import { prepareQuiz } from '../../data/quizData';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

const QuestCategoryFallback = {
  title: 'Unknown Mission',
  color: COLORS.primary,
  icon: 'rocket-launch',
  id: 'UNKNOWN',
  missionType: 'UNKNOWN',
  difficulty: 'NORMAL',
};

const QuizPlayScreen = ({ route, navigation }) => {
  const category = route.params?.category || QuestCategoryFallback;
  
  // State
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [fuel, setFuel] = useState(3);
  const [gameState, setGameState] = useState('BRIEFING'); // BRIEFING, COUNTDOWN, PLAYING, FINISHED
  const [countdown, setCountdown] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  // Animation values
  const fuelScale = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const [flashType, setFlashType] = useState(null);

  // Initialize Quiz Dataset
  useEffect(() => {
    // Launching quiz
    
    // Load category-specific dataset with randomization
    const missionQuestions = prepareQuiz(route.params?.category?.title || '');
    
    if (!(missionQuestions?.length > 0)) {
      // Missing questions
      navigation.goBack();
      return;
    }

    setQuestions(missionQuestions);
    
    // Animate briefing entry
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [route.params?.category?.title]);

  const currentQuestion = questions?.[currentQuestionIndex];

  // Countdown cycle
  useEffect(() => {
    if (gameState === 'COUNTDOWN') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState('PLAYING');
      }
    }
  }, [countdown, gameState]);

  // Main game timer
  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'PLAYING' && timeLeft === 0 && !isAnswered) {
      handleAnswer(null); // Time out - treat as wrong
    }
  }, [timeLeft, isAnswered, gameState]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 12, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const triggerFlash = (type) => {
    setFlashType(type);
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.3, duration: 100, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const handleAnswer = (option) => {
    if (isAnswered || !currentQuestion) return;
    
    setSelectedOption(option);
    setIsAnswered(true);
    
    const isCorrect = option === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
      triggerFlash('success');
    } else {
      setFuel(prev => Math.max(0, prev - 1));
      triggerShake();
      triggerFlash('error');
      Vibration.vibrate(200);
      
      Animated.sequence([
        Animated.timing(fuelScale, { toValue: 1.6, duration: 150, useNativeDriver: true }),
        Animated.timing(fuelScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleNext = async () => {
    if (fuel === 0) {
      navigation.replace('QuizResult', { 
        score, 
        total: questions.length,
        category,
        failed: true
      });
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      setSubmitting(false);
      navigation.replace('QuizResult', {
        score,
        total: questions.length,
        category
      });
    }
  };

  const startCountdown = () => {
    setGameState('COUNTDOWN');
  };

  // 1. Mission Briefing Phase
  if (gameState === 'BRIEFING') {
    return (
      <BackgroundGradient>
        <Animated.View style={[styles.center, { opacity: fadeAnim }]}>
          <View style={styles.briefingHeader}>
            <View style={[styles.iconGlowContainer, { backgroundColor: `${category.color}20` }]}>
              <MaterialCommunityIcons name={category.icon} size={60} color={category.color} />
            </View>
            <Text style={[styles.briefingTitle, { color: category.color }]}>{category.title.toUpperCase()}</Text>
          </View>
          
          <GlassCard style={styles.briefingCard}>
            <Text style={styles.missionBriefTitle}>MISSION_IDENTIFIER: {category.id}</Text>
            <View style={styles.briefingDivider} />
            <View style={styles.briefInfoRow}>
              <Text style={styles.briefLabel}>SECTOR:</Text>
              <Text style={styles.briefValue}>{category.missionType}</Text>
            </View>
            <View style={styles.briefInfoRow}>
              <Text style={styles.briefLabel}>DIFFICULTY:</Text>
              <Text style={[styles.briefValue, { color: category.color }]}>{category.difficulty}</Text>
            </View>
            <View style={styles.briefInfoRow}>
              <Text style={styles.briefLabel}>COORDINATES:</Text>
              <Text style={styles.briefValue}>{questions.length} Points</Text>
            </View>
            <View style={styles.briefingDivider} />
            <Text style={styles.briefingInstruction}>
              Transmission protocols active. Analyze the data streams below. Any deviation in accuracy will result in life-support fuel depletion.
            </Text>
          </GlassCard>

          <NeonButton 
            title="CONFIRM & LAUNCH" 
            onPress={startCountdown}
            style={[styles.launchButton, { backgroundColor: category.color }]}
          />
          
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.abortButton}>
            <Text style={styles.abortText}>ABORT MISSION</Text>
          </TouchableOpacity>
        </Animated.View>
      </BackgroundGradient>
    );
  }

  // 2. Launch Countdown Phase
  if (gameState === 'COUNTDOWN') {
    return (
      <BackgroundGradient>
        <View style={styles.center}>
          <Text style={styles.missionBrief}>MISSION_START_IN</Text>
          <View style={[styles.countdownCircle, { borderColor: category.color }]}>
            <Text style={[styles.countdownText, { color: category.color }]}>{countdown === 0 ? 'GO!' : countdown}</Text>
            <View style={[styles.countdownGlow, { backgroundColor: category.color }]} />
          </View>
          <Text style={styles.readyText}>STABILIZING ION THRUSTERS...</Text>
        </View>
      </BackgroundGradient>
    );
  }

  if (!currentQuestion) return null;

  // 3. Active Mission Phase (Gameplay)
  return (
    <BackgroundGradient>
      <View style={styles.container}>
        {/* Flash Overlay */}
        <Animated.View 
          style={[
            StyleSheet.absoluteFillObject, 
            { 
              backgroundColor: flashType === 'success' ? COLORS.success : COLORS.error,
              opacity: flashOpacity,
              zIndex: 100,
            }
          ]} 
          pointerEvents="none"
        />
        
        {/* Background Visual Element */}
        <MaterialCommunityIcons 
          name={category.icon} 
          size={width * 0.9} 
          color={`${category.color}05`} 
          style={styles.bgIcon} 
        />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          
          <View style={styles.timerContainer}>
            <MaterialCommunityIcons name="clock-outline" size={18} color={timeLeft < 10 ? COLORS.error : category.color} />
            <Text style={[styles.timerText, { color: timeLeft < 10 ? COLORS.error : category.color }]}>{timeLeft}s</Text>
          </View>

          <View style={styles.fuelContainer}>
            <Animated.View style={{ transform: [{ scale: fuelScale }] }}>
              <MaterialCommunityIcons name="gas-station" size={20} color={fuel === 1 ? COLORS.error : category.color} />
            </Animated.View>
            <View style={styles.fuelRow}>
              {[1, 2, 3].map(i => (
                <View 
                  key={i} 
                  style={[
                    styles.fuelBit, 
                    { backgroundColor: i <= fuel ? category.color : 'rgba(255, 255, 255, 0.1)' }
                  ]} 
                />
              ))}
            </View>
          </View>
        </View>

        <Animated.View style={[styles.content, { transform: [{ translateX: shakeAnim }] }]}>
          <View style={styles.progressRow}>
            <Text style={styles.missionProgress}>{category.missionType.toUpperCase()} DATA STREAM</Text>
            <Text style={[styles.questionCounter, { color: category.color }]}>{currentQuestionIndex + 1}/{questions.length}</Text>
          </View>
          
          <ProgressTracker 
            current={currentQuestionIndex + 1} 
            total={questions.length} 
            color={category.color}
          />

          <GlassCard style={styles.questionCard}>
            <View style={[styles.diffBadge, { backgroundColor: `${category.color}20` }]}>
              <Text style={[styles.diffText, { color: category.color }]}>{currentQuestion.difficulty.toUpperCase()}</Text>
            </View>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </GlassCard>

          <View style={styles.optionsContainer}>
            {(currentQuestion?.options || []).map((option, index) => (
              <AnswerOption
                key={index}
                text={option}
                onPress={() => !isAnswered && handleAnswer(option)}
                isSelected={selectedOption === option}
                isCorrect={isAnswered && option === currentQuestion.correctAnswer}
                isWrong={isAnswered && selectedOption === option && option !== currentQuestion.correctAnswer}
                disabled={isAnswered}
              />
            ))}
          </View>
        </Animated.View>

        {isAnswered && (
          <View style={styles.footer}>
            <GlassCard style={[
              styles.explanationCard, 
              { borderColor: selectedOption === currentQuestion.correctAnswer ? COLORS.success + '40' : COLORS.error + '40' }
            ]}>
              <View style={styles.explanationHeader}>
                <MaterialCommunityIcons 
                  name={selectedOption === currentQuestion.correctAnswer ? "check-circle" : "alert-circle"} 
                  size={20} 
                  color={selectedOption === currentQuestion.correctAnswer ? COLORS.success : COLORS.error} 
                />
                <Text style={[
                  styles.explanationTitle, 
                  { color: selectedOption === currentQuestion.correctAnswer ? COLORS.success : COLORS.error }
                ]}>
                  {selectedOption === currentQuestion.correctAnswer ? 'TRANSMISSION_CLEARED' : 'SIGNAL_INTERFERENCE'}
                </Text>
              </View>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            </GlassCard>
            <NeonButton 
              title={currentQuestionIndex === questions.length - 1 ? "COMPLETE MISSION" : "PROCEED TO NEXT"} 
              onPress={handleNext}
              style={[styles.nextButton, { backgroundColor: category.color }]}
            />
          </View>
        )}
      </View>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  briefingHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconGlowContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  briefingTitle: {
    fontFamily: FONTS.black,
    fontSize: 26,
    marginTop: 16,
    letterSpacing: 2,
  },
  briefingCard: {
    width: '100%',
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  missionBriefTitle: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 4,
    marginBottom: 10,
  },
  briefingDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  briefInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  briefLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  briefValue: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.text,
  },
  briefingInstruction: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  launchButton: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  abortButton: {
    padding: SPACING.md,
  },
  abortText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  missionBrief: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 4,
    marginBottom: SPACING.sm,
  },
  countdownCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: SPACING.xxl,
  },
  countdownText: {
    fontFamily: FONTS.black,
    fontSize: 54,
    zIndex: 2,
  },
  countdownGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.1,
  },
  readyText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  bgIcon: {
    position: 'absolute',
    top: height * 0.1,
    right: -width * 0.2,
    zIndex: -1,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timerText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    marginLeft: 6,
  },
  fuelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: 22,
  },
  fuelRow: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  fuelBit: {
    width: 14,
    height: 5,
    borderRadius: 2,
    marginLeft: 3,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  missionProgress: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  questionCounter: {
    fontFamily: FONTS.black,
    fontSize: 16,
  },
  questionCard: {
    padding: SPACING.xl,
    marginVertical: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  diffBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  diffText: {
    fontFamily: FONTS.black,
    fontSize: 8,
    letterSpacing: 1,
  },
  questionText: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 32,
  },
  optionsContainer: {
    marginTop: SPACING.md,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  explanationCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  explanationTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    marginLeft: 8,
    letterSpacing: 1,
  },
  explanationText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  nextButton: {
    marginTop: SPACING.sm,
  },
});

export default QuizPlayScreen;
