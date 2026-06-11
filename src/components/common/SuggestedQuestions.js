import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

/**
 * SuggestedQuestions Component
 * Displays suggested space questions for quick access
 */
const SuggestedQuestions = ({ questions = [], onSelectQuestion }) => {
  if (!questions || questions.length === 0) {
    return null;
  }

  const renderQuestion = ({ item }) => (
    <TouchableOpacity
      style={styles.questionContainer}
      onPress={() => onSelectQuestion?.(item)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['rgba(0, 217, 255, 0.15)', 'rgba(100, 150, 255, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.questionButton}
      >
        <Text style={styles.questionText}>{item}</Text>
        <MaterialCommunityIcons
          name="arrow-right"
          size={16}
          color="rgba(0, 217, 255, 0.8)"
        />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suggested Questions</Text>
      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={false}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  questionContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  questionButton: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
});

export default SuggestedQuestions;
