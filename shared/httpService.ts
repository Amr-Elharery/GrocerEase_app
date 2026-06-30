import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const REFRESH_KEY = 'refresh_token';

function extractData(response: any): any {
  return response?.data ?? response;
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
    if (!refreshToken || refreshToken === 'undefined' || refreshToken === 'null') {
      return null;
    }
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-token`,
      { refresh_token: refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const body = extractData(response);
    const newToken = body?.access_token || body?.token;
    if (newToken) {
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      if (__DEV__) {
        console.log('[httpService] Token refreshed successfully');
      }
      return newToken;
    }
    return null;
  } catch (e) {
    if (__DEV__) {
      console.warn('[httpService] Token refresh failed:', e);
    }
    return null;
  }
}

const createService = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use(
    async (config) => {
      const token =
        (await AsyncStorage.getItem(TOKEN_KEY)) ||
        (await AsyncStorage.getItem('token')) ||
        (await AsyncStorage.getItem('access_token'));

      if (!token || token === 'undefined' || token === 'null') {
        console.warn('[httpService] No auth token found for', config.method?.toUpperCase(), config.url);
        return config;
      }

      config.headers.Authorization = `Bearer ${token}`;
      console.log('[httpService] Attaching token to', config.method?.toUpperCase(), config.url);
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          if (__DEV__) {
            console.warn('[httpService] Refresh token failed, clearing auth');
          }
          try {
            await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY, 'user_data']);
          } catch {}
          return Promise.reject(new Error('Session expired. Please log in again.'));
        }
      }

      if (error.response?.status === 401) {
        if (__DEV__) {
          console.warn('[httpService] 401 Unauthorized for:', originalRequest?.url, originalRequest?.method);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const httpService = createService(
  process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
);
