import { authService } from "@/shared/auth.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
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

      const loginResponse = await authService.login({
        email,
        password,
      });

      const apiData = (loginResponse as any)?.data ?? loginResponse;
      const rawToken = apiData?.access_token ?? apiData?.token;
      const rawRefresh = apiData?.refresh_token;
      const token = rawToken == null ? null : String(rawToken);
      const refreshToken = rawRefresh == null ? null : String(rawRefresh);
      const userData = apiData?.user_data ?? apiData?.user;

      const user: User = {
        id: userData?.id,
        name: userData?.full_name ?? userData?.name,
        email: userData?.email,
        phone: userData?.phone,
      };

      if (!token || !refreshToken) {
        console.warn('[auth] Login response missing tokens:', loginResponse);
        Alert.alert('Login Failed', 'Authentication data missing. Please try again.');
      }

      await AsyncStorage.multiSet([
        ["auth_token", token],
        ["refresh_token", refreshToken],
        ["user_data", JSON.stringify(user)],
      ]);

      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);

      router.replace("/location-setup");
    } catch (error: any) {
      console.log("Login error:", error);

      const errorMessage = error?.message || "";

      if (errorMessage.includes("401")) {
        Alert.alert("Login Failed", "Invalid email or password");
      } else if (errorMessage.includes("400")) {
        Alert.alert("Invalid Data", "Please check your information");
      } else if (errorMessage.includes("500")) {
        Alert.alert("Server Error", "Please try again later");
      } else {
        Alert.alert("Error", "Something went wrong");
      }

      console.log("Handled error:", errorMessage);
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
      router.replace("/login");
      // Show success message
      const successMessage = response.message || "User registered successfully";

      Alert.alert("Sign Up Successful", successMessage, [
        {
          text: "OK",
          onPress: () => router.replace("/login"),
        },
      ]);
    }  catch (error: any) {
  console.log("========== REGISTER ERROR ==========");

  console.log("Full error:", error);
  console.log("Message:", error?.message);

  const errorMessage = error?.message || "";

  if (errorMessage.includes("401")) {
    console.log("401 Error: Email already exists");

    Alert.alert(
      "Registration Failed",
      "This email is already registered"
    );

  } else if (errorMessage.includes("422")) {
    console.log("422 Error: Invalid data. Please check your inputs");

    Alert.alert(
      "Registration Failed",
      "Invalid data. Please check your inputs"
    );

  } else if (errorMessage.includes("400")) {
    console.log("400 Error: Bad request");

    Alert.alert(
      "Registration Failed",
      "Invalid registration data"
    );

  } else {
    console.log("Unknown Register Error");

    Alert.alert(
      "Registration Failed",
      "Something went wrong"
    );
  }

  console.log("====================================");
} finally {
      console.log(Response);
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
