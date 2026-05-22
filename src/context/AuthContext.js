import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import orbitxApi from '../services/api/orbitxApi';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log(
    `[AuthProvider] Render — user: ${user ? `"${user.name}"` : 'null'}, loading: ${loading}`
  );


  // ── Session Restore on App Start ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      console.log('[AuthContext] ▶ checkSession start (OFFLINE MODE)');

      try {
        const token = await AsyncStorage.getItem('userToken');

        if (!token) {
          console.log('[AuthContext] No stored token — showing auth screens');
          if (!cancelled) setLoading(false);
          return;
        }

        console.log('[AuthContext] Stored token found — bypassing backend validation in offline mode.');
        
        // Mock a user profile locally
        if (!cancelled) {
          setUser({ id: 'mock-offline-id', name: 'Commander Explorer', email: 'astronaut@orbitx.com' });
          console.log(`[AuthContext] ✓ Session restored for offline mode`);
        }
      } catch (error) {
        console.warn('[AuthContext] Session check error:', error.message);
      } finally {
        if (!cancelled) {
          setLoading(false);
          console.log('[AuthContext] ✓ checkSession complete — loading = false');
        }
      }
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);


  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    console.log(`\n[AuthContext] ▶ login() called for: "${email}" (OFFLINE MODE)`);

    // Simulate network latency
    await new Promise(r => setTimeout(r, 600));

    // Create a mock token
    const access_token = 'mock-offline-token-' + Date.now();

    console.log('[AuthContext] Storing mock token to AsyncStorage...');
    try {
      await AsyncStorage.setItem('userToken', access_token);
      console.log('[AuthContext] ✓ Token stored');
    } catch (storageErr) {
      const err = new Error('Failed to store auth token');
      err.userMessage = 'Could not save login session. Please try again.';
      throw err;
    }

    const profileData = { id: 'mock-offline-id', name: email.split('@')[0] || 'Commander Explorer', email };

    // ── Update auth state — triggers AppNavigator re-render to Main ─────────
    setUser(profileData);
    console.log(`[AuthContext] ✓ OFFLINE LOGIN COMPLETE — user: "${profileData.name}"`);
    console.log('[AuthContext] AppNavigator will now transition to Main screen.\n');

    return profileData;
  }, []);


  // ── Signup ────────────────────────────────────────────────────────────────
  const signup = useCallback(async (email, password, name) => {
    console.log(`[AuthContext] ▶ signup() for: "${email}" (OFFLINE MODE)`);
    await new Promise(r => setTimeout(r, 600)); // Simulate latency
    
    const profileData = {
      id: 'mock-offline-id-' + Date.now(),
      email,
      name: name || 'Space Explorer',
      role: 'user',
    };
    
    console.log(`[AuthContext] ✓ Offline Signup success: id=${profileData.id}`);
    return profileData;
  }, []);


  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    console.log('[AuthContext] ▶ logout()');
    try {
      await AsyncStorage.removeItem('userToken');
    } catch (_) {}
    setUser(null);
    console.log('[AuthContext] ✓ Logged out — auth state cleared');
  }, []);


  // ── Reset Password (mock) ────────────────────────────────────────────────
  const resetPassword = useCallback(async (email) => {
    console.log(`[AuthContext] Mock: resetPassword for ${email}`);
    return true;
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};