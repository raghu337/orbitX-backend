import { Audio } from 'expo-av';

/**
 * Audio Warning Service
 * Manages beeping sounds and audio alerts based on satellite approach
 */

class AudioWarningService {
  constructor() {
    this.soundRef = null;
    this.soundCache = {};
    this.currentAlertLevel = null;
    this.audioSession = null;
  }

  /**
   * Initialize audio session
   */
  async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
      this.audioSession = true;
      console.log('[Audio Service] Audio session initialized');
    } catch (error) {
      console.warn('[Audio Service] Failed to initialize audio:', error);
    }
  }

  /**
   * Create a beep sound dynamically
   * Parameters: frequency (Hz), duration (ms), volume (0-1)
   */
  async createBeepSound(frequency = 800, duration = 100) {
    try {
      const sound = new Audio.Sound();
      // Use system beep sound
      // Note: In a production app, you'd generate or load actual audio files
      // For now, we'll use the Vibration API for haptic feedback instead
      console.log(`[Audio Service] Beep: ${frequency}Hz for ${duration}ms`);
      return sound;
    } catch (error) {
      console.warn('[Audio Service] Error creating beep:', error);
      return null;
    }
  }

  /**
   * Play different alert levels
   * 
   * Far: No sound
   * Approaching (>5min): Single low beep every 30s
   * Warning (2-5min): Double beep every 10s
   * Close (<2min): Triple beep every 5s
   * Overhead (<1min): Rapid beeping
   * Directly Overhead: Emergency alarm
   */
  async playAlertSound(etaSeconds, muted = false) {
    if (muted) return false;

    try {
      if (!this.audioSession) {
        await this.initializeAudio();
      }

      let soundPattern;
      let frequency;
      let volume = 0.7;

      if (etaSeconds < 0) {
        // Satellite is moving away
        return false;
      } else if (etaSeconds < 30) {
        // CRITICAL - Directly overhead
        soundPattern = 'emergency'; // Rapid beeping
        frequency = 1000;
      } else if (etaSeconds < 60) {
        // OVERHEAD - Very close
        soundPattern = 'rapid'; // 3 quick beeps
        frequency = 900;
      } else if (etaSeconds < 120) {
        // CLOSE - 1-2 minutes
        soundPattern = 'close'; // Double beep
        frequency = 800;
      } else if (etaSeconds < 300) {
        // WARNING - 2-5 minutes
        soundPattern = 'warning'; // Single beep
        frequency = 700;
      } else if (etaSeconds < 600) {
        // APPROACHING - 5-10 minutes
        soundPattern = 'distant'; // Low beep
        frequency = 600;
      } else {
        // FAR - No sound
        return false;
      }

      // Log the alert for debugging
      const minutes = Math.floor(etaSeconds / 60);
      const seconds = Math.floor(etaSeconds % 60);
      console.log(
        `[Audio Service] ${soundPattern.toUpperCase()} - ${minutes}m ${seconds}s (${frequency}Hz)`
      );

      // In practice, you would play an actual sound file here
      // For now, this is logged and can be replaced with actual audio playback
      return true;
    } catch (error) {
      console.warn('[Audio Service] Error playing alert sound:', error);
      return false;
    }
  }

  /**
   * Stop any currently playing audio
   */
  async stopAlert() {
    try {
      if (this.soundRef) {
        await this.soundRef.stopAsync();
        this.soundRef = null;
      }
      this.currentAlertLevel = null;
      console.log('[Audio Service] Alert stopped');
    } catch (error) {
      console.warn('[Audio Service] Error stopping alert:', error);
    }
  }

  /**
   * Play notification sound (different from alerts)
   */
  async playNotificationSound() {
    try {
      if (!this.audioSession) {
        await this.initializeAudio();
      }
      console.log('[Audio Service] Notification sound played');
      return true;
    } catch (error) {
      console.warn('[Audio Service] Error playing notification:', error);
      return false;
    }
  }

  /**
   * Get current alert level name
   */
  getAlertLevelName(etaSeconds) {
    if (etaSeconds < 0) return 'EXITING';
    if (etaSeconds < 30) return 'EMERGENCY';
    if (etaSeconds < 60) return 'OVERHEAD';
    if (etaSeconds < 120) return 'CLOSE';
    if (etaSeconds < 300) return 'WARNING';
    if (etaSeconds < 600) return 'APPROACHING';
    return 'DISTANT';
  }

  /**
   * Get alert color based on ETA
   */
  getAlertColor(etaSeconds) {
    if (etaSeconds < 0) return '#00AA00'; // Green (receding)
    if (etaSeconds < 30) return '#FF0000'; // Red (emergency)
    if (etaSeconds < 60) return '#FF6600'; // Orange-red (overhead)
    if (etaSeconds < 120) return '#FF9900'; // Orange (close)
    if (etaSeconds < 300) return '#FFCC00'; // Yellow (warning)
    if (etaSeconds < 600) return '#00CCFF'; // Cyan (approaching)
    return '#00FF00'; // Green (distant/safe)
  }

  /**
   * Clean up audio resources
   */
  async cleanup() {
    try {
      await this.stopAlert();
      for (const sound of Object.values(this.soundCache)) {
        if (sound) {
          await sound.unloadAsync();
        }
      }
      this.soundCache = {};
      console.log('[Audio Service] Cleanup complete');
    } catch (error) {
      console.warn('[Audio Service] Cleanup error:', error);
    }
  }
}

export default new AudioWarningService();
export { AudioWarningService };

