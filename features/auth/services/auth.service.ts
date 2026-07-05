/**
 * Authentication Service
 * Handles all auth-related API calls and business logic
 * Separated from components following Feature-Based Design Pattern
 */

import httpService from "@/shared/httpService";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  AuthResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignUpPayload,
} from "@/features/auth/types";

/**
 * Handle API errors
 */
function handleError(error: any): Error {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "An error occurred during authentication";

  return new Error(message);
}

/**
 * Auth service for handling authentication operations
 */
export const authService = {
  /**
   * Login user with email and password
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await httpService.post("/auth/login", payload);

      await AsyncStorage.setItem("access_token", response.data.access_token);

      await AsyncStorage.setItem("refresh_token", response.data.refresh_token);

      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * Customer registration
   */
  async signup(payload: SignUpPayload): Promise<AuthResponse> {
    try {
      const apiPayload = {
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        confirmPassword: payload.confirmPassword,
      };

      const response = await httpService.post(
        "/auth/customer/register",
        apiPayload,
      );

      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * Delivery registration
   */
  async registerDelivery(payload: SignUpPayload): Promise<AuthResponse> {
    try {
      const apiPayload = {
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        confirmPassword: payload.confirmPassword,
      };

      const response = await httpService.post(
        "/auth/delivery/register",
        apiPayload,
      );

      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * Forgot Password
   * POST /auth/mobile/forgot-password
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<AuthResponse> {
    try {
      const response = await httpService.post(
        "/auth/web/forgot-password",
        payload,
      );

      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * Reset Password
   * POST /auth/reset-password
   *
   * Body:
   * {
   *   token: string;
   *   newPassword: string;
   * }
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<AuthResponse> {
    try {
      const response = await httpService.post("/auth/reset-password", payload);

      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * Change Password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<AuthResponse> {
    try {
      const apiPayload = {
        current_password: payload.currentPassword,
        new_password: payload.newPassword,
      };

      const response = await httpService.post(
        "/auth/change-password",
        apiPayload,
      );

      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};
