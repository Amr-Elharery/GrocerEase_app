import axios from 'axios';

const createService = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  return instance;
};

export const httpService = createService(
  process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
);