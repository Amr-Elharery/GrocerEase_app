import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { BackIcon } from "@/components/ui/back-icon";
import { useTranslation } from "react-i18next";

import {
  EmailInput,
  PasswordInput,
  TextInputField,
} from "@/features/auth/components";
import { authService } from "@/features/auth/services/auth.service";
import { useSignUpForm } from "@/features/auth/hooks/useFormValidation";
import { useRTL } from "@/lib/i18n/RTLContext";
import { useToast } from "@/lib/toast/useToast";
import { THEME, useTheme } from "@/lib/theme";

export default function DriverRegisterScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const toast = useToast();

  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useSignUpForm();

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!validateAll()) return;

    try {
      setLoading(true);
      const response = await authService.registerDelivery({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      toast(response.message || t("driver.register.success"), "success");
      router.replace("/auth/login");
    } catch (error: any) {
      toast(
        error?.response?.data?.detail ||
          error?.message ||
          t("driver.register.failed"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: tokens.background }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 py-4">
          <View className="flex-row items-center mb-8">
            <Pressable onPress={() => router.back()}>
              <BackIcon variant="arrow" size={24} color={tokens.foreground} />
            </Pressable>
            <Text
              className={isRTL ? "text-2xl font-bold mr-3" : "text-2xl font-bold ml-3"}
              style={{ color: tokens.foreground }}
            >
              {t("driver.register.title")}
            </Text>
          </View>

          <Text className="mb-6" style={{ color: tokens.mutedForeground }}>
            {t("driver.register.subtitle")}
          </Text>

          <TextInputField
            value={values.full_name}
            onChangeText={(value: string) => handleChange("full_name", value)}
            onBlur={() => handleBlur("full_name")}
            error={touched.full_name ? errors.full_name : undefined}
            label={t("auth.signUp.fullName")}
            placeholder={t("auth.signUp.fullNamePlaceholder")}
            editable={!loading}
          />

          <TextInputField
            value={values.phone}
            onChangeText={(value: string) => {
              const formatted = value.replace(/[^\d+]/g, "");
              handleChange("phone", formatted);
            }}
            onBlur={() => handleBlur("phone" as Parameters<typeof handleBlur>[0])}
            error={touched.phone ? errors.phone : undefined}
            label={t("auth.signUp.phoneNumber")}
            placeholder="+201012345678"
            keyboardType="phone-pad"
            editable={!loading}
          />

          <EmailInput
            value={values.email}
            onChangeText={(value: string) => handleChange("email", value)}
            onBlur={() => handleBlur("email")}
            error={touched.email ? errors.email : undefined}
            placeholder={t("auth.signUp.emailPlaceholder")}
            editable={!loading}
          />

          <PasswordInput
            value={values.password}
            onChangeText={(value: string) => handleChange("password", value)}
            onBlur={() => handleBlur("password")}
            error={touched.password ? errors.password : undefined}
            label={t("auth.signUp.password")}
            placeholder={t("auth.signUp.passwordPlaceholder")}
            editable={!loading}
          />

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

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            className="py-4 rounded-2xl items-center mt-4"
            style={{ backgroundColor: loading ? tokens.muted : tokens.primary }}
          >
            {loading ? (
              <ActivityIndicator color={tokens.primaryForeground} />
            ) : (
              <Text
                className="text-lg font-bold"
                style={{ color: tokens.primaryForeground }}
              >
                {t("driver.register.registerButton")}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
