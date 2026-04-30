/**
 * Authentication Service
 * Handles all auth-related API calls and business logic
 * Separated from components following Feature-Based Design Pattern
 */

import { httpService } from "./httpService";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyCodePayload {
  email: string;
  code: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: any;
  };
}

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
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * Sign up new user
   */
  async signup(payload: SignUpPayload): Promise<AuthResponse> {
    try {
      const response = await httpService.post("/auth/signup", payload);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * Request password reset
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<AuthResponse> {
    try {
      const response = await httpService.post("/auth/forgot-password", payload);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * Verify reset code
   */
  async verifyResetCode(payload: VerifyCodePayload): Promise<AuthResponse> {
    try {
      const response = await httpService.post("/auth/verify-code", payload);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * Reset password with verification code
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
   * Change password for authenticated user
   */
  async changePassword(payload: ChangePasswordPayload): Promise<AuthResponse> {
    try {
      const response = await httpService.post("/auth/change-password", payload);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
};
