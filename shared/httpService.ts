import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

async function refreshAccessToken(): Promise<string |null> {
  try {
    const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);

    console.log("Refresh Token:", refreshToken);

    if (!refreshToken) {
      return null;
    }

    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-token`,
      {
        refresh_token: refreshToken,
      }
    );

    console.log("Refresh Response:", response.data);

    const newToken = response.data?.access_token;

    if (!newToken) {
      return null;
    }

    await AsyncStorage.setItem(TOKEN_KEY, newToken);

    console.log("New Access Token Saved:", newToken);

    return newToken;
  } catch (error) {
    console.log("Refresh token failed:", error);
    return null;
  }
}

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    console.log("========== REQUEST ==========");
    console.log("URL:", `${config.baseURL}${config.url}`);
    console.log("Method:", config.method);
    console.log("Token:", token);

    if (token) {
      config.headers = {
  ...config.headers,
  Authorization: `Bearer ${token}`,
};
    }

    console.log("Headers:", config.headers);
    console.log("============================");

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log("========== RESPONSE ==========");
    console.log("URL:", response.config.url);
    console.log("Status:", response.status);
    console.log("Data:", response.data);
    console.log("=============================");

    return response;
  },

  async (error: AxiosError) => {
    console.log("========== ERROR ==========");
    console.log("URL:", error.config?.url);
    console.log("Status:", error.response?.status);
    console.log("Response:", error.response?.data);
    console.log("===========================");

    const originalRequest: any = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      console.log("401 received. Trying to refresh token...");

      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        console.log("Retrying request...");

        return api(originalRequest);
      }

      console.log("Refresh failed. Clearing storage...");

      await AsyncStorage.multiRemove([
        TOKEN_KEY,
        REFRESH_KEY,
        "user_data",
      ]);
    }

    return Promise.reject(error);
  }
);

export const httpService = {
  get: api.get,
  post: api.post,
  put: api.put,
  patch: api.patch,
  delete: api.delete,
};