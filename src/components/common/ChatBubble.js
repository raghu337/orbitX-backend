import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

/**
 * ChatBubble Component
 * Displays chat messages with different styles for user and AI
 */
const ChatBubble = ({ message, isUser = false, timestamp }) => {
  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer,
      ]}
    >
      {!isUser && (
        <View style={styles.avatarAI}>
          <Text style={styles.avatarText}>🤖</Text>
        </View>
      )}

      <LinearGradient
        colors={
          isUser
            ? ['rgba(0, 217, 255, 0.25)', 'rgba(0, 217, 255, 0.15)']
            : ['rgba(100, 150, 255, 0.2)', 'rgba(0, 217, 255, 0.1)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser && styles.userMessageText,
          ]}
        >
          {message}
        </Text>

        {timestamp && (
          <Text
            style={[
              styles.timestamp,
              isUser && styles.userTimestamp,
            ]}
          >
            {timestamp}
          </Text>
        )}
      </LinearGradient>

      {isUser && (
        <View style={styles.avatarUser}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    borderWidth: 1,
  },
  userBubble: {
    borderColor: 'rgba(0, 217, 255, 0.5)',
    marginLeft: 'auto',
  },
  aiBubble: {
    borderColor: 'rgba(100, 150, 255, 0.3)',
  },
  messageText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    fontWeight: '500',
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
    fontWeight: '400',
  },
  userTimestamp: {
    textAlign: 'right',
  },
  avatarAI: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarUser: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
});

export default ChatBubble;
