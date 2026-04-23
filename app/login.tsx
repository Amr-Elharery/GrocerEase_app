/**
 * Login Screen
 * Part of Authentication Feature
 *
 * Architecture: Feature-Based Design Pattern
 * - Validation logic: shared/validators.ts
 * - Form state: lib/hooks/useFormValidation.ts
 * - Auth context: lib/auth-context.tsx
 * - UI Components: components/domain/auth/
 */

import {
  AuthButton,
  EmailInput,
  PasswordInput,
} from "@/components/domain/auth";
import { useAuth } from "@/lib/auth-context";
import { useLoginForm } from "@/lib/hooks/useFormValidation";
import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { login } = useAuth();

  // Form state managed by custom hook with validation
  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useLoginForm();

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validate all fields
    if (!validateAll()) {
      return;
    }

    setLoading(true);
    try {
      await login(values.email, values.password);
      // Navigation is handled by auth context
    } catch (error) {
      console.error("Login error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/sign-up");
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: tokens.background }}
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 py-4">
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={24} color={tokens.foreground} />
            </Pressable>
            <Text
              className="text-2xl font-bold ml-3"
              style={{ color: tokens.foreground }}
            >
              Login
            </Text>
          </View>

          {/* Welcome Text */}
          <View className="mb-8">
            <Text
              className="text-lg font-semibold mb-2"
              style={{ color: tokens.foreground }}
            >
              Welcome Back!
            </Text>
            <Text style={{ color: tokens.mutedForeground }}>
              Sign in to access your account and enjoy personalized shopping
            </Text>
          </View>

          {/* Email Input */}
          <EmailInput
            value={values.email}
            onChangeText={(value: string) => handleChange("email", value)}
            onBlur={() => handleBlur("email")}
            error={touched.email ? errors.email : undefined}
            placeholder="Enter your email"
            editable={!loading}
          />

          {/* Password Input */}
          <PasswordInput
            value={values.password}
            onChangeText={(value: string) => handleChange("password", value)}
            onBlur={() => handleBlur("password")}
            error={touched.password ? errors.password : undefined}
            placeholder="Enter your password"
            editable={!loading}
          />

          {/* Forgot Password */}
          <Pressable className="mb-8" onPress={handleForgotPassword}>
            <Text
              className="text-sm font-medium text-right"
              style={{ color: tokens.primary }}
            >
              Forgot Password?
            </Text>
          </Pressable>

          {/* Login Button */}
          <AuthButton
            onPress={handleLogin}
            disabled={loading}
            loading={loading}
          >
            Sign In
          </AuthButton>

          {/* Divider */}
          <View className="flex-row items-center mb-6 mt-8">
            <View
              className="flex-1 h-px"
              style={{ backgroundColor: tokens.border }}
            />
            <Text
              className="px-3 text-sm"
              style={{ color: tokens.mutedForeground }}
            >
              or
            </Text>
            <View
              className="flex-1 h-px"
              style={{ backgroundColor: tokens.border }}
            />
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center">
            <Text style={{ color: tokens.mutedForeground }}>
              Don't have an account?{" "}
            </Text>
            <Pressable onPress={handleSignUp}>
              <Text className="font-semibold" style={{ color: tokens.primary }}>
                Sign Up
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
