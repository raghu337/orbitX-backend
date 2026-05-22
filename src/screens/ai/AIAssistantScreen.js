import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

// Mock responses for chips
const MOCK_RESPONSES = {
  'What is a black hole?':
    'A black hole is a region of spacetime where gravity is so strong that nothing—not even light—can escape.',
  'Tell me about the ISS':
    'The International Space Station orbits Earth at an altitude of ~400 km and travels at ~7.66 km/s.',
  'How far is Mars?':
    'Mars is about 225 million km away from Earth on average, depending on orbital positions.',
  'What are neutron stars?':
    'Neutron stars are incredibly dense remnants of massive stars that have undergone supernova explosions.',
  'Give me a space fact':
    'Space is completely silent because there is no atmosphere to carry sound waves.',
};

const QUESTION_CHIPS = Object.keys(MOCK_RESPONSES);

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
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
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
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
  });

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, dotStyle(dot1)]} />
      <Animated.View style={[styles.typingDot, dotStyle(dot2)]} />
      <Animated.View style={[styles.typingDot, dotStyle(dot3)]} />
    </View>
  );
};

const AIAssistantScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'tutor',
      text: 'Hello Commander! I am your AI Space Tutor. How can I assist you with your mission today?',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const addUserMessage = (text) => {
    const userMsg = { id: Date.now().toString(), type: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      const reply = {
        id: (Date.now() + 1).toString(),
        type: 'tutor',
        text: MOCK_RESPONSES[text] || "I'm here to help! Ask me anything about space.",
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 1200);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isTyping]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.text} />
        </TouchableOpacity>
        <MaterialCommunityIcons name="robot-outline" size={28} color={COLORS.warning} />
        <Text style={styles.headerTitle}>AI Space Tutor</Text>
      </View>

      {/* Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
      >
        {(QUESTION_CHIPS || []).map((chip) => (
          <TouchableOpacity key={chip} style={styles.chip} onPress={() => addUserMessage(chip)} activeOpacity={0.7}>
            <Text style={styles.chipText}>{chip}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chat */}
      <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent} ref={scrollRef}>
        {(messages || []).map((msg) => (
          <View key={msg.id} style={[styles.messageWrapper, msg.type === 'user' ? styles.messageUser : styles.messageTutor]}>
            {msg.type === 'tutor' && (
              <View style={styles.avatarContainer}>
                <MaterialCommunityIcons name="robot-outline" size={20} color={COLORS.warning} />
              </View>
            )}
            <View style={[styles.bubble, msg.type === 'user' ? styles.bubbleUser : styles.bubbleTutor]}>
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          </View>
        ))}
        {isTyping && <TypingIndicator />}
      </ScrollView>

      {/* Input – disabled static UI */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask me about the cosmos..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            editable={false}
          />
          <TouchableOpacity style={styles.sendButton} disabled={true}>
            <MaterialCommunityIcons name="send-outline" size={20} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backButton: { marginRight: SPACING.sm },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.text, marginLeft: SPACING.sm, letterSpacing: 1 },
  chipContainer: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  chip: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, marginRight: SPACING.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chipText: { color: COLORS.text, fontFamily: FONTS.medium },
  chatContainer: { flex: 1 },
  chatContent: { padding: SPACING.md },
  messageWrapper: { flexDirection: 'row', marginBottom: SPACING.lg, alignItems: 'flex-end' },
  messageUser: { justifyContent: 'flex-end' },
  messageTutor: { justifyContent: 'flex-start' },
  avatarContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,193,7,0.15)', borderWidth: 1, borderColor: 'rgba(255,193,7,0.3)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm },
  bubble: { maxWidth: '75%', padding: SPACING.md, borderRadius: 20 },
  bubbleUser: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleTutor: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderBottomLeftRadius: 4 },
  messageText: { fontFamily: FONTS.regular, fontSize: 15, color: COLORS.text, lineHeight: 22 },
  inputContainer: { padding: SPACING.md, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  inputWrapper: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingLeft: SPACING.lg, paddingRight: 4, alignItems: 'center' },
  input: { flex: 1, height: 50, color: COLORS.text, fontFamily: FONTS.regular, fontSize: 15 },
  sendButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.warning, justifyContent: 'center', alignItems: 'center' },
  typingContainer: { flexDirection: 'row', marginLeft: SPACING.sm, marginTop: SPACING.sm },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.text, marginRight: 5 },
});

export default AIAssistantScreen;
