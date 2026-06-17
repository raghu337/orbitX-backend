import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AIResponseCard from '../components/common/AIResponseCard';
import ChatBubble from '../components/common/ChatBubble';
import SuggestedQuestions from '../components/common/SuggestedQuestions';
import { PLANETS_DATA } from '../data/planetsData';
import { SUGGESTED_SPACE_QUESTIONS } from '../data/spaceKnowledgeBase';
import SpaceAIService from '../services/SpaceAIService';

/**
 * Space Chat Screen
 * AI-powered space assistant with ChatGPT-like interface
 */
const SpaceChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [starPositions] = useState(generateStars());
  const flatListRef = useRef(null);
  const typingIndicatorAnim = useRef(new Animated.Value(0)).current;

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: '0',
      text: '👋 Welcome to the Space Assistant! I can answer questions about planets, moons, stars, galaxies, the ISS, NASA missions, and more. What would you like to know about space?',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages([welcomeMessage]);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Typing indicator animation
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingIndicatorAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(typingIndicatorAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  /**
   * Handle sending a message
   */
  const handleSendMessage = async (messageOverride = null) => {
    const textToUse = typeof messageOverride === 'string' ? messageOverride : inputText;
    const messageToSend = textToUse.trim();
    if (!messageToSend) return;

    const userMessage = {
      id: Date.now().toString(),
      text: messageToSend,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const result = await SpaceAIService.sendMessage(messageToSend);

      // Add AI message
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        topic: result.topic,
        planetName: result.planetName,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle suggested question selection
   */
  const handleSelectSuggestedQuestion = (question) => {
    setInputText(question);
    handleSendMessage(question);
  };

  const handleFollowUpQuery = (topic) => {
    const prompt = topic
      ? `Can you tell me more about ${topic} in space exploration?`
      : 'Can you provide a follow-up explanation?';
    handleSendMessage(prompt);
  };

  /**
   * Handle planet exploration
   */
  const handleExplorePlanet = (planetName) => {
    const planet = PLANETS_DATA.find((p) => p.name === planetName);
    if (planet) {
      navigation.navigate('PlanetDetail', { planetId: planet.id });
    }
  };

  /**
   * Clear chat history
   */
  const handleClearChat = () => {
    setMessages([
      {
        id: '0',
        text: '👋 Chat cleared! Ready for a fresh conversation about space.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    SpaceAIService.clearHistory();
  };

  /**
   * Render chat message
   */
  const renderMessage = ({ item }) => (
    <>
      <ChatBubble
        message={item.text}
        isUser={item.isUser}
        timestamp={item.timestamp}
      />

      {!item.isUser && (item.topic || item.planetName) && (
        <AIResponseCard
          response={item.text}
          topic={item.topic}
          planetName={item.planetName}
          onExplorePlanet={handleExplorePlanet}
          onRelatedQuery={() => handleFollowUpQuery(item.topic)}
        />
      )}
    </>
  );

  /**
   * Render list header (suggested questions)
   */
  const renderHeader = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      {messages.length === 1 && (
        <SuggestedQuestions
          questions={SUGGESTED_SPACE_QUESTIONS.slice(0, 6)}
          onSelectQuestion={handleSelectSuggestedQuestion}
        />
      )}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />

      {/* Starfield background */}
      <View style={styles.starsContainer} pointerEvents="none">
        {starPositions.map((star, index) => (
          <View
            key={index}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                opacity: star.opacity,
              },
            ]}
          />
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons
            name="robot-happy"
            size={28}
            color="#00D9FF"
            style={{ marginRight: 8 }}
          />
          <View>
            <Text style={styles.headerTitle}>Space Assistant</Text>
            <Text style={styles.headerSubtitle}>Powered by AI</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearChat}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={20}
            color="rgba(0, 217, 255, 0.7)"
          />
        </TouchableOpacity>
      </View>

      {/* Keyboard Avoiding Container */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Messages list */}
        <View style={styles.content}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="telescope"
                size={64}
                color="rgba(0, 217, 255, 0.3)"
              />
              <Text style={styles.emptyStateText}>Start exploring space!</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        />

        {/* Typing indicator */}
        {loading && (
          <View style={styles.typingContainer}>
            <View style={styles.typingDots}>
              <Animated.View
                style={[
                  styles.typingDot,
                  {
                    opacity: typingIndicatorAnim,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.typingDot,
                  {
                    opacity: typingIndicatorAnim,
                    marginHorizontal: 4,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.typingDot,
                  {
                    opacity: typingIndicatorAnim,
                  },
                ]}
              />
            </View>
          </View>
        )}
        </View>

        {/* Input area */}
        <View style={styles.inputContainer}>
        <LinearGradient
          colors={['rgba(0, 217, 255, 0.08)', 'rgba(100, 150, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.inputWrapper}
        >
          <TextInput
            style={styles.input}
            placeholder="Ask about planets, stars, space missions..."
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!loading}
            maxHeight={100}
          />
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={() => handleSendMessage()}
            disabled={loading || !inputText.trim()}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#00D9FF" />
            ) : (
              <MaterialCommunityIcons
                name="send"
                size={20}
                color={inputText.trim() ? '#00D9FF' : 'rgba(0, 217, 255, 0.4)'}
              />
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/**
 * Generate random star positions for background
 */
function generateStars(count = 50) {
  const stars = [];
  const { width, height } = require('react-native').Dimensions.get('window');
  
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      opacity: Math.random() * 0.7 + 0.3,
      size: Math.random() * 1.5 + 0.5,
    });
  }
  return stars;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0E27',
    pointerEvents: 'none',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 217, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(0, 217, 255, 0.7)',
    fontWeight: '500',
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 12,
    fontWeight: '500',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D9FF',
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 217, 255, 0.1)',
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default SpaceChatScreen;
