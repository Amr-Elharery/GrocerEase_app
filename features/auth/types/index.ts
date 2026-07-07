export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export interface VerifyCodePayload {
  email: string;
  code: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
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

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinedDate?: string;
  avatar?: string;
  role?: string;
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
    phone: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, newPassword: string) => Promise<any>;
}