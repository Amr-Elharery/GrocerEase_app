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
} from "@/features/auth/components";
import { useResetPasswordForm } from "@/features/auth/hooks/useFormValidation";
import { BackIcon } from "@/components/ui/back-icon";
import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";
import { authService } from "@/features/auth/services/auth.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
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
  const { isRTL } = useRTL();
  const { t } = useTranslation();

  // Form state managed by custom hook with validation
  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useResetPasswordForm();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-navigate after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.replace("/auth/login");
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
        throw new Error(t("auth.resetPassword.missingInfo"));
      }
    } catch (error) {
      console.error("Reset password error:", error);
      alert(
        error instanceof Error
          ? error.message
          : t("auth.resetPassword.failed"),
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
              <BackIcon variant="arrow" size={24} color={tokens.foreground} />
            </Pressable>
            <Text
              className={isRTL ? "text-2xl font-bold mr-3" : "text-2xl font-bold ml-3"}
              style={{ color: tokens.foreground }}
            >
              {t("auth.resetPassword.title")}
            </Text>
          </View>

          {/* Success State */}
          {success ? (
            <View className="flex-1 justify-center items-center pb-20">
              <AuthSuccess
                title={t("auth.resetPassword.successTitle")}
                message={t("auth.resetPassword.successMessage")}
              />
              <Text
                className="text-center mt-6 text-sm"
                style={{ color: tokens.mutedForeground }}
              >
                {t("auth.resetPassword.redirecting")}
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
                  {t("auth.resetPassword.createNewPassword")}
                </Text>
                <Text style={{ color: tokens.mutedForeground }}>
                  {t("auth.resetPassword.subtitle")}
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
                label={t("auth.resetPassword.newPassword")}
                placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
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
                label={t("auth.resetPassword.confirmPassword")}
                placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
                editable={!loading}
              />

              {/* Reset Button */}
              <AuthButton
                onPress={handleResetPassword}
                disabled={loading}
                loading={loading}
              >
                {t("auth.resetPassword.resetButton")}
              </AuthButton>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
