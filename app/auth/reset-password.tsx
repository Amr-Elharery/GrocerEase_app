 import * as React from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  PasswordInput,
  AuthButton,
} from "@/features/auth/components";

import { BackIcon } from "@/components/ui/back-icon";
import { THEME, useTheme } from "@/lib/theme";
import { useRTL } from "@/lib/i18n/RTLContext";
import { authService } from "@/features/auth/services/auth.service";

export default function ResetPasswordScreen() {
  const router = useRouter();

  const { token } = useLocalSearchParams<{ token: string }>();

  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!token) {
      alert("Invalid or missing reset token.");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        token,
        newPassword,
      });

      alert("Password updated successfully.");

      router.replace("/auth/login");
    } catch (error: any) {
      alert(
        error?.message ||
          "This reset link is invalid or has expired."
      );

      router.replace("/auth/forgot-password");
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
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="flex-1 px-6 py-4">

          {/* Header */}
          <View className="flex-row items-center mb-8">
            <Pressable onPress={() => router.back()}>
              <BackIcon
                variant="arrow"
                size={24}
                color={tokens.foreground}
              />
            </Pressable>

            <Text
              className={
                isRTL
                  ? "text-2xl font-bold mr-3"
                  : "text-2xl font-bold ml-3"
              }
              style={{ color: tokens.foreground }}
            >
              Reset Password
            </Text>
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text
              className="text-lg font-semibold mb-2"
              style={{ color: tokens.foreground }}
            >
              Create New Password
            </Text>

            <Text style={{ color: tokens.mutedForeground }}>
              Enter your new password below.
            </Text>
          </View>

          {/* New Password */}
          <PasswordInput
          label={"New Password"}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New Password"
            editable={!loading}
          />

          {/* Confirm Password */}
          <PasswordInput
          label={"Confirm Password"}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            editable={!loading}
          />

          {/* Button */}
          <AuthButton
            onPress={handleResetPassword}
            loading={loading}
          >
            Update Password
          </AuthButton>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}