import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authService, LoginPayload } from '../services/authService';
import { tokenStorage, UserProfile } from '../utils/token';

export interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial auth state
    const storedToken = tokenStorage.getAccessToken();
    const storedUser = tokenStorage.getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      tokenStorage.clearAll();
    }
    setIsLoading(false);

    // Listen for global unauthorized events dispatched from Axios interceptor
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      tokenStorage.clearAll();
    };

    window.addEventListener('orbitx:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('orbitx:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await authService.login(payload);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
