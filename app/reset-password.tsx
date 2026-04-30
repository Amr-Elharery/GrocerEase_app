/**
 * Reset Password Screen
 * Part of Authentication Feature
 *
 * Architecture: Feature-Based Design Pattern
 * - Validation logic: shared/validators.ts
 * - Form state: lib/hooks/useFormValidation.ts
 * - API calls: shared/auth.service.ts
 * - UI Components: components/domain/auth/
 */

import {
  AuthButton,
  AuthSuccess,
  PasswordInput,
} from "@/components/domain/auth";
import { useResetPasswordForm } from "@/lib/hooks/useFormValidation";
import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { authService } from "@/shared/auth.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { email, code } = useLocalSearchParams<{
    email: string;
    code: string;
  }>();
  const tokens = THEME[theme];

  // Form state managed by custom hook with validation
  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useResetPasswordForm();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-navigate after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.replace("/login");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleResetPassword = async () => {
    // Validate all fields
    if (!validateAll()) {
      return;
    }

    setLoading(true);
    try {
      // Call auth service to reset password
      if (email && code) {
        await authService.resetPassword({
          email,
          code,
          newPassword: values.newPassword,
        });
        setSuccess(true);
      } else {
        throw new Error("Missing email or verification code");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
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
              New Password
            </Text>
          </View>

          {/* Success State */}
          {success ? (
            <View className="flex-1 justify-center items-center pb-20">
              <AuthSuccess
                title="Password Reset Successful!"
                message="Your password has been updated successfully. You can now sign in with your new password."
              />
              <Text
                className="text-center mt-6 text-sm"
                style={{ color: tokens.mutedForeground }}
              >
                Redirecting to login...
              </Text>
            </View>
          ) : (
            <>
              {/* Description */}
              <View className="mb-8">
                <Text
                  className="text-lg font-semibold mb-2"
                  style={{ color: tokens.foreground }}
                >
                  Create New Password
                </Text>
                <Text style={{ color: tokens.mutedForeground }}>
                  Enter a strong password to secure your account.
                </Text>
              </View>

              {/* New Password Input */}
              <PasswordInput
                value={values.newPassword}
                onChangeText={(value: string) =>
                  handleChange("newPassword", value)
                }
                onBlur={() => handleBlur("newPassword")}
                error={touched.newPassword ? errors.newPassword : undefined}
                label="New Password"
                placeholder="Enter new password"
                editable={!loading}
              />

              {/* Confirm Password Input */}
              <PasswordInput
                value={values.confirmPassword}
                onChangeText={(value: string) =>
                  handleChange("confirmPassword", value)
                }
                onBlur={() => handleBlur("confirmPassword")}
                error={
                  touched.confirmPassword ? errors.confirmPassword : undefined
                }
                label="Confirm Password"
                placeholder="Confirm new password"
                editable={!loading}
              />

              {/* Reset Button */}
              <AuthButton
                onPress={handleResetPassword}
                disabled={loading}
                loading={loading}
              >
                Reset Password
              </AuthButton>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
