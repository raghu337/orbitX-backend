import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { BASE_URL } from './api/orbitxApi';

const DEFAULT_CHECK_TIMEOUT_MS = 7000;
const DEFAULT_REQUEST_TIMEOUT_MS = 25000;
const LOG_PREFIX = '[SpaceAIService]';

class SpaceAIService {
  constructor() {
    this.conversationHistory = [];
  }

  getNetworkStatus() {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine ? 'Online' : 'Offline';
    }
    return 'Unknown';
  }

  getEnvironmentLabel() {
    try {
      if (Platform.OS === 'web') {
        return 'Web';
      }
      const appOwnership = Constants?.appOwnership || Constants?.expoConfig?.extra?.appOwnership;
      if (appOwnership === 'expo') {
        return 'Expo Go';
      }
      const isDevice = Device ? Device.isDevice : false;
      if (Platform.OS === 'android') {
        return isDevice ? 'Physical Android Device' : 'Android Emulator';
      }
      if (Platform.OS === 'ios') {
        return isDevice ? 'Physical iOS Device' : 'iOS Simulator';
      }
      return 'Native Device';
    } catch {
      return 'Unknown Device';
    }
  }

  getComputedBaseUrl() {
    return BASE_URL;
  }

  async timedFetch(url, options = {}, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const mergedOptions = { ...options };
    if (controller) {
      mergedOptions.signal = controller.signal;
    }

    const timeoutPromise = new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        if (controller) {
          controller.abort();
        }
        reject(new Error('Request timed out.'));
      }, timeoutMs);
      if (controller) {
        controller.signal.addEventListener('abort', () => clearTimeout(timeoutId));
      }
    });

    return Promise.race([fetch(url, mergedOptions), timeoutPromise]);
  }

  async checkConnection() {
    const environment = this.getEnvironmentLabel();
    const networkStatus = this.getNetworkStatus();
    const baseUrl = this.getComputedBaseUrl();
    const details = {
      environment,
      networkStatus,
      baseUrl,
    };

    try {
      // Ping FastAPI backend health endpoint
      const healthUrl = `${baseUrl.replace('/api/v1', '')}/health`;
      console.log(`${LOG_PREFIX} Pinging health endpoint: ${healthUrl}`);
      
      const response = await this.timedFetch(healthUrl, { method: 'GET' }, DEFAULT_CHECK_TIMEOUT_MS);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const message = `Space AI is online at ${baseUrl}`;
      console.log(`${LOG_PREFIX} ${message}`);
      return {
        online: true,
        message,
        details,
        connectionResult: 'AI Online',
      };
    } catch (error) {
      const message = `Space AI connection failed at ${baseUrl}: ${error.message}`;
      console.warn(`${LOG_PREFIX} ${message}`);
      return {
        online: false,
        message,
        details,
        connectionResult: 'AI Offline',
      };
    }
  }

  async sendMessage(userMessage) {
    const trimmedMessage = userMessage?.trim();
    if (!trimmedMessage) {
      throw new Error('Please type a space question before sending.');
    }

    const status = await this.checkConnection();
    if (!status.online) {
      console.log(`${LOG_PREFIX} Connection offline. Returning mock response.`);
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate realistic network delay
      
      const mockReply = this.getMockResponse(trimmedMessage);
      this.conversationHistory.push({ role: 'user', content: trimmedMessage });
      this.conversationHistory.push({ role: 'assistant', content: mockReply.response });
      
      return {
        success: true,
        response: mockReply.response,
      };
    }

    this.conversationHistory.push({ role: 'user', content: trimmedMessage });
    const historySlice = this.conversationHistory
      .slice(-10)
      .map((msg) => ({ role: msg.role, content: msg.content }));

    const chatUrl = `${BASE_URL}/chat`;
    console.log(`${LOG_PREFIX} Sending message to backend: ${chatUrl}`);

    try {
      const response = await this.timedFetch(
        chatUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: trimmedMessage,
            history: historySlice,
          }),
        },
        DEFAULT_REQUEST_TIMEOUT_MS
      );

      if (!response.ok) {
        const errText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const text = data.response;
      if (!text) {
        throw new Error('Backend did not return a response.');
      }

      this.conversationHistory.push({ role: 'assistant', content: text });
      return {
        success: true,
        response: text,
      };
    } catch (err) {
      console.warn(`${LOG_PREFIX} Request failed: ${err.message}. Falling back to mock response.`);
      // If request fails due to server issue, fall back to offline simulation
      const mockReply = this.getMockResponse(trimmedMessage);
      this.conversationHistory.push({ role: 'assistant', content: mockReply.response });
      return {
        success: true,
        response: mockReply.response,
      };
    }
  }

  getMockResponse(userMessage) {
    const msg = (userMessage || '').toLowerCase();
    
    if (msg.includes('black hole')) {
      return {
        response: "Commander, a black hole is a region of spacetime where gravity is so strong that nothing—not even light—can escape. It is formed when a massive star collapses at the end of its life cycle.\n\nThe boundary of a black hole is called the event horizon. Once anything crosses this boundary, it cannot escape. In the center of a black hole lies a singularity, where matter is crushed to infinite density. Would you like to know more about how we detect them, Commander?",
        model: "offline-tutor-sim",
      };
    }

    if (msg.includes('earth') || msg.includes('world') || msg.includes('home')) {
      return {
        response: "Earth, our home world, is the third planet from the Sun and the only astronomical object known to harbor life, Commander.\n\nAbout 71% of Earth's surface is covered with liquid water oceans, and it has a robust nitrogen-oxygen atmosphere that protects us from solar radiation. Earth is also equipped with a powerful magnetosphere generated by its rotating liquid iron outer core. It has exactly one natural satellite, Luna (the Moon).",
        model: "offline-tutor-sim",
      };
    }

    if (msg.includes('iss') || msg.includes('space station')) {
      return {
        response: "The International Space Station (ISS) is a modular space station in low Earth orbit. It is a collaborative project between NASA, Roscosmos, JAXA, ESA, and CSA, Commander.\n\nIt travels at a speed of about 27,600 km/h (17,100 mph), orbiting the Earth every 90 minutes! It serves as a microgravity and space environment research laboratory where crew members conduct experiments in biology, physics, and astronomy.",
        model: "offline-tutor-sim",
      };
    }

    if (msg.includes('mars') || msg.includes('red planet')) {
      return {
        response: "Mars, the Red Planet, is the fourth planet from the Sun and the second-smallest planet in the Solar System, Commander.\n\nIt has a thin carbon dioxide atmosphere and features giant volcanoes like Olympus Mons and vast canyons like Valles Marineris. Scientists are actively searching for signs of ancient microbial life there using robotic rovers. It has two tiny moons: Phobos and Deimos.",
        model: "offline-tutor-sim",
      };
    }

    if (msg.includes('neutron') || msg.includes('pulsar')) {
      return {
        response: "Commander, a neutron star is the collapsed core of a massive supergiant star. They are the smallest and densest known class of stellar objects, with a mass of about 1.4 Suns but a radius of only 10 kilometers!\n\nA single teaspoon of neutron star material would weigh about 6 billion tons on Earth. Fast-rotating neutron stars with strong magnetic fields are called Pulsars, and they emit beams of electromagnetic radiation.",
        model: "offline-tutor-sim",
      };
    }

    if (msg.includes('fact')) {
      const facts = [
        "One day on Venus is longer than one year on Venus! It takes 243 Earth days to rotate once on its axis, but only 225 Earth days to travel around the Sun.",
        "Neutron stars are so dense that a single teaspoon of their material would weigh about 6 billion tons!",
        "Space is completely silent because there is no atmosphere for sound waves to travel through.",
        "The footprints left by Apollo astronauts on the Moon will probably stay there for at least 100 million years because there is no wind or water to wash them away.",
        "The Sun accounts for 99.86% of the mass in our entire solar system!"
      ];
      const idx = Math.floor(Math.random() * facts.length);
      return {
        response: `Here is a space fact for you, Commander: ${facts[idx]}`,
        model: "offline-tutor-sim",
      };
    }

    return {
      response: `Commander, I received your message: "${userMessage}".\n\nI am currently running in Offline Simulation Mode because the FastAPI backend server is unreachable. To get full AI capabilities, please start the backend server by running the launch scripts (LAUNCH_ORBITX.bat) and ensure your devices are connected to the same network.\n\nIn the meantime, feel free to ask me about black holes, the ISS, Mars, neutron stars, or ask for a space fact!`,
      model: "offline-tutor-sim",
    };
  }

  async checkOllamaAvailability() {
    const status = await this.checkConnection();
    return status.online;
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  setModel(modelName) {
    // Kept for signature compatibility
  }
}

export default new SpaceAIService();
