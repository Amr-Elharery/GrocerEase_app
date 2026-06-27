import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const createService = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

export const httpService = createService(
  process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
);