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
import * as React from 'react';
import {
  AuthButton,
  EmailInput,
  PasswordInput,
} from "@/features/auth/components";
import { useAuth } from "@/features/auth/hooks/auth-context";
import { useLoginForm } from "@/features/auth/hooks/useFormValidation";
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

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();
  const { t } = useTranslation();
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
  console.log("start login");

  const result = await login(values.email, values.password);



} catch (error) {
  console.log("login error", error);

  alert(
    error instanceof Error
      ? error.message
      : t("auth.login.failed")
  );
}
  };

  const handleSignUp = () => {
    router.push("/auth/sign-up");
  };

  const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
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
              {t("auth.login.title")}
            </Text>
          </View>

          {/* Welcome Text */}
          <View className="mb-8">
            <Text
              className="text-lg font-semibold mb-2"
              style={{ color: tokens.foreground }}
            >
              {t("auth.login.welcomeBack")}
            </Text>
            <Text style={{ color: tokens.mutedForeground }}>
              {t("auth.login.subtitle")}
            </Text>
          </View>

          {/* Email Input */}
          <EmailInput
            value={values.email}
            onChangeText={(value: string) => handleChange("email", value)}
            onBlur={() => handleBlur("email")}
            error={touched.email ? errors.email : undefined}
            placeholder={t("auth.login.emailPlaceholder")}
            editable={!loading}
          />

          {/* Password Input */}
          <PasswordInput
            value={values.password}
            onChangeText={(value: string) => handleChange("password", value)}
            onBlur={() => handleBlur("password")}
            error={touched.password ? errors.password : undefined}
            placeholder={t("auth.login.passwordPlaceholder")}
            editable={!loading}
          />

          {/* Forgot Password */}
          <Pressable className="mb-8" onPress={handleForgotPassword}>
            <Text
              className={isRTL ? "text-sm font-medium text-left" : "text-sm font-medium text-right"}
              style={{ color: tokens.primary }}
            >
              {t("auth.login.forgotPassword")}
            </Text>
          </Pressable>

          {/* Login Button */}
          <AuthButton
            onPress={handleLogin}
            disabled={loading}
            loading={loading}
          >
            {t("auth.login.signIn")}
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

          {/* Sign Up Link */}
          <View className="flex-row justify-center">
            <Text style={{ color: tokens.mutedForeground }}>
              {t("auth.login.noAccount")}
            </Text>
            <Pressable onPress={handleSignUp}>
              <Text className="font-semibold" style={{ color: tokens.primaryForeground }}>
                {t("auth.login.signUp")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
