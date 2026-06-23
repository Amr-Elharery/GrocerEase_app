import { authService } from "@/shared/auth.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import * as React from 'react';
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinedDate?: string;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    full_name: string,
    email: string,
    password: string,
    phone: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from AsyncStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("auth_token");
        const storedRefreshToken = await AsyncStorage.getItem("refresh_token");
        const storedUser = await AsyncStorage.getItem("user_data");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await authService.login({
        email,
        password,
      });

      const userData = response.user_data;
      const token = response.access_token;
      const refreshToken = response.refresh_token;

      if (!token || !userData) {
        throw new Error("Invalid login response");
      }

      const user: User = {
        id: userData.id,
        name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
      };

      await AsyncStorage.multiSet([
        ["auth_token", token],
        ["refresh_token", refreshToken],
        ["user_data", JSON.stringify(user)],
      ]);

      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);

      // navigate to location setup
      router.replace("/location-setup");
    } catch (error) {
      console.log("Login error:", error);

      Alert.alert("Login Failed", "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    full_name: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string,
  ) => {
    try {
      setIsLoading(true);
      // Call signup API
      const response = await authService.signup({
        full_name,
        email,
        phone,
        password,
        confirmPassword,
      });
      console.log("Signup response:", response);

      // Show success message
      const successMessage = response.message || "User registered successfully";

      Alert.alert("Sign Up Successful", successMessage, [
        {
          text: "OK",
          onPress: () => router.replace("/login"),
        },
      ]);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // TODO: Call logout API endpoint if needed

      // Clear AsyncStorage
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("refresh_token");
      await AsyncStorage.removeItem("user_data");

      // Reset state
      setToken(null);
      setRefreshToken(null);
      setUser(null);

      // Navigate to login
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    isLoading,
    isLoggedIn: !!user && !!token,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
