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
import { useRouter } from "expo-router";

import { EmailInput, AuthButton } from "@/features/auth/components";
import { BackIcon } from "@/components/ui/back-icon";
import { THEME, useTheme } from "@/lib/theme";
import { useRTL } from "@/lib/i18n/RTLContext";
import { authService } from "@/features/auth/services/auth.service";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) return;

    setLoading(true);

    try {
      await authService.forgotPassword({email});

      setMessage(
        "If that email exists, a reset link has been sent."
      );
    } catch {
      // Always show generic message
      setMessage(
        "If that email exists, a reset link has been sent."
      );
    }

    setLoading(false);
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: tokens.background }}
      className="flex-1"
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="px-6 py-4">

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
              Forgot Password
            </Text>
          </View>

          <View className="mb-8">
            <Text
              className="text-lg font-semibold mb-2"
              style={{ color: tokens.foreground }}
            >
              Reset your password
            </Text>

            <Text style={{ color: tokens.mutedForeground }}>
              Enter your email and we'll send you a password reset link.
            </Text>
          </View>

          <EmailInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            editable={!loading}
          />

          <AuthButton
            onPress={handleSubmit}
            loading={loading}
          >
            Send Reset Link
          </AuthButton>

          {message ? (
            <Text
              className="mt-6 text-center"
              style={{ color: tokens.primary }}
            >
              {message}
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}