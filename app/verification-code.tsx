import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerificationCodeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { email } = useLocalSearchParams<{ email: string }>();
  const tokens = THEME[theme];

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<TextInput[]>([]);

  // Focus next input when digit is entered
  const handleCodeChange = (value: string, index: number) => {
    // Clear any previous error when user starts typing
    if (error) setError("");

    if (value.length > 1) return; // Prevent multiple characters

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace to focus previous input
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Check if code is complete
  const isCodeComplete = code.every((digit) => digit !== "");

  // Auto-verify when code is complete
  useEffect(() => {
    if (isCodeComplete) {
      handleVerifyCode();
    }
  }, [isCodeComplete]);

  const handleVerifyCode = async () => {
    const verificationCode = code.join("");

    // Validate code format (should be 6 digits)
    if (!/^\d{6}$/.test(verificationCode)) {
      setError("Please enter a valid 6-digit code");
      // Reset code on error
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      return;
    }

    setLoading(true);
    setError("");

    try {
      // TODO: Implement verify code API call
      console.log("Verifying code:", verificationCode, "for email:", email);

      // Simulate API call - for demo, accept any 6-digit code
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to reset password
      router.push({
        pathname: "/reset-password",
        params: { email, code: verificationCode },
      });
    } catch (error) {
      console.error("Verification error:", error);
      setError("Invalid verification code. Please try again.");
      // Reset code on error
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // TODO: Implement resend code API call
      console.log("Resending verification code to:", email);
      alert("Verification code sent again!");
    } catch (error) {
      console.error("Resend error:", error);
      alert("Failed to resend code. Please try again.");
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
              Verify Code
            </Text>
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text
              className="text-lg font-semibold mb-2"
              style={{ color: tokens.foreground }}
            >
              Enter Verification Code
            </Text>
            <Text style={{ color: tokens.mutedForeground }}>
              We've sent a 6-digit code to {email}
            </Text>
          </View>

          {/* Code Input Fields */}
          <View className="flex-row justify-between mb-8">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                className="w-12 h-12 text-center text-xl font-bold rounded-lg border-2"
                style={{
                  backgroundColor: tokens.background,
                  borderColor: error ? tokens.destructive : tokens.border,
                  color: tokens.foreground,
                }}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                editable={!loading}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Error Message */}
          {error && (
            <View className="mb-6">
              <Text
                className="text-center text-sm"
                style={{ color: tokens.destructive }}
              >
                {error}
              </Text>
            </View>
          )}

          {/* Loading Indicator */}
          {loading && (
            <View className="mb-6">
              <Text
                className="text-center text-sm"
                style={{ color: tokens.mutedForeground }}
              >
                Verifying code...
              </Text>
            </View>
          )}

          {/* Resend Code */}
          <View className="flex-row justify-center mb-6">
            <Text style={{ color: tokens.mutedForeground }}>
              Didn't receive the code?{" "}
            </Text>
            <Pressable onPress={handleResendCode}>
              <Text className="font-semibold" style={{ color: tokens.primary }}>
                Resend
              </Text>
            </Pressable>
          </View>

          {/* Back to Login */}
          <View className="flex-row justify-center">
            <Pressable onPress={() => router.replace("/login")}>
              <Text className="font-semibold" style={{ color: tokens.primary }}>
                ← Back to Sign In
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
