import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ChatBubble from '../../components/common/ChatBubble';
import SpaceAIService from '../../services/SpaceAIService';
import { FONTS, SPACING } from '../../theme/theme';

const SpaceFactsScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Checking AI status...');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [connectionOnline, setConnectionOnline] = useState(false);
  const [connectionBaseUrl, setConnectionBaseUrl] = useState('');
  const [connectionEnvironment, setConnectionEnvironment] = useState('Unknown');
  const [connectionNetworkStatus, setConnectionNetworkStatus] = useState('Unknown');
  const [connectionResult, setConnectionResult] = useState('Pending');
  const [starPositions] = useState(generateStars());
  const flatListRef = useRef(null);
  const typingIndicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      text: '👋 Welcome to Space Assistant! Type any space-related question and I’ll answer with an AI-powered response.',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [messages]);

  const refreshConnectionStatus = async () => {
    const status = await SpaceAIService.checkConnection();
    setConnectionOnline(status.online);
    setConnectionStatus(status.online ? 'AI Online' : 'AI Offline');
    setConnectionMessage(status.message);
    setConnectionBaseUrl(status.details?.baseUrl || 'Not configured');
    setConnectionEnvironment(status.details?.environment || 'Unknown');
    setConnectionNetworkStatus(status.details?.networkStatus || 'Unknown');
    setConnectionResult(status.connectionResult || 'Unknown');
  };

  useEffect(() => {
    refreshConnectionStatus();
  }, []);

  const buildFriendlyErrorMessage = (error) => {
    const message = error?.message || '';
    const normalized = message.toLowerCase();
    const isConnectionProblem =
      normalized.includes('timed out') ||
      normalized.includes('unable to resolve') ||
      normalized.includes('connection failed') ||
      normalized.includes('network request failed') ||
      normalized.includes('failed to fetch');

    if (isConnectionProblem) {
      return 'Unable to connect to Space AI. Please ensure Ollama is running on your computer.';
    }

    if (normalized.includes('model')) {
      return 'Unable to connect to Space AI. Please ensure the correct Ollama model is installed.';
    }

    return 'Unable to connect to Space AI. Please ensure Ollama is running on your computer.';
  };

  useEffect(() => {
    let animation;
    if (loading) {
      animation = Animated.loop(
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
      );
      animation.start();
    }
    return () => animation?.stop();
  }, [loading, typingIndicatorAnim]);

  const handleSendMessage = async () => {
    const messageToSend = inputText.trim();
    if (!messageToSend) return;

    const userMessage = {
      id: `${Date.now()}-user`,
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
      const status = await SpaceAIService.checkConnection();
      setConnectionOnline(status.online);
      setConnectionStatus(status.online ? 'AI Online' : 'AI Offline');
      setConnectionMessage(status.message);
      setConnectionBaseUrl(status.details?.baseUrl || 'Not configured');
      setConnectionEnvironment(status.details?.environment || 'Unknown');
      setConnectionNetworkStatus(status.details?.networkStatus || 'Unknown');
      setConnectionResult(status.connectionResult || 'Unknown');

      if (!status.online) {
        throw new Error(status.message);
      }

      const result = await SpaceAIService.sendMessage(messageToSend);
      const aiMessage = {
        id: `${Date.now()}-ai`,
        text: result.response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: `${Date.now()}-error`,
        text: buildFriendlyErrorMessage(error),
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

  const handleClearChat = () => {
    const welcomeMessage = {
      id: 'welcome',
      text: '👋 Welcome to Space Assistant! Type any space-related question and I’ll answer with an AI-powered response.',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages([welcomeMessage]);
    SpaceAIService.clearHistory();
  };

  const renderMessage = ({ item }) => (
    <View style={styles.messageBlock}>
      <ChatBubble
        message={item.text}
        isUser={item.isUser}
        timestamp={item.timestamp}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020519" />

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
                width: star.size,
                height: star.size,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.header}>
        {navigation.canGoBack() ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Space Assistant</Text>
          <Text style={styles.headerSubtitle}>Ask the cosmos anything</Text>
          <View style={styles.connectionRow}>
            <View style={[styles.statusDot, { backgroundColor: connectionOnline ? '#2EFFD5' : '#FF7171' }]} />
            <Text style={styles.statusLabel}>{connectionStatus}</Text>
          </View>
          {connectionMessage ? <Text style={styles.connectionMessage}>{connectionMessage}</Text> : null}
          <Text style={styles.connectionDetail}>Base URL: {connectionBaseUrl}</Text>
          <Text style={styles.connectionDetail}>Platform: {connectionEnvironment}</Text>
          <Text style={styles.connectionDetail}>Network: {connectionNetworkStatus}</Text>
          <Text style={styles.connectionDetail}>Result: {connectionResult}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshConnectionStatus}>
            <Text style={styles.retryButtonText}>Refresh Connection</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearChat}>
          <MaterialCommunityIcons name="delete-outline" size={22} color="#00E5FF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        />

        {loading && (
          <View style={styles.typingContainer}>
            <Animated.View style={[styles.typingDot, { opacity: typingIndicatorAnim }]} />
            <Animated.View style={[styles.typingDot, { opacity: typingIndicatorAnim, marginHorizontal: 6 }]} />
            <Animated.View style={[styles.typingDot, { opacity: typingIndicatorAnim }]} />
            <Text style={styles.typingText}>Space Assistant is thinking...</Text>
          </View>
        )}
      </KeyboardAvoidingView>

      <View style={styles.inputContainer}>
        <LinearGradient
          colors={['rgba(0, 217, 255, 0.12)', 'rgba(13, 22, 62, 0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.inputWrapper}
        >
          <TextInput
            style={styles.input}
            placeholder="Ask a space question..."
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={inputText}
            onChangeText={setInputText}
            editable={!loading}
            multiline
            maxLength={280}
          />
          <TouchableOpacity
            style={[styles.sendButton, (loading || !inputText.trim()) && styles.sendButtonDisabled]}
            onPress={() => handleSendMessage()}
            disabled={loading || !inputText.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#00E5FF" />
            ) : (
              <MaterialCommunityIcons name="send" size={22} color="#00E5FF" />
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

function generateStars(count = 45) {
  const { width, height } = Dimensions.get('window');
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      opacity: Math.random() * 0.8 + 0.2,
      size: Math.random() * 2 + 1,
    });
  }
  return stars;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020519',
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020519',
  },
  star: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  clearButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 217, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  chatContent: {
    paddingBottom: 16,
    paddingTop: 8,
  },
  messageBlock: {
    paddingHorizontal: 4,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E5FF',
  },
  typingText: {
    marginLeft: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  inputContainer: {
    padding: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.18)',
    borderRadius: 18,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(1, 7, 25, 0.88)',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: FONTS.regular,
    fontSize: 14,
    paddingVertical: 10,
    maxHeight: 100,
  },
  titleContainer: {
    flex: 1,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    color: '#B8EAFF',
    fontSize: 12,
  },
  connectionMessage: {
    marginTop: 6,
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    lineHeight: 16,
  },
  connectionDetail: {
    marginTop: 3,
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 10,
    lineHeight: 14,
  },
  retryButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.35)',
  },
  retryButtonText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '600',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});

export default SpaceFactsScreen;
