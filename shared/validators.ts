/**
 * Shared validation helpers for the application
 * These are reusable across multiple features
 */

export const validators = {
  /**
   * Validates email format
   */
  email: (email: string): string => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  },

  /**
   * Validates password for login (minimum requirements)
   */
  passwordLogin: (password: string): string => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  },

  /**
   * Validates password for signup/reset (strong requirements)
   * - At least 8 characters
   * - Lowercase letter
   * - Uppercase letter
   * - Number
   */
  passwordStrong: (password: string): string => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password))
      return "Password must contain at least one number";
    return "";
  },

  /**
   * Validates that passwords match
   */
  passwordMatch: (confirmPassword: string, password: string): string => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  },

  /**
   * Validates full name
   * - At least 2 characters
   * - Only letters and spaces
   */
  fullName: (name: string): string => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2)
      return "Full name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(name.trim()))
      return "Full name can only contain letters and spaces";
    return "";
  },

  /**
   * Validates verification code format
   * - 6 digits
   */
  verificationCode: (code: string): string => {
    if (!code) return "Verification code is required";
    if (!/^\d{6}$/.test(code.replace(/\s/g, "")))
      return "Verification code must be 6 digits";
    return "";
  },
};

/**
 * Type for form field errors
 */
export type ValidationErrors<T extends Record<string, any>> = Partial<
  Record<keyof T, string>
>;

/**
 * Type for touched fields tracking
 */
export type TouchedFields<T extends Record<string, any>> = Partial<
  Record<keyof T, boolean>
>;
