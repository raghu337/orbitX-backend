import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../utils/token';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto Refresh Token / Global Error Handler
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized and auto refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = tokenStorage.getRefreshToken();

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, new_refresh_token } = res.data;
          tokenStorage.setAccessToken(access_token);
          if (new_refresh_token) {
            tokenStorage.setRefreshToken(new_refresh_token);
          }

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshErr) {
          tokenStorage.clearAll();
          window.dispatchEvent(new CustomEvent('orbitx:unauthorized'));
          return Promise.reject(refreshErr);
        }
      } else {
        tokenStorage.clearAll();
        window.dispatchEvent(new CustomEvent('orbitx:unauthorized'));
      }
    }

    return Promise.reject(error);
  }
);
