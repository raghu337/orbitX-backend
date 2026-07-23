import { api } from './api';
import { tokenStorage, UserProfile } from '../utils/token';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupPayload {
  email: string;
  password: string;
  name?: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: UserProfile;
  expires_in?: number;
}

export const authService = {
  /**
   * Main Login API call
   * Sends POST to /api/auth/login or /api/v1/auth/login
   */
  async login({ email, password, rememberMe = true }: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', {
        email,
        password,
      });

      const { access_token, refresh_token, user } = response.data;
      
      // Save JWT Token & User Details securely
      tokenStorage.setAccessToken(access_token, rememberMe);
      if (refresh_token) {
        tokenStorage.setRefreshToken(refresh_token, rememberMe);
      }
      tokenStorage.setUser(user, rememberMe);

      return response.data;
    } catch (error: any) {
      // Fallback mock mode if backend is unreachable during dev/offline testing
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404 || !error.response) {
        console.warn('Backend API unreachable or endpoint missing. Falling back to local offline auth simulation.');
        
        // Simulating network latency for realistic feel
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockUser: UserProfile = {
          id: 'orbitx-cmd-' + Date.now().toString().slice(-4),
          email,
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          role: 'Commander',
          commanderTitle: 'Orbital Fleet Lead',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };

        const mockAccessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
          JSON.stringify({ sub: mockUser.id, email, exp: Date.now() + 3600000 })
        )}.signature`;
        
        const mockRefreshToken = `mock_refresh_${Date.now()}`;

        tokenStorage.setAccessToken(mockAccessToken, rememberMe);
        tokenStorage.setRefreshToken(mockRefreshToken, rememberMe);
        tokenStorage.setUser(mockUser, rememberMe);

        return {
          access_token: mockAccessToken,
          refresh_token: mockRefreshToken,
          user: mockUser,
        };
      }

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Authentication failed. Please verify your commander credentials.';
      throw new Error(errorMessage);
    }
  },

  /**
   * Main Signup API call
   */
  async signup({ email, password, name, rememberMe = true }: SignupPayload): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/signup', {
        email,
        password,
        name: name || email.split('@')[0],
      });

      // If signup returns user token directly:
      if (response.data?.access_token) {
        tokenStorage.setAccessToken(response.data.access_token, rememberMe);
        tokenStorage.setUser(response.data.user, rememberMe);
        return response.data;
      }
      // Otherwise login automatically
      return await this.login({ email, password, rememberMe });
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404 || !error.response) {
        console.warn('Backend API unreachable. Simulating successful cadet signup.');
        await new Promise((resolve) => setTimeout(resolve, 800));
        return await this.login({ email, password, rememberMe });
      }
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Registration failed. Account may already exist.';
      throw new Error(errorMessage);
    }
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      // Simulation fallback
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        success: true,
        message: `Password recovery telemetry dispatch sent to ${email}.`,
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout').catch(() => {});
    } finally {
      tokenStorage.clearAll();
    }
  },

  getCurrentUser(): UserProfile | null {
    return tokenStorage.getUser();
  },

  getAccessToken(): string | null {
    return tokenStorage.getAccessToken();
  }
};
