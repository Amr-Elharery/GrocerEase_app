import axios from 'axios';

const createService = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  // Interceptors
  return instance;
};

export const httpService = createService('https://api.example.com');