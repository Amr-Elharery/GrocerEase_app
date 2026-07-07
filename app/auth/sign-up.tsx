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
import * as React from 'react';
import {
  AuthButton,
  EmailInput,
  PasswordInput,
  TextInputField,
} from "@/features/auth/components";
import { useAuth } from "@/features/auth/hooks/auth-context";
import { useSignUpForm } from "@/features/auth/hooks/useFormValidation";
import { BackIcon } from "@/components/ui/back-icon";
import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
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
  const { isRTL } = useRTL();
  const { t } = useTranslation();
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
      await signup(
        values.full_name,
        values.email,
        values.phone,
        values.password,
        values.confirmPassword,
      );
    } catch (error) {
      console.error("Sign up error:", error);
      alert(
        error instanceof Error
          ? error.message
          : t("auth.signUp.failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/auth/login");
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
              {t("auth.signUp.title")}
            </Text>
          </View>

          {/* Welcome Text */}
          <View className="mb-8">
            <Text
              className="text-lg font-semibold mb-2"
              style={{ color: tokens.foreground }}
            >
              {t("auth.signUp.createAccount")}
            </Text>
            <Text style={{ color: tokens.mutedForeground }}>
              {t("auth.signUp.subtitle")}
            </Text>
          </View>

          {/* Full Name Input */}
          <TextInputField
            value={values.full_name}
            onChangeText={(value: string) => handleChange("full_name", value)}
            onBlur={() => handleBlur("full_name")}
            error={touched.full_name ? errors.full_name : undefined}
            label={t("auth.signUp.fullName")}
            placeholder={t("auth.signUp.fullNamePlaceholder")}
            editable={!loading}
          />
           {/* Phone Input */}
<View>
  <TextInputField
    value={values.phone}
    onChangeText={(value: string) => {
      // allow any country code + numbers only
      const formatted = value.replace(/[^\d+]/g, "");

      handleChange("phone", formatted);
    }}
    onBlur={() =>
      handleBlur("phone" as Parameters<typeof handleBlur>[0])
    }
    error={touched.phone ? errors.phone : undefined}
    label={t("auth.signUp.phoneNumber")}
    placeholder="+201012345678"
    keyboardType="phone-pad"
    editable={!loading}
  />


</View>
          {/* Email Input */}
          <EmailInput
            value={values.email}
            onChangeText={(value: string) => handleChange("email", value)}
            onBlur={() => handleBlur("email")}
            error={touched.email ? errors.email : undefined}
            placeholder={t("auth.signUp.emailPlaceholder")}
            editable={!loading}
          />

          {/* Password Input */}
          <PasswordInput
            value={values.password}
            onChangeText={(value: string) => handleChange("password", value)}
            onBlur={() => handleBlur("password")}
            error={touched.password ? errors.password : undefined}
            label={t("auth.signUp.password")}
            placeholder={t("auth.signUp.passwordPlaceholder")}
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
            label={t("auth.signUp.confirmPassword")}
            placeholder={t("auth.signUp.confirmPasswordPlaceholder")}
            editable={!loading}
          />
          {/* Sign Up Button */}
          <AuthButton
            onPress={handleSignUp}
            disabled={loading}
            loading={loading}
          >
            {t("auth.signUp.createAccount")}
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
              {t("common.or")}
            </Text>
            <View
              className="flex-1 h-px"
              style={{ backgroundColor: tokens.border }}
            />
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center">
            <Text style={{ color: tokens.mutedForeground }}>
              {t("auth.signUp.haveAccount")}
            </Text>
            <Pressable onPress={handleLogin}>
              <Text className="font-semibold" style={{ color: tokens.primary }}>
                {t("auth.signUp.signIn")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
