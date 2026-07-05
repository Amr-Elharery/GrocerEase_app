/**
 * Authentication Service
 * Handles all auth-related API calls and business logic
 * Separated from components following Feature-Based Design Pattern
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import httpService from "@/shared/httpService";
import type {
  AuthResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignUpPayload,
  VerifyCodePayload,
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
       

await AsyncStorage.setItem(
  "access_token",
  response.data.access_token
);

await AsyncStorage.setItem(
  "refresh_token",
  response.data.refresh_token
);

 
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
    const apiPayload = {
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
    };

    const response = await httpService.post(
      "/auth/customer/register",
      apiPayload
    );

    console.log("Signup response:", response.data);

    return response.data;

  } catch (error: any) {
    console.log("Signup API error:", error);

    throw error; // keep axios error
  }
},

  /**
   * Sign up as a delivery driver
   */
  async registerDelivery(payload: SignUpPayload): Promise<AuthResponse> {
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
  },

  /**
   * Request password reset
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<AuthResponse> {
    try {
      const response = await httpService.post("auth/forgot-password", payload);
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
      // Convert camelCase to snake_case for API
      const apiPayload = {
        current_password: payload.currentPassword,
        new_password: payload.newPassword,
      };
      const response = await httpService.post(
        "/auth/change-password",
        apiPayload,
      );
      console.log(response)
      return response.data;
    } catch (error) {
      console.log(error)
      throw handleError(error);
    }
  },
};
