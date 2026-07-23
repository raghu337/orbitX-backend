import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import orbitxApi, { OFFLINE_MODE } from '../services/api/orbitxApi';

export const AuthContext = createContext({});

const DEFAULT_USERS = [
  {
    id: 'mock-offline-id-1',
    name: 'Commander Explorer',
    email: 'astronaut@gmail.com',
    password: 'Password123!',
  },
  {
    id: 'mock-offline-id-2',
    name: 'Jhuvamma',
    email: 'jhuvamma548@gmail.com',
    password: 'Password123!',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState(DEFAULT_USERS);

  console.log(
    `[AuthProvider] Render — user: ${user ? `"${user.name}"` : 'null'}, loading: ${loading}`
  );

  // Load saved registered users from AsyncStorage
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const storedUsers = await AsyncStorage.getItem('registeredUsers');
        if (storedUsers) {
          const parsed = JSON.parse(storedUsers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRegisteredUsers(parsed);
          }
        }
      } catch (e) {
        console.warn('[AuthContext] Failed to load stored users:', e);
      }
    };
    loadUsers();
  }, []);

  // ── Session Restore on App Start ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      console.log('[AuthContext] ▶ checkSession start');

      try {
        const token = await AsyncStorage.getItem('userToken');
        const storedUserData = await AsyncStorage.getItem('userData');

        if (!token) {
          console.log('[AuthContext] No stored token — showing auth screens');
          if (!cancelled) setLoading(false);
          return;
        }

        if (!cancelled) {
          if (storedUserData) {
            setUser(JSON.parse(storedUserData));
          } else {
            setUser({ id: 'mock-offline-id', name: 'Commander Explorer', email: 'astronaut@gmail.com' });
          }
          console.log(`[AuthContext] ✓ Session restored`);
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
    console.log(`\n[AuthContext] ▶ login() called for: "${email}"`);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Backend Authentication if not strictly forced offline
    if (!OFFLINE_MODE) {
      try {
        const formData = new URLSearchParams();
        formData.append('username', cleanEmail);
        formData.append('password', password);

        const response = await orbitxApi.post('/auth/login', formData.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response?.data?.access_token) {
          const token = response.data.access_token;
          await AsyncStorage.setItem('userToken', token);
          const profileData = {
            id: response.data.user_id || 'user-' + Date.now(),
            name: cleanEmail.split('@')[0],
            email: cleanEmail,
          };
          await AsyncStorage.setItem('userData', JSON.stringify(profileData));
          setUser(profileData);
          return profileData;
        }
      } catch (backendErr) {
        console.log('[AuthContext] Backend login attempt failed/fallback:', backendErr?.message);
        // If server explicitly returns 401 Unauthorized, throw Invalid email or password
        if (backendErr?.response?.status === 401) {
          const authErr = new Error('Invalid email or password.');
          authErr.userMessage = 'Invalid email or password.';
          throw authErr;
        }
      }
    }

    // 2. Validate against local registered users database
    await new Promise(r => setTimeout(r, 400)); // Simulate authentication delay

    const matchedUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (!matchedUser) {
      console.warn(`[AuthContext] Login failed: Invalid credentials for "${cleanEmail}"`);
      const err = new Error('Invalid email or password.');
      err.userMessage = 'Invalid email or password.';
      throw err;
    }

    // Credentials valid -> create session
    const access_token = 'user-token-' + Date.now();
    try {
      await AsyncStorage.setItem('userToken', access_token);
      const profileData = {
        id: matchedUser.id,
        name: matchedUser.name || cleanEmail.split('@')[0],
        email: matchedUser.email,
      };
      await AsyncStorage.setItem('userData', JSON.stringify(profileData));
      setUser(profileData);
      console.log(`[AuthContext] ✓ LOGIN SUCCESS — user: "${profileData.name}"`);
      return profileData;
    } catch (storageErr) {
      const err = new Error('Failed to store auth token');
      err.userMessage = 'Could not save login session. Please try again.';
      throw err;
    }
  }, [registeredUsers]);


  // ── Signup ────────────────────────────────────────────────────────────────
  const signup = useCallback(async (email, password, name) => {
    console.log(`[AuthContext] ▶ signup() for: "${email}"`);
    await new Promise(r => setTimeout(r, 400));

    const cleanEmail = email.trim().toLowerCase();
    const newUser = {
      id: 'user-' + Date.now(),
      email: cleanEmail,
      password,
      name: name || cleanEmail.split('@')[0],
      role: 'user',
    };

    const updated = [...registeredUsers.filter((u) => u.email.toLowerCase() !== cleanEmail), newUser];
    setRegisteredUsers(updated);

    try {
      await AsyncStorage.setItem('registeredUsers', JSON.stringify(updated));
    } catch (e) {
      console.warn('[AuthContext] Failed to persist new registered user:', e);
    }

    console.log(`[AuthContext] ✓ Signup success for: ${cleanEmail}`);
    return newUser;
  }, [registeredUsers]);


  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    console.log('[AuthContext] ▶ logout()');
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (_) {}
    setUser(null);
    console.log('[AuthContext] ✓ Logged out — auth state cleared');
  }, []);


  // ── Reset Password ────────────────────────────────────────────────
  const resetPassword = useCallback(async (email) => {
    console.log(`[AuthContext] resetPassword for ${email}`);
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