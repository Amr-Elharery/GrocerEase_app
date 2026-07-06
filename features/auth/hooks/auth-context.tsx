import { authService } from "@/features/auth/services/auth.service";
import type { AuthContextType, User } from "@/features/auth/types";
import httpService from "@/shared/httpService";
import { useAddress } from "@/features/addresses/hooks/addressContext";
import { useToast } from "@/lib/toast/useToast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { refreshAddresses, selectAddress } = useAddress();
  const toast = useToast();
  const { t } = useTranslation();

  // Initialize auth state from AsyncStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("auth_token");
        const storedRefreshToken = await AsyncStorage.getItem("refresh_token");
        const storedUser = await AsyncStorage.getItem("user_data");

        if (storedToken) {
          setToken(storedToken);
          // Also ensure httpService has the header for immediate use
          try {
            httpService.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
          } catch {}
        }

        if (storedRefreshToken) setRefreshToken(storedRefreshToken);
        if (storedUser) setUser(JSON.parse(storedUser));
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

      const rawRoles: string[] = Array.isArray(userData?.roles)
        ? userData.roles
        : userData?.role
          ? [userData.role]
          : [];

      const user: User = {
        id: userData?.id,
        name: userData?.full_name ?? userData?.name,
        email: userData?.email,
        phone: userData?.phone,
        role: rawRoles[0],
      };

      if (!token || !refreshToken) {
        console.warn("[auth] Login response missing tokens:", loginResponse);
        Alert.alert(
          t("auth.login.failedTitle"),
          t("auth.login.missingAuthData"),
        );
      }

      const toSet: [string, string][] = [];
      if (token) toSet.push(["auth_token", token]);
      if (refreshToken) toSet.push(["refresh_token", refreshToken]);
      if (user) toSet.push(["user_data", JSON.stringify(user)]);

      if (toSet.length > 0) {
        await AsyncStorage.multiSet(toSet as [string, string][]);
      }

      if (token) {
        setToken(token);
        try {
          httpService.defaults.headers.common.Authorization = `Bearer ${token}`;
        } catch {}
      }
      if (refreshToken) setRefreshToken(refreshToken);
      if (user) setUser(user);

      if (rawRoles.includes("delivery")) {
        router.replace("/driver");
      } else {
        const addrs = await refreshAddresses();
        if (addrs.length === 0) {
          router.replace("/location-permission");
        } else {
          const preferred = addrs.find((a) => a.is_default) ?? addrs[0];
          if (preferred?.id) selectAddress(preferred.id);
          router.replace("/(tabs)");
        }
      }
    } catch (error: any) {
      console.log("Login error:", error);

      const errorMessage = error?.message || "";

      if (errorMessage.includes("401")) {
        Alert.alert(t("auth.login.failedTitle"), t("auth.login.invalidCredentials"));
      } else if (errorMessage.includes("400")) {
        Alert.alert(t("auth.login.invalidDataTitle"), t("auth.login.checkInformation"));
      } else if (errorMessage.includes("500")) {
        Alert.alert(t("auth.login.serverErrorTitle"), t("auth.login.tryAgainLater"));
      } else {
        Alert.alert(t("common.error"), t("common.somethingWentWrong"));
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
      toast(response.message || t("auth.signUp.accountCreated"), "success");
      router.replace("/auth/login");
    } catch (error: any) {
      console.log("========== REGISTER ERROR ==========");

      console.log("Full error:", error);
      console.log("Message:", error?.message);

      const errorMessage = error?.message || "";

      if (errorMessage.includes("401")) {
        console.log("401 Error: Email already exists");

        Alert.alert(t("auth.signUp.failedTitle"), t("auth.signUp.emailAlreadyRegistered"));
      } else if (errorMessage.includes("422")) {
        console.log("422 Error: Invalid data. Please check your inputs");

        Alert.alert(
          t("auth.signUp.failedTitle"),
          t("auth.signUp.invalidDataCheckInputs"),
        );
      } else if (errorMessage.includes("400")) {
        console.log("400 Error: Bad request");

        Alert.alert(t("auth.signUp.failedTitle"), t("auth.signUp.invalidRegistrationData"));
      } else {
        console.log("Unknown Register Error");

        Alert.alert(t("auth.signUp.failedTitle"), t("common.somethingWentWrong"));
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
      await AsyncStorage.multiRemove([
        "auth_token",
        "refresh_token",
        "user_data",
      ]);
      try {
        delete httpService.defaults.headers.common.Authorization;
      } catch {}

      // Reset state
      setToken(null);
      setRefreshToken(null);
      setUser(null);

      // Navigate to welcome page
      router.replace("/welcome");
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
