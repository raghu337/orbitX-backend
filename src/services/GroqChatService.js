/**
 * GroqChatService.js
 *
 * Handles client-side chat logic for the OrbitX app, communicating
 * with the backend chat proxy endpoint.
 * Dynamically resolves the development computer's LAN IP when running in Expo.
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

class GroqChatService {
  constructor() {
    this.conversationHistory = [];
    this.baseUrl = this.getComputedBaseUrl();
  }

  /**
   * Helper to parse the debugger / Metro host IP dynamically in development.
   */
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

  /**
   * Computes the base URL for the FastAPI backend dynamically.
   */
  getComputedBaseUrl() {
    const debugHost = this.getDebugHostname();
    
    if (debugHost) {
      console.log(`[GroqChatService] Detected Metro bundler host IP: ${debugHost}`);
      return `http://${debugHost}:8000/api/v1`;
    }

    if (Platform.OS === 'web') {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      return `http://${hostname}:8000/api/v1`;
    }

    // Default fallback to user's known LAN IP
    return `http://10.230.245.98:8000/api/v1`;
  }

  /**
   * Send a message to the backend and return the AI reply.
   *
   * @param {string} userMessage - User's query.
   * @returns {Promise<{response: string, model: string}>}
   */
  async sendMessage(userMessage) {
    const trimmed = (userMessage || '').trim();
    if (!trimmed) {
      throw new Error('Please type a space question before sending.');
    }

    // Refresh base URL in case network conditions changed
    this.baseUrl = this.getComputedBaseUrl();
    const chatEndpoint = `${this.baseUrl}/chat`;

    console.log(`[GroqChatService] Outbound POST request to: ${chatEndpoint}`);
    
    // Add user turn locally
    this.conversationHistory.push({ role: 'user', content: trimmed });

    // Send context history (limit to last 10 messages)
    const historySlice = this.conversationHistory.slice(-10);

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutMs = 30000;
    const timeoutId = setTimeout(() => {
      if (controller) {
        console.warn(`[GroqChatService] Request to ${chatEndpoint} timed out after ${timeoutMs}ms.`);
        controller.abort();
      }
    }, timeoutMs);

    try {
      console.log(`[GroqChatService] Payload message: "${trimmed}", history turns: ${historySlice.length}`);
      
      const res = await fetch(chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          history: historySlice,
        }),
        ...(controller ? { signal: controller.signal } : {}),
      });

      clearTimeout(timeoutId);

      console.log(`[GroqChatService] Inbound response status: ${res.status}`);

      if (!res.ok) {
        let errorMsg = `Server error (${res.status})`;
        try {
          const errData = await res.json();
          if (errData && errData.detail) {
            errorMsg = errData.detail;
          }
        } catch (_) {
          // Fallback if not JSON
        }
        console.error(`[GroqChatService] Backend rejected payload. Message: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const data = await res.json();
      console.log(`[GroqChatService] Response successfully parsed. Model: ${data.model}`);

      // Add assistant turn locally
      this.conversationHistory.push({
        role: 'assistant',
        content: data.response,
      });

      return {
        response: data.response,
        model: data.model || 'groq',
      };
    } catch (error) {
      clearTimeout(timeoutId);

      // Remove the last user input from history since it failed to transmit successfully
      this.conversationHistory.pop();

      console.error(`[GroqChatService] Network or API failure:`, error);

      if (error.name === 'AbortError') {
        throw new Error(
          'Connection timed out. The server took too long to respond. Please try again.'
        );
      }

      if (
        error.message.includes('Network request failed') ||
        error.message.includes('Failed to fetch')
      ) {
        throw new Error(
          `Cannot reach the OrbitX server at ${this.baseUrl}. Please verify that the FastAPI backend is running and that your phone is connected to the same Wi-Fi network.`
        );
      }

      throw error;
    }
  }

  /**
   * Reset local history
   */
  clearHistory() {
    this.conversationHistory = [];
  }
}

export default new GroqChatService();
