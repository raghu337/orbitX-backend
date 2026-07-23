/**
 * OrbitX JWT & User Storage Utility
 * Manages access token, refresh token, and user session securely.
 */

const TOKEN_KEY = 'orbitx_access_token';
const REFRESH_TOKEN_KEY = 'orbitx_refresh_token';
const USER_KEY = 'orbitx_user_profile';

export interface UserProfile {
  id?: string;
  email: string;
  name?: string;
  role?: string;
  commanderTitle?: string;
  avatar?: string;
}

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  setAccessToken(token: string, rememberMe = true): void {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string, rememberMe = true): void {
    if (rememberMe) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  getUser(): UserProfile | null {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setUser(user: UserProfile, rememberMe = true): void {
    const serialized = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem(USER_KEY, serialized);
    } else {
      sessionStorage.setItem(USER_KEY, serialized);
    }
  },

  clearAll(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
};
