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
import { ArrowLeft } from "lucide-react-native";

import {
  EmailInput,
  PasswordInput,
  TextInputField,
} from "@/components/domain/auth";
import { authService } from "@/shared/auth.service";
import { useSignUpForm } from "@/lib/hooks/useFormValidation";
import { useToast } from "@/lib/hooks/useToast";
import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";

export default function DriverRegisterScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
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

      toast(response.message || "Registered successfully. Please log in.", "success");
      router.replace("/login");
    } catch (error: any) {
      toast(
        error?.response?.data?.detail ||
          error?.message ||
          "Registration failed. Please try again.",
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
              <ArrowLeft size={24} color={tokens.foreground} />
            </Pressable>
            <Text
              className="text-2xl font-bold ml-3"
              style={{ color: tokens.foreground }}
            >
              Driver Registration
            </Text>
          </View>

          <Text className="mb-6" style={{ color: tokens.mutedForeground }}>
            Sign up to start delivering with Zad
          </Text>

          <TextInputField
            value={values.full_name}
            onChangeText={(value: string) => handleChange("full_name", value)}
            onBlur={() => handleBlur("full_name")}
            error={touched.full_name ? errors.full_name : undefined}
            label="Full Name"
            placeholder="Enter your full name"
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
            label="Phone Number"
            placeholder="+201012345678"
            keyboardType="phone-pad"
            editable={!loading}
          />

          <EmailInput
            value={values.email}
            onChangeText={(value: string) => handleChange("email", value)}
            onBlur={() => handleBlur("email")}
            error={touched.email ? errors.email : undefined}
            placeholder="Enter your email"
            editable={!loading}
          />

          <PasswordInput
            value={values.password}
            onChangeText={(value: string) => handleChange("password", value)}
            onBlur={() => handleBlur("password")}
            error={touched.password ? errors.password : undefined}
            label="Password"
            placeholder="Create a password"
            editable={!loading}
          />

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
                Register as Driver
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
