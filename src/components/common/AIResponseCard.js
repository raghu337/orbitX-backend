import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

/**
 * AIResponseCard Component
 * Displays enhanced AI responses with planetary information
 */
const AIResponseCard = ({
  response,
  planetName,
  topic,
  onExplorePlanet,
  onRelatedQuery,
}) => {
  if (!response) {
    return null;
  }

  const getPlanetEmoji = (name) => {
    const emojis = {
      Mercury: '☿️',
      Venus: '♀️',
      Earth: '♁️',
      Mars: '♂️',
      Jupiter: '♃️',
      Saturn: '♄️',
      Uranus: '♅️',
      Neptune: '♆️',
    };
    return emojis[name] || '🪐';
  };

  const getTopicIcon = (topic) => {
    const icons = {
      planets: 'earth',
      moons: 'moon-full',
      stars: 'star',
      galaxies: 'star-box',
      'black holes': 'circle',
      ISS: 'satellite-variant',
      'NASA missions': 'rocket',
      'space exploration': 'telescope',
    };
    return icons[topic] || 'help-circle';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(100, 150, 255, 0.2)', 'rgba(0, 217, 255, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header with topic */}
        {topic && (
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={getTopicIcon(topic)}
              size={16}
              color="#00D9FF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.topic}>{topic.toUpperCase()}</Text>
          </View>
        )}

        {/* Main response */}
        <Text style={styles.responseText}>{response}</Text>

        {/* Planet-specific card */}
        {planetName && (
          <TouchableOpacity
            style={styles.planetCard}
            onPress={() => onExplorePlanet?.(planetName)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(0, 217, 255, 0.2)', 'rgba(100, 150, 255, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.planetCardGradient}
            >
              <View style={styles.planetContent}>
                <Text style={styles.planetEmoji}>{getPlanetEmoji(planetName)}</Text>
                <View style={styles.planetInfo}>
                  <Text style={styles.planetName}>{planetName}</Text>
                  <Text style={styles.planetAction}>Tap to explore in detail →</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => onRelatedQuery?.()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={16}
              color="#00D9FF"
            />
            <Text style={styles.primaryButtonText}>Ask Follow-up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="content-copy"
              size={16}
              color="rgba(255, 255, 255, 0.6)"
            />
            <Text style={styles.secondaryButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 217, 255, 0.15)',
  },
  topic: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00D9FF',
    letterSpacing: 0.5,
  },
  responseText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 19,
    fontWeight: '500',
    marginBottom: 12,
  },
  planetCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  planetCardGradient: {
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    borderRadius: 12,
    padding: 12,
  },
  planetContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planetEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  planetInfo: {
    flex: 1,
  },
  planetName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  planetAction: {
    fontSize: 11,
    color: 'rgba(0, 217, 255, 0.8)',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  primaryButton: {
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  primaryButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00D9FF',
  },
  secondaryButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default AIResponseCard;
