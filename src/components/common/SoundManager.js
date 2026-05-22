import { Audio } from 'expo-av';

class SoundManager {
  constructor() {
    this.sounds = {};
  }

  async playSound(name) {
    try {
      // Logic for loading and playing sounds from assets
      // For now, this is a placeholder interface for the UI components
      console.log(`Playing sound: ${name}`);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Preload common sounds
  async init() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.error('SoundManager Init Error:', error);
    }
  }
}

export default new SoundManager();
