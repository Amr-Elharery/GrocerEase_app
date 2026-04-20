import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

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
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from AsyncStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("auth_token");
        const storedUser = await AsyncStorage.getItem("user_data");

        if (storedToken && storedUser) {
          setToken(storedToken);
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
      // TODO: Replace with actual API call
      console.log("Login attempt:", { email, password });

      // Simulate API response
      const mockToken = "mock_token_" + Date.now();
      const mockUser: User = {
        id: "user_123",
        name: "John Doe",
        email: email,
        phone: "+1 (555) 123-4567",
        joinedDate: "January 2024",
      };

      // Store in AsyncStorage
      await AsyncStorage.setItem("auth_token", mockToken);
      await AsyncStorage.setItem("user_data", JSON.stringify(mockUser));

      // Update state
      setToken(mockToken);
      setUser(mockUser);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      console.log("Signup attempt:", { fullName, email, password });

      // Simulate API response
      const mockToken = "mock_token_" + Date.now();
      const mockUser: User = {
        id: "user_" + Date.now(),
        name: fullName,
        email: email,
        joinedDate: new Date().toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        }),
      };

      // Store in AsyncStorage
      await AsyncStorage.setItem("auth_token", mockToken);
      await AsyncStorage.setItem("user_data", JSON.stringify(mockUser));

      // Update state
      setToken(mockToken);
      setUser(mockUser);
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
      await AsyncStorage.removeItem("user_data");

      // Reset state
      setToken(null);
      setUser(null);

      // Navigate to login
      router.replace("/login");
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
