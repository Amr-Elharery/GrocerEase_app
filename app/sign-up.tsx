/**
 * Sign Up Screen
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
  TextInputField,
} from "@/components/domain/auth";
import { useAuth } from "@/lib/auth-context";
import { useSignUpForm } from "@/lib/hooks/useFormValidation";
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

export default function SignUpScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { signup } = useAuth();

  // Form state managed by custom hook with validation
  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useSignUpForm();

  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // Validate all fields
    if (!validateAll()) {
      return;
    }

    setLoading(true);
    try {
      await signup(values.fullName, values.email, values.password);
      // Navigation is handled by auth context
    } catch (error) {
      console.error("Sign up error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Sign up failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/login");
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
              Sign Up
            </Text>
          </View>

          {/* Welcome Text */}
          <View className="mb-8">
            <Text
              className="text-lg font-semibold mb-2"
              style={{ color: tokens.foreground }}
            >
              Create Account
            </Text>
            <Text style={{ color: tokens.mutedForeground }}>
              Join us to enjoy personalized shopping and exclusive deals
            </Text>
          </View>

          {/* Full Name Input */}
          <TextInputField
            value={values.fullName}
            onChangeText={(value: string) => handleChange("fullName", value)}
            onBlur={() => handleBlur("fullName")}
            error={touched.fullName ? errors.fullName : undefined}
            label="Full Name"
            placeholder="Enter your full name"
            editable={!loading}
          />

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
            label="Password"
            placeholder="Create a password"
            editable={!loading}
          />

          {/* Confirm Password Input */}
          <PasswordInput
            value={values.confirmPassword}
            onChangeText={(value: string) =>
              handleChange("confirmPassword", value)
            }
            onBlur={() => handleBlur("confirmPassword")}
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
            label="Confirm Password"
            placeholder="Confirm your password"
            editable={!loading}
          />

          {/* Sign Up Button */}
          <AuthButton
            onPress={handleSignUp}
            disabled={loading}
            loading={loading}
          >
            Create Account
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

          {/* Login Link */}
          <View className="flex-row justify-center">
            <Text style={{ color: tokens.mutedForeground }}>
              Already have an account?{" "}
            </Text>
            <Pressable onPress={handleLogin}>
              <Text className="font-semibold" style={{ color: tokens.primary }}>
                Sign In
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
