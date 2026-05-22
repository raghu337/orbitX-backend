import { Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Base URL ─────────────────────────────────────────────────────────────────
// IMPORTANT: Set MACHINE_IP to your PC's Wi-Fi IPv4 address.
//
// How to find it on Windows:
//   1. Open PowerShell and run: ipconfig
//   2. Look for "Wi-Fi" adapter → "IPv4 Address"
//   3. Copy that IP here (e.g., 10.230.206.98)
//
// Requirements:
//   • Your PC and Android device MUST be on the same Wi-Fi network
//   • Windows Firewall must allow inbound TCP on port 8000
//     (run start_backend.ps1 as Administrator to fix this automatically)
//   • Backend must be started with: python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
//
const MACHINE_IP = '10.230.206.98'; // ← Your PC's Wi-Fi IPv4 address

// Build base URL: always use MACHINE_IP to ensure real devices connect reliably
const BASE_URL = `http://${MACHINE_IP}:8000/api/v1`;

export const OFFLINE_MODE = true; // Set to true to work entirely frontend-only without a backend

console.log(`[API] ════════════════════════════════════════`);
console.log(`[API] OrbitX API initializing`);
console.log(`[API]   Platform  : ${Platform.OS}`);
console.log(`[API]   Base URL  : ${BASE_URL}`);
console.log(`[API]   Target IP : ${MACHINE_IP}`);
console.log(`[API] ════════════════════════════════════════`);

// ── Axios Instance ────────────────────────────────────────────────────────────
const orbitxApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10s — balanced timeout to prevent infinite loading
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});


// ── Request Interceptor ───────────────────────────────────────────────────────
orbitxApi.interceptors.request.use(
  async (config) => {
    // Attach auth token if available
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (storageErr) {
      console.warn('[API] Could not read token from AsyncStorage:', storageErr.message);
    }

    // Log the full request details for debugging
    const fullUrl = `${config.baseURL}${config.url}`;
    const body = config.data
      ? typeof config.data === 'string'
        ? config.data.substring(0, 200)
        : '[Object/FormData]'
      : 'none';

    console.log(`\n[API ▶ Request] ──────────────────────────────`);
    console.log(`[API]   Method  : ${config.method?.toUpperCase()}`);
    console.log(`[API]   Full URL: ${fullUrl}`);
    console.log(`[API]   C-Type  : ${config.headers['Content-Type']}`);
    console.log(`[API]   Body    : ${body}`);
    console.log(`[API]   Timeout : ${config.timeout}ms`);
    console.log(`[API] ──────────────────────────────────────────`);

    return config;
  },
  (error) => {
    console.error('[API] Request setup error:', error.message);
    return Promise.reject(error);
  }
);


// ── Response Interceptor ──────────────────────────────────────────────────────
orbitxApi.interceptors.response.use(
  (response) => {
    const url = response.config?.url ?? 'unknown';
    console.log(`[API ✓ Response] ${response.status} from ${url}`);
    return response;
  },
  async (error) => {
    const url = error.config?.url ?? 'unknown';
    const fullUrl = error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown';
    const status = error.response?.status;
    const timeoutMs = error.config?.timeout;

    console.log(`\n[API ✗ Error] ─────────────────────────────────`);

    if (error.code === 'ECONNABORTED') {
      // Timeout — server took too long
      console.error(`[API]   Type    : TIMEOUT`);
      console.error(`[API]   URL     : ${fullUrl}`);
      console.error(`[API]   After   : ${timeoutMs}ms`);
      console.error(`[API]   Fix     : Is backend running? Is device on same WiFi as ${MACHINE_IP}?`);
    } else if (!error.response) {
      // Network error — no response received at all
      console.error(`[API]   Type    : NETWORK ERROR (no response)`);
      console.error(`[API]   URL     : ${fullUrl}`);
      console.error(`[API]   Message : ${error.message}`);
      console.error(`[API]   Code    : ${error.code}`);
      console.error(`[API]   Fix 1   : Run backend with --host 0.0.0.0`);
      console.error(`[API]   Fix 2   : Open Windows Firewall port 8000 (run start_backend.ps1 as Admin)`);
      console.error(`[API]   Fix 3   : Both devices on SAME WiFi network`);
      console.error(`[API]   Fix 4   : Verify IP ${MACHINE_IP} matches PC's Wi-Fi IPv4`);
    } else {
      // HTTP error — server responded with an error code
      console.warn(`[API]   Type    : HTTP ${status}`);
      console.warn(`[API]   URL     : ${fullUrl}`);
      console.warn(`[API]   Body    : ${JSON.stringify(error.response.data)}`);
    }
    console.log(`[API] ─────────────────────────────────────────\n`);

    // Auto-clear token on 401 Unauthorized
    if (status === 401) {
      console.log('[API] 401 received — clearing stored token');
      try {
        await AsyncStorage.removeItem('userToken');
      } catch (_) {}
    }

    return Promise.reject(error);
  }
);


// ── Connectivity Test ─────────────────────────────────────────────────────────
/**
 * Quick ping to verify the backend is reachable before doing auth.
 * Returns { reachable: boolean, latency: number | null, error: string | null }
 */
export const testBackendConnectivity = async () => {
  if (OFFLINE_MODE) {
    console.log(`[API Ping] OFFLINE_MODE active — skipping real ping and simulating success.`);
    return { reachable: true, latency: 0, error: null };
  }

  const pingUrl = `http://${MACHINE_IP}:8000/ping`;
  const startTime = Date.now();

  console.log(`[API Ping] Testing connectivity to ${pingUrl}...`);

  try {
    const response = await axios.get(pingUrl, { timeout: 8000 });
    const latency = Date.now() - startTime;
    console.log(`[API Ping] ✓ Backend reachable — ${latency}ms (status: ${response.status})`);
    return { reachable: true, latency, error: null };
  } catch (err) {
    const latency = Date.now() - startTime;
    let errorMsg;

    if (err.code === 'ECONNABORTED') {
      errorMsg = `Timeout after ${latency}ms — backend running but too slow, or wrong IP`;
    } else if (!err.response) {
      errorMsg = `No response from ${MACHINE_IP}:8000 — backend not running or firewall blocking`;
    } else {
      errorMsg = `HTTP ${err.response?.status} from backend`;
    }

    console.error(`[API Ping] ✗ Backend unreachable: ${errorMsg}`);
    return { reachable: false, latency: null, error: errorMsg };
  }
};



// ── Offline Mock Overrides ────────────────────────────────────────────────────
if (OFFLINE_MODE) {
  console.warn('[API] OFFLINE_MODE is ENABLED. Using local mock data instead of backend APIs.');
  
  // Mock GET requests
  orbitxApi.get = async (url, config) => {
    console.log(`[Offline Mock] GET ${url}`);
    await new Promise(r => setTimeout(r, 400)); // Simulate latency
    
    if (url.includes('/auth/me')) {
      return { data: { id: 'mock-offline-id', name: 'Commander Explorer', email: 'astronaut@orbitx.com' } };
    }
    
    if (url.includes('/satellites/')) {
      try {
        const { MOCK_SATELLITES } = require('../../data/mockSatellites');
        return { data: MOCK_SATELLITES };
      } catch (e) {
        return { data: [] };
      }
    }
    
    if (url.includes('/tracking/live')) {
      return { data: [] };
    }
    
    if (url.includes('/progress/')) {
      return { data: { progress: 0, score: 0 } };
    }
    
    if (url.includes('/quiz/')) {
      try {
        const { QUIZ_CATEGORIES } = require('../../data/mockQuiz');
        return { data: QUIZ_CATEGORIES };
      } catch (e) {
        return { data: [] };
      }
    }
    
    if (url.includes('/courses/')) {
      try {
        const { QUIZ_CATEGORIES } = require('../../data/mockQuiz');
        return { data: QUIZ_CATEGORIES };
      } catch (e) {
        return { data: [] };
      }
    }
    
    if (url.includes('/alerts/')) {
      return { data: [] };
    }
    
    return { data: [] };
  };

  // Mock POST requests
  orbitxApi.post = async (url, data, config) => {
    console.log(`[Offline Mock] POST ${url}`);
    await new Promise(r => setTimeout(r, 600)); // Simulate latency
    
    if (url.includes('/auth/login')) {
      return { data: { access_token: 'mock-offline-token' } };
    }
    
    if (url.includes('/auth/signup')) {
      return { data: { id: 'mock-offline-id', name: 'Explorer', email: 'astronaut@orbitx.com' } };
    }
    
    if (url.includes('/satellites/favorite')) {
      return { data: { success: true } };
    }
    
    if (url.includes('/progress/update')) {
      return { data: { success: true } };
    }
    
    if (url.includes('/quiz/submit') || url.includes('/courses/quiz/submit')) {
      return { data: { success: true, xp_earned: 100 } };
    }
    
    if (url.includes('/alerts/create')) {
      return { data: { success: true } };
    }
    
    return { data: { success: true } };
  };
}

export { MACHINE_IP, BASE_URL };
export default orbitxApi;
