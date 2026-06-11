import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';

/**
 * Glassmorphism card component with frosted glass effect
 * Used for UI panels and information displays
 */
export const GlassmorphismCard = ({
  children,
  style,
  intensity = 80,
  glowColor = '#00e5ff',
  glowIntensity = 0.5,
  borderRadius = 16,
}) => {
  return (
    <View style={[styles.container, { borderRadius }, style]}>
      {/* Glow effect background */}
      <View
        style={[
          styles.glowLayer,
          {
            borderRadius,
            shadowColor: glowColor,
            shadowOpacity: glowIntensity,
            borderColor: glowColor,
          },
        ]}
      />

      {/* Blur layer */}
      <BlurView intensity={intensity} style={[styles.blurLayer, { borderRadius }]}>
        {/* Glass shine effect */}
        <View style={[styles.shineLayer, { borderRadius }]} />

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  blurLayer: {
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 20, 40, 0.4)',
  },
  shineLayer: {
    ...StyleSheet.absoluteFillObject,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
    pointerEvents: 'none',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
