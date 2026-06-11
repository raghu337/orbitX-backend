import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const DEFAULT_OLLAMA_PORT = 11434;
const DEFAULT_MODEL = 'qwen2.5-coder:latest';
const DEFAULT_CHECK_TIMEOUT_MS = 7000;
const DEFAULT_REQUEST_TIMEOUT_MS = 25000;
const DEFAULT_RETRY_COUNT = 2;
const RETRY_DELAY_MS = 700;
const MODEL_CHECK_CACHE_MS = 60 * 1000;
const LOG_PREFIX = '[SpaceAIService]';

class SpaceAIService {
  constructor() {
    this.model = DEFAULT_MODEL;
    this.conversationHistory = [];
    this.modelVerified = false;
    this.lastModelCheck = 0;
    this.baseUrlOverride = this.getConfiguredBaseUrl();
  }

  getConfiguredBaseUrl() {
    const configUrl =
      Constants.expoConfig?.extra?.OLLAMA_BASE_URL ??
      Constants.manifest?.extra?.OLLAMA_BASE_URL;

    if (typeof configUrl === 'string' && configUrl.trim().length > 0) {
      return configUrl.trim();
    }

    if (typeof process !== 'undefined' && typeof process.env?.OLLAMA_BASE_URL === 'string' && process.env.OLLAMA_BASE_URL.trim()) {
      return process.env.OLLAMA_BASE_URL.trim();
    }

    return null;
  }

  getNetworkStatus() {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine ? 'Online' : 'Offline';
    }
    return 'Unknown';
  }

  getEnvironmentLabel() {
    if (Platform.OS === 'web') {
      return 'Web';
    }
    if (Constants.appOwnership === 'expo') {
      return 'Expo Go';
    }
    if (Platform.OS === 'android' && !Device.isDevice) {
      return 'Android Emulator';
    }
    if (Platform.OS === 'android' && Device.isDevice) {
      return 'Physical Android Device';
    }
    if (Platform.OS === 'ios' && !Device.isDevice) {
      return 'iOS Simulator';
    }
    return 'Native Device';
  }

  getDebugHostname() {
    const rawHost =
      Constants.manifest?.debuggerHost ||
      Constants.expoConfig?.hostUri ||
      Constants.manifest2?.debuggerHost ||
      '';

    if (!rawHost || typeof rawHost !== 'string') {
      return null;
    }

    const ipMatch = rawHost.match(/(\d+\.\d+\.\d+\.\d+)/);
    if (ipMatch) {
      return ipMatch[1];
    }

    const [hostPart] = rawHost.split(':');
    return hostPart || null;
  }

  getComputedBaseUrl() {
    if (this.baseUrlOverride) {
      const cleaned = this.baseUrlOverride.replace(/\/+$/, '');
      console.log(`${LOG_PREFIX} Using configured OLLAMA_BASE_URL: ${cleaned}`);
      return cleaned;
    }

    if (Platform.OS === 'web') {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      return `http://${hostname}:${DEFAULT_OLLAMA_PORT}`;
    }

    const debugHost = this.getDebugHostname();
    if (debugHost && debugHost !== 'localhost' && debugHost !== '127.0.0.1') {
      return `http://${debugHost}:${DEFAULT_OLLAMA_PORT}`;
    }

    if (Platform.OS === 'android' && !Device.isDevice) {
      return `http://10.0.2.2:${DEFAULT_OLLAMA_PORT}`;
    }

    if (Platform.OS === 'android' && Device.isDevice) {
      return null;
    }

    return `http://localhost:${DEFAULT_OLLAMA_PORT}`;
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

  async retryAsync(fn, attempts = DEFAULT_RETRY_COUNT, delayMs = RETRY_DELAY_MS) {
    let lastError = null;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const message = error?.message || 'Unknown error';
        const retryable = this.isRetryableError(error);
        console.warn(`${LOG_PREFIX} Retry ${attempt} failed: ${message}`);
        if (!retryable || attempt === attempts) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw lastError;
  }

  isRetryableError(error) {
    if (!error || typeof error.message !== 'string') {
      return false;
    }
    const message = error.message.toLowerCase();
    return (
      message.includes('timed out') ||
      message.includes('network request failed') ||
      message.includes('failed to fetch') ||
      message.includes('network error') ||
      message.includes('connection refused')
    );
  }

  async fetchJson(url, options = {}, timeoutMs = DEFAULT_CHECK_TIMEOUT_MS) {
    const response = await this.timedFetch(url, options, timeoutMs);

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText || 'Unknown Ollama error');
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  extractTextFromOllamaResponse(data) {
    if (!data) {
      return null;
    }

    if (typeof data.response === 'string' && data.response.trim().length > 0) {
      return data.response.trim();
    }

    if (typeof data.text === 'string' && data.text.trim().length > 0) {
      return data.text.trim();
    }

    if (Array.isArray(data.content)) {
      const text = data.content
        .filter((item) => item?.type === 'output_text' || typeof item?.text === 'string')
        .map((item) => item.text || '')
        .join('')
        .trim();
      if (text.length > 0) {
        return text;
      }
    }

    if (Array.isArray(data.results)) {
      const text = data.results
        .flatMap((result) => result?.content ?? [])
        .filter((item) => typeof item?.text === 'string')
        .map((item) => item.text)
        .join('')
        .trim();
      if (text.length > 0) {
        return text;
      }
    }

    return null;
  }

  async checkHealth(baseUrl) {
    const tagsUrl = `${baseUrl}/api/tags`;
    console.log(`${LOG_PREFIX} Checking Ollama health at ${tagsUrl}`);
    const data = await this.fetchJson(tagsUrl, { method: 'GET' }, DEFAULT_CHECK_TIMEOUT_MS);
    if (!Array.isArray(data)) {
      throw new Error('Unexpected /api/tags response.');
    }
    return data;
  }

  async verifyModelInstalled(baseUrl) {
    const now = Date.now();
    if (this.modelVerified && now - this.lastModelCheck < MODEL_CHECK_CACHE_MS) {
      return true;
    }

    const modelsUrl = `${baseUrl}/api/models`;
    console.log(`${LOG_PREFIX} Verifying model availability at ${modelsUrl}`);
    const models = await this.fetchJson(modelsUrl, { method: 'GET' }, DEFAULT_CHECK_TIMEOUT_MS);

    const modelNames = Array.isArray(models)
      ? models.map((item) => String(item?.name || item?.id || '').toLowerCase())
      : [];
    const target = this.model.toLowerCase();
    const modelFound = modelNames.some(
      (name) => name === target || name.startsWith(target) || target.startsWith(name)
    );

    if (!modelFound) {
      console.warn(`${LOG_PREFIX} Ollama model not found. Available models: ${JSON.stringify(modelNames)}`);
      throw new Error(`Ollama is reachable, but model "${this.model}" is not installed.`);
    }

    this.modelVerified = true;
    this.lastModelCheck = now;
    return true;
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

    if (!baseUrl) {
      const message = `Unable to resolve Ollama host for ${environment}. Set OLLAMA_BASE_URL in app.json extra with your Windows host LAN IP.`;
      console.warn(`${LOG_PREFIX} ${message}`, details);
      return {
        online: false,
        message,
        details,
        connectionResult: 'Base URL missing',
      };
    }

    try {
      await this.retryAsync(() => this.checkHealth(baseUrl), DEFAULT_RETRY_COUNT);
      await this.retryAsync(() => this.verifyModelInstalled(baseUrl), DEFAULT_RETRY_COUNT);
      const message = `Ollama is online at ${baseUrl}`;
      console.log(`${LOG_PREFIX} ${message}`, details);
      return {
        online: true,
        message,
        details,
        connectionResult: 'AI Online',
      };
    } catch (error) {
      const message = `Ollama connection failed at ${baseUrl}: ${error.message}`;
      console.warn(`${LOG_PREFIX} ${message}`, details);
      return {
        online: false,
        message,
        details,
        connectionResult: error.message.includes('model') ? 'Model not found' : 'AI Offline',
      };
    }
  }

  async generateResponseWithOllama(prompt) {
    const baseUrl = this.getComputedBaseUrl();
    if (!baseUrl) {
      throw new Error('Unable to resolve Ollama base URL before sending the request.');
    }

    const generateUrl = `${baseUrl}/api/generate`;
    console.log(`${LOG_PREFIX} Sending generate request to ${generateUrl}`);

    const response = await this.retryAsync(async () => {
      const res = await this.timedFetch(
        generateUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            prompt,
            stream: false,
            temperature: 0.7,
            top_p: 0.9,
          }),
        },
        DEFAULT_REQUEST_TIMEOUT_MS
      );
      if (!res.ok) {
        const errorText = await res.text().catch(() => res.statusText || 'Unknown Ollama error');
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      return res;
    });

    const data = await response.json();
    const text = this.extractTextFromOllamaResponse(data);
    if (!text) {
      console.warn(`${LOG_PREFIX} Ollama generate returned unexpected payload.`, data);
      throw new Error('Ollama did not return a readable response.');
    }

    return text;
  }

  buildSystemPrompt() {
    return `You are an expert Space Assistant AI for OrbitX. Answer space-related user questions in a clear, friendly, and accurate way. Focus on planets, moons, stars, galaxies, black holes, the ISS, NASA missions, and space exploration. Keep responses concise and engaging.`;
  }

  async sendMessage(userMessage) {
    const trimmedMessage = userMessage?.trim();
    if (!trimmedMessage) {
      throw new Error('Please type a space question before sending.');
    }

    const status = await this.checkConnection();
    if (!status.online) {
      throw new Error(status.message);
    }

    this.conversationHistory.push({ role: 'user', content: trimmedMessage });
    const conversationContext = this.conversationHistory
      .slice(-6)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');

    const fullPrompt = `${this.buildSystemPrompt()}\n\nConversation:\n${conversationContext}\n\nAnswer the user’s latest question directly in a friendly and accurate way.`;
    const aiResponse = await this.generateResponseWithOllama(fullPrompt);

    if (!aiResponse) {
      throw new Error('Ollama did not return a response. Please try again.');
    }

    this.conversationHistory.push({ role: 'assistant', content: aiResponse });
    return {
      success: true,
      response: aiResponse,
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
    if (typeof modelName === 'string' && modelName.trim().length > 0) {
      this.model = modelName.trim();
      this.modelVerified = false;
    }
  }
}

export default new SpaceAIService();
