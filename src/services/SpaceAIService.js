import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { BASE_URL, BACKEND_URL } from './api/orbitxApi';

const DEFAULT_CHECK_TIMEOUT_MS = 12000;
const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
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
      
      const response = await this.timedFetch(
        healthUrl,
        {
          method: 'GET',
          headers: {
            'bypass-tunnel-reminder': 'true'
          }
        },
        DEFAULT_CHECK_TIMEOUT_MS
      );
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
      let diagnosticMessage = error.message;
      if (error.message.includes('timed out') || error.message.includes('timeout')) {
        diagnosticMessage = 'Connection attempt timed out. The server might be slow or offline.';
      } else if (error.message.includes('Network') || error.name === 'TypeError') {
        diagnosticMessage = 'Network connection failed. Verify the backend is running at the configured IP and port 8000, and firewall rule is active.';
      }
      
      const message = `Space AI connection failed at ${baseUrl}: ${diagnosticMessage}`;
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

    this.conversationHistory.push({ role: 'user', content: trimmedMessage });
    const historySlice = this.conversationHistory
      .slice(-10)
      .map((msg) => ({ role: msg.role, content: msg.content }));

    // Target the secure public ngrok tunnel URL for the assistant search endpoint
    const searchUrl = `${BACKEND_URL}/api/search`;
    console.log(`${LOG_PREFIX} Querying Space Assistant search endpoint: ${searchUrl}`);

    try {
      const response = await this.timedFetch(
        searchUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'bypass-tunnel-reminder': 'true',
          },
          body: JSON.stringify({
            query: trimmedMessage,
            history: historySlice,
          }),
        },
        10000 // Flexible 10-second timeout configuration to prevent premature handshake drops
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        const customError = new Error(`HTTP ${response.status}`);
        customError.response = {
          status: response.status,
          data: errorText,
        };
        throw customError;
      }

      const data = await response.json();
      const text = data.response || data.results || data.text;
      if (!text) {
        throw new Error('Backend did not return a response.');
      }

      this.conversationHistory.push({ role: 'assistant', content: text });
      return {
        success: true,
        response: text,
      };
    } catch (error) {
      // Set request/response mock structure to support diagnostics for native fetch errors
      if (!error.response && (error.message.includes('Network') || error.message.includes('timeout') || error.message.includes('timed out') || error.name === 'TypeError')) {
        error.request = {};
      }

      console.log("❌ [SPACE AI SEARCH ERROR]:", error.message);
      if (error.response) {
        console.log("🔍 Server Response Data:", error.response.data);
        console.log("🔍 Server Response Status:", error.response.status);
      } else if (error.request) {
        console.log(`🔍 No Response Received. Check if the backend FastAPI server is running locally and the local IP address at ${BACKEND_URL} is reachable.`);
      }

      console.warn(`${LOG_PREFIX} Server request failed: ${error.message}. Using local space knowledge fallback.`);
      
      // Use the rich local getMockResponse() instead of a bare error string
      const mockResult = this.getMockResponse(trimmedMessage);
      const fallbackText = mockResult.response;

      this.conversationHistory.push({ role: 'assistant', content: fallbackText });
      
      // Attempt to extract topic and planetName for rich AI card rendering
      let topic = null;
      let planetName = null;
      try {
        const { detectSpaceTopic, extractPlanetName } = require('../data/spaceKnowledgeBase');
        topic = detectSpaceTopic(trimmedMessage);
        planetName = extractPlanetName(trimmedMessage);
      } catch (e) {
        console.warn("Could not import spaceKnowledgeBase helpers for offline rendering:", e);
      }

      return {
        success: true,
        response: fallbackText,
        topic,
        planetName,
      };
    }
  }

  getMockResponse(userMessage) {
    const msg = (userMessage || '').toLowerCase();
    
    // Import databases dynamically
    let OFFLINE_SUBJECTS = {};
    let OFFLINE_GENERAL_QA = {};
    try {
      const db = require('../data/offlineSpaceDatabase');
      OFFLINE_SUBJECTS = db.OFFLINE_SUBJECTS;
      OFFLINE_GENERAL_QA = db.OFFLINE_GENERAL_QA;
    } catch (e) {
      console.warn("Could not load offlineSpaceDatabase:", e);
    }

    // Helper functions to detect subject and aspect
    const detectSubject = (text) => {
      if (text.includes('mercury')) return 'mercury';
      if (text.includes('venus')) return 'venus';
      if (text.includes('earth') || text.includes('world') || text.includes('home')) return 'earth';
      if (text.includes('mars') || text.includes('red planet')) return 'mars';
      if (text.includes('jupiter')) return 'jupiter';
      if (text.includes('saturn')) return 'saturn';
      if (text.includes('uranus')) return 'uranus';
      if (text.includes('neptune')) return 'neptune';
      if (text.includes('sun') || text.includes('solar core')) return 'sun';
      if (text.includes('moon') || text.includes('luna')) return 'moon';
      if (text.includes('black hole') || text.includes('singularity') || text.includes('event horizon')) return 'black_hole';
      if (text.includes('neutron star') || text.includes('pulsar')) return 'neutron_star';
      if (text.includes('nebula') || text.includes('nebulae') || text.includes('orion nebula') || text.includes('crab nebula')) return 'nebula';
      if (text.includes('galaxy') || text.includes('galaxies') || text.includes('milky way') || text.includes('andromeda')) return 'galaxy';
      if (text.includes('iss') || text.includes('space station')) return 'iss';
      if (text.includes('hubble')) return 'hubble';
      if (text.includes('james webb') || text.includes('jwst') || text.includes('webb telescope')) return 'jwst';
      if (text.includes('asteroid') || text.includes('comet') || text.includes('meteor') || text.includes('dinosaur') || text.includes('extinction')) return 'asteroid';
      return null;
    };

    const detectAspect = (text) => {
      if (text.includes('atmosphere') || text.includes(' air') || text.includes(' gas') || text.includes('oxygen') || text.includes('co2')) return 'atmosphere';
      if (text.includes('temp') || text.includes('hot') || text.includes('cold') || text.includes('weather') || text.includes('degree') || text.includes('celsius') || text.includes('fahrenheit')) return 'temperature';
      if (text.includes('size') || text.includes('diameter') || text.includes('radius') || text.includes('mass') || text.includes('big') || text.includes('large') || text.includes('small') || text.includes('wide')) return 'size';
      if (text.includes('distance') || text.includes('far') || text.includes('close') || text.includes('near') || text.includes(' km') || text.includes(' miles') || text.includes(' au') || text.includes('away')) return 'distance';
      if (text.includes('gravity') || text.includes(' pull') || text.includes('weight') || text.includes('heavy') || text.includes('lightweight')) return 'gravity';
      if (text.includes('moon') || text.includes('satellite') || text.includes('moons')) return 'moons';
      if (text.includes('ring') || text.includes('rings') || text.includes('band')) return 'rings';
      if (text.includes('spin') || text.includes('rotate') || text.includes('rotation') || text.includes(' day')) return 'rotation';
      if (text.includes('orbit') || text.includes(' year') || text.includes('speed') || text.includes('velocity') || text.includes('travel')) return 'orbit';
      if (text.includes('water') || text.includes('liquid') || text.includes('ocean') || text.includes('ice') || text.includes('sea')) return 'water';
      if (text.includes('mission') || text.includes('rover') || text.includes('probe') || text.includes('lander') || text.includes('nasa') || text.includes('spacex') || text.includes('voyager') || text.includes('explore') || text.includes('visit') || text.includes('discover') || text.includes('find')) return 'mission';
      if (text.includes('color') || text.includes('look') || text.includes('appear') || text.includes('surface') || text.includes('red') || text.includes('blue') || text.includes('yellow') || text.includes('orange') || text.includes('brown')) return 'color';
      return null;
    };

    const subject = detectSubject(msg);
    const aspect = detectAspect(msg);

    // --- 1. SPECIFIC COMPLEX INTENTS / CONTEXT OVERRIDES ---
    if (msg.includes('live') && msg.includes('mars')) {
      return {
        response: "Living on Mars is one of humanity's next great frontiers, Commander! 🚀\n\n**Possibility & Timeline:** NASA and SpaceX aim to send crewed missions by the 2030s. Eventually, pressurized cities could house thousands.\n\n**The Challenges:**\n• **Atmosphere**: 95% carbon dioxide and extremely thin (1% of Earth's).\n• **Temperature**: Freezing cold, averaging -62°C (-80°F).\n• **Radiation**: No global magnetic field means high exposure to cosmic rays.\n• **Gravity**: Only 38% of Earth's gravity, which impacts muscle and bone density.\n\n**Solutions:** Habitation domes, underground lava tubes for radiation shielding, and generating oxygen from the atmospheric CO2 using technologies like MOXIE.",
        model: "offline-tutor-sim",
      };
    }
    
    if (msg.includes('life') && msg.includes('mars')) {
      return {
        response: "Is there life on Mars? Currently, we have no definitive proof of past or present life. However, Mars remains our best candidate to search for ancient microbial life!\n\n**Evidence of Water:** We know liquid water once flowed on Mars' surface, forming lakes and river deltas. Today, water exists as ice caps and underground glaciers.\n\n**Robotic Explorers:** NASA's Perseverance and Curiosity rovers are actively drilling into ancient lakebeds, analyzing soil samples for organic molecules and biosignatures (chemical clues of ancient microbes).",
        model: "offline-tutor-sim",
      };
    }

    if (msg.includes('go to mars') || msg.includes('mission to mars') || (msg.includes('when') && msg.includes('mars'))) {
      return {
        response: "Humans are planning to set foot on Mars by the **mid-2030s**! 🚀\n\n• **SpaceX Starship**: Elon Musk has laid out plans to use Starship to transport humans to Mars, with cargo test launches targeted for the late 2020s.\n• **NASA Artemis**: NASA is using the moon as a testing ground (Artemis program) to develop technologies (like SLS and Gateway) for deep-space missions to Mars.\n• **The Transit**: The journey will take roughly 6 to 9 months, traveling over 225 million kilometers depending on planetary alignment.",
        model: "offline-tutor-sim",
      };
    }

    // --- 2. MATCH SUBJECT + ASPECT COMBINATION ---
    if (subject && aspect && OFFLINE_SUBJECTS[subject] && OFFLINE_SUBJECTS[subject][aspect]) {
      const subjName = OFFLINE_SUBJECTS[subject].name;
      const aspectTitle = aspect.charAt(0).toUpperCase() + aspect.slice(1);
      return {
        response: `### 🪐 ${subjName} — ${aspectTitle}\n\n${OFFLINE_SUBJECTS[subject][aspect]}`,
        model: "offline-tutor-sim"
      };
    }

    // --- 3. MATCH SUBJECT OVERVIEWS ---
    if (subject && OFFLINE_SUBJECTS[subject]) {
      const s = OFFLINE_SUBJECTS[subject];
      let resp = `### 🌌 ${s.name} Overview\n\n${s.general}\n\n`;
      if (s.size) resp += `• **Size & Dimension**: ${s.size}\n`;
      if (s.temperature) resp += `• **Temperature**: ${s.temperature}\n`;
      if (s.moons) resp += `• **Moons**: ${s.moons}\n`;
      if (s.distance) resp += `• **Distance from Sun**: ${s.distance}\n`;
      if (s.atmosphere) resp += `• **Atmosphere**: ${s.atmosphere}\n`;
      if (s.water) resp += `• **Water / Ice Presence**: ${s.water}\n`;
      if (s.rotation) resp += `• **Rotation (Day)**: ${s.rotation}\n`;
      if (s.orbit) resp += `• **Orbit (Year)**: ${s.orbit}\n`;
      if (s.rings) resp += `• **Rings**: ${s.rings}\n`;
      if (s.mission) resp += `• **Missions**: ${s.mission}\n`;
      return {
        response: resp,
        model: "offline-tutor-sim"
      };
    }

    // --- 4. MATCH ASPECT OVERVIEWS ---
    if (aspect) {
      if (aspect === 'rings') {
        return {
          response: "### 🪐 Planetary Rings in Space\n\nPlanetary rings are composed of billions of particles of ice, dust, and rocky debris orbiting a planet. \n\n• **Saturn** has the most spectacular and prominent ring system in our solar system, stretching 282,000 km across but only 10 meters thick.\n• **Jupiter, Uranus, and Neptune** also have ring systems, though theirs are much fainter, darker, and composed mostly of fine dust and dark radiation-processed organic material.",
          model: "offline-tutor-sim"
        };
      }
      if (aspect === 'gravity') {
        return {
          response: "### 🌌 Gravity in Space\n\nGravity is the force of attraction by which objects draw other objects toward their centers. In space:\n\n• **Sun**: 28x Earth's gravity, holds the entire solar system together.\n• **Gas Giants**: Jupiter (2.4x Earth) and Saturn (1.07x Earth) have immense gravity.\n• **Rocky Planets/Moons**: Mars (38% of Earth), Moon (16.6% of Earth), and Mercury (38% of Earth) have lower gravity, causing things to feel much lighter.",
          model: "offline-tutor-sim"
        };
      }
      if (aspect === 'atmosphere') {
        return {
          response: "### 💨 Planetary Atmospheres\n\nAtmospheres vary wildly across our solar system:\n\n• **Thick Greenhouse**: Venus is covered in a dense carbon dioxide atmosphere with sulfuric acid clouds, trapping solar heat.\n• **Thin & Cold**: Mars has a tenuous atmosphere mostly made of carbon dioxide, unable to trap warmth.\n• **Gas Giants**: Jupiter and Saturn are mostly hydrogen and helium gas atmospheres.\n• **Life-Sustaining**: Earth is unique with a balanced nitrogen-oxygen atmosphere protecting it from solar rays.",
          model: "offline-tutor-sim"
        };
      }
      if (aspect === 'water') {
        return {
          response: "### 💧 Water in the Solar System\n\nLiquid water is rare on planetary surfaces, but ice and subsurface oceans are widespread:\n\n• **Earth**: The only planet with stable surface oceans (71% of surface).\n• **Mars**: Abundant water ice at its poles and under the soil surface.\n• **Ocean Worlds**: Jupiter's moon **Europa** and Saturn's moon **Enceladus** harbor massive liquid water oceans beneath thick global ice shells, which are hot targets for finding extraterrestrial life.",
          model: "offline-tutor-sim"
        };
      }
    }

    // --- 5. GENERAL K&A MATCHES ---
    if (msg.includes('gravity')) {
      return { response: OFFLINE_GENERAL_QA.gravity, model: "offline-tutor-sim" };
    }
    if (msg.includes('star') || msg.includes('stars ')) {
      return { response: OFFLINE_GENERAL_QA.star, model: "offline-tutor-sim" };
    }
    if (msg.includes('alien') || msg.includes('life') || msg.includes('extraterrestrial')) {
      return { response: OFFLINE_GENERAL_QA.alien, model: "offline-tutor-sim" };
    }
    if (msg.includes('rocket') || msg.includes('propulsion') || msg.includes('fly to space')) {
      return { response: OFFLINE_GENERAL_QA.rocket, model: "offline-tutor-sim" };
    }
    if (msg.includes('light-year') || msg.includes('light year') || msg.includes('speed of light')) {
      return { response: OFFLINE_GENERAL_QA.light_year, model: "offline-tutor-sim" };
    }
    if (msg.includes('suit') || msg.includes('spacesuit') || msg.includes('helmet')) {
      return { response: OFFLINE_GENERAL_QA.suit, model: "offline-tutor-sim" };
    }
    if (msg.includes('dark matter') || msg.includes('dark energy') || msg.includes('black matter')) {
      return { response: OFFLINE_GENERAL_QA.black_matter, model: "offline-tutor-sim" };
    }
    if (msg.includes('universe') || msg.includes('cosmos')) {
      return { response: OFFLINE_GENERAL_QA.universe, model: "offline-tutor-sim" };
    }
    if (msg.includes('big bang') || msg.includes('big bag') || msg.includes('bigbang') || msg.includes('bigbag')) {
      return { response: OFFLINE_GENERAL_QA.big_bang, model: "offline-tutor-sim" };
    }

    // --- 6. DYNAMIC CELESTIAL FALLBACK (Provides high value space knowledge always) ---
    const facts = [
      "One day on Venus is longer than one year on Venus! It takes 243 Earth days to rotate once on its axis, but only 225 Earth days to travel around the Sun.",
      "Neutron stars are so dense that a single teaspoon of their material would weigh about 6 billion tons!",
      "Space is completely silent because there is no atmosphere for sound waves to travel through.",
      "The footprints left by Apollo astronauts on the Moon will probably stay there for at least 100 million years because there is no wind or water to wash them away.",
      "The Sun accounts for 99.86% of the mass in our entire solar system!",
      "Jupiter's moon Europa has twice as much water as all of Earth's oceans combined, hidden under its icy crust.",
      "A day on Mars is called a Sol and is just 37 minutes longer than a day on Earth."
    ];
    const randomFact = facts[Math.floor(Math.random() * facts.length)];

    return {
      response: `Commander, I received your query: "${userMessage}".\n\nI am currently running in Offline Mode, but I can help you with detailed space physics and astronomy! 🌌\n\n**Did you know?**\n${randomFact}\n\n**Try asking me about:**\n• Planets: "How hot is Venus?", "Atmosphere of Mars", "Jupiter's moons"\n• Space Exploration: "What did Hubble discover?", "What is James Webb?", "What is the ISS?"\n• Physics: "What is gravity?", "How big is the universe?", "What is a black hole?"`,
      model: 'offline-knowledge',
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
