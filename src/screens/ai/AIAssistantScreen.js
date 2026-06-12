import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import GroqChatService from '../../services/GroqChatService';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

// Quick-access question chips for one-tap sending
const QUESTION_CHIPS = [
  'What is a black hole?',
  'Tell me about the ISS',
  'How far is Mars?',
  'What are neutron stars?',
  'Give me a space fact',
];

// ─── Premium Typing Indicator ──────────────────────────────────
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (anim) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    
    bounce(dot1);
    const t2 = setTimeout(() => bounce(dot2), 150);
    const t3 = setTimeout(() => bounce(dot3), 300);
    
    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const dotStyle = (anim) => ({
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
    transform: [{
      translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }),
    }],
  });

  return (
    <View style={styles.messageWrapper}>
      <View style={styles.avatarContainer}>
        <MaterialCommunityIcons name="robot-outline" size={18} color={COLORS.primary} />
      </View>
      <View style={[styles.bubble, styles.bubbleTutor, styles.typingBubble]}>
        <Animated.View style={[styles.typingDot, dotStyle(dot1)]} />
        <Animated.View style={[styles.typingDot, dotStyle(dot2)]} />
        <Animated.View style={[styles.typingDot, dotStyle(dot3)]} />
      </View>
    </View>
  );
};

// ─── Main AIAssistantScreen ────────────────────────────────────
const AIAssistantScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'tutor',
      text: 'Greetings, Commander. I am your AI Space Tutor. Ask me any question about the cosmos, planets, rockets, or the mysteries of space.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorState, setErrorState] = useState(null); // { message: string, lastAttemptedText: string }
  const scrollRef = useRef(null);

  // Send a message (can override text for retry or quick chips)
  const handleSend = async (overrideText) => {
    const text = (overrideText || inputText || '').trim();
    if (!text || isTyping) return;

    // Reset error state on new send
    setErrorState(null);

    // Add user message to state
    const userMsg = { id: Date.now().toString(), type: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      console.log(`[AIAssistantScreen] Sending message: "${text}"`);
      const result = await GroqChatService.sendMessage(text);
      
      const tutorMsg = {
        id: (Date.now() + 1).toString(),
        type: 'tutor',
        text: result.response,
      };
      setMessages((prev) => [...prev, tutorMsg]);
    } catch (error) {
      console.warn(`[AIAssistantScreen] Message send failed:`, error);
      setErrorState({
        message: error.message || 'Connection failed. Please verify the backend is running.',
        lastAttemptedText: text,
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Re-trigger sending the last failed message
  const handleRetry = () => {
    if (errorState) {
      const textToRetry = errorState.lastAttemptedText;
      setErrorState(null);
      handleSend(textToRetry);
    }
  };

  // Clear conversation state
  const handleClear = () => {
    GroqChatService.clearHistory();
    setErrorState(null);
    setMessages([
      {
        id: Date.now().toString(),
        type: 'tutor',
        text: 'System log cleared. I am ready for new cosmic directives, Commander.',
      },
    ]);
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping, errorState]);

  return (
    <LinearGradient
      colors={[COLORS.background, '#0C0A24', '#040714']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {navigation.canGoBack() ? (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
                <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.text} />
              </TouchableOpacity>
            ) : null}
            <View style={styles.robotHeaderIcon}>
              <MaterialCommunityIcons name="robot-outline" size={22} color={COLORS.primary} />
              <View style={styles.statusDot} />
            </View>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>AI Space Tutor</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton} activeOpacity={0.7}>
            <MaterialCommunityIcons name="delete-sweep-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Question Chips */}
        <View style={styles.chipWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipContainer}
          >
            {QUESTION_CHIPS.map((chip) => (
              <TouchableOpacity
                key={chip}
                style={styles.chip}
                onPress={() => handleSend(chip)}
                activeOpacity={0.65}
                disabled={isTyping}
              >
                <LinearGradient
                  colors={['rgba(0, 229, 255, 0.05)', 'rgba(0, 229, 255, 0.12)']}
                  style={styles.chipGradient}
                >
                  <MaterialCommunityIcons name="help-circle-outline" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.chipText}>{chip}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chat Feed */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageWrapper,
                  msg.type === 'user' ? styles.messageUser : styles.messageTutor,
                ]}
              >
                {msg.type === 'tutor' && (
                  <View style={styles.avatarContainer}>
                    <MaterialCommunityIcons name="robot-outline" size={18} color={COLORS.primary} />
                  </View>
                )}
                
                {msg.type === 'user' ? (
                  <LinearGradient
                    colors={['#0099FF', '#00E5FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.bubble, styles.bubbleUser]}
                  >
                    <Text style={styles.messageTextUser}>{msg.text}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.bubble, styles.bubbleTutor]}>
                    <Text style={styles.messageTextTutor}>{msg.text}</Text>
                  </View>
                )}
              </View>
            ))}

            {isTyping && <TypingIndicator />}

            {/* Premium non-intrusive error banner inside the feed */}
            {errorState && (
              <View style={styles.errorBanner}>
                <View style={styles.errorHeader}>
                  <MaterialCommunityIcons name="wifi-strength-1-alert" size={20} color={COLORS.error} />
                  <Text style={styles.errorTitle}>Connection Interrupted</Text>
                </View>
                <Text style={styles.errorText}>{errorState.message}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.7}>
                  <MaterialCommunityIcons name="refresh" size={16} color={COLORS.background} style={{ marginRight: 6 }} />
                  <Text style={styles.retryButtonText}>Retry Directive</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Floating Input Container */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ask about the cosmos..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={inputText}
                onChangeText={setInputText}
                editable={!isTyping}
                multiline
                maxLength={2000}
                returnKeyType="send"
                onSubmitEditing={() => handleSend()}
                blurOnSubmit
              />
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.sendDisabled]}
                onPress={() => handleSend()}
                disabled={!inputText.trim() || isTyping}
                activeOpacity={0.8}
              >
                {isTyping ? (
                  <ActivityIndicator size="small" color="#040714" />
                ) : (
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={26}
                    color="#040714"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// ─── Premium Stylesheet ────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: SPACING.xs },
  robotHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
    borderWidth: 1.5,
    borderColor: '#040714',
  },
  headerTitleContainer: { marginLeft: SPACING.sm },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 19,
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  clearButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: SPACING.sm,
  },
  chipContainer: { paddingHorizontal: SPACING.md },
  chip: {
    marginRight: SPACING.sm,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  chipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 3,
  },
  chipText: {
    color: COLORS.text,
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  chatContainer: { flex: 1 },
  chatContent: { padding: SPACING.md, paddingBottom: 30 },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  messageUser: { justifyContent: 'flex-end' },
  messageTutor: { justifyContent: 'flex-start' },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 20,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  bubbleTutor: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomLeftRadius: 4,
  },
  messageTextUser: {
    fontFamily: FONTS.regular,
    fontSize: 14.5,
    color: '#040714',
    lineHeight: 21,
    fontWeight: '600',
  },
  messageTextTutor: {
    fontFamily: FONTS.regular,
    fontSize: 14.5,
    color: COLORS.text,
    lineHeight: 22.5,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginHorizontal: 3,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 51, 102, 0.08)',
    borderColor: 'rgba(255, 51, 102, 0.25)',
    borderWidth: 1,
    borderRadius: 16,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  errorTitle: {
    fontFamily: FONTS.bold,
    color: COLORS.error,
    fontSize: 14,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  errorText: {
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
  },
  retryButtonText: {
    fontFamily: FONTS.bold,
    color: COLORS.background,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  inputContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 25, 45, 0.75)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingLeft: SPACING.md,
    paddingRight: 4,
    alignItems: 'center',
    height: 54,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: 14.5,
    paddingVertical: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  sendDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default AIAssistantScreen;
