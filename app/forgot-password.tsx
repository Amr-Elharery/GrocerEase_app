import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = THEME[theme];

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean }>({});

  // Validation function
  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  // Handle input change with validation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  // Handle blur event
  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
  };

  // Auto-navigate after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push({
          pathname: "/verification-code",
          params: { email },
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, email, router]);

  const handleSendCode = async () => {
    // Mark email as touched
    setTouched({ email: true });

    // Validate email
    const emailError = validateEmail(email);
    setErrors({ email: emailError });

    if (emailError) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement send verification code API call
      console.log("Sending verification code to:", email);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (error) {
      console.error("Send code error:", error);
      alert("Failed to send verification code. Please try again.");
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
              Reset Password
            </Text>
          </View>

          {/* Success State */}
          {success ? (
            <View className="flex-1 justify-center items-center pb-20">
              <CheckCircle size={80} color={tokens.primary} strokeWidth={1.5} />
              <Text
                className="text-xl font-bold text-center mt-6"
                style={{ color: tokens.foreground }}
              >
                Email Sent Successfully!
              </Text>
              <Text
                className="text-center mt-3"
                style={{ color: tokens.mutedForeground }}
              >
                We have sent a verification code to {email}
              </Text>
              <Text
                className="text-center mt-4 text-sm"
                style={{ color: tokens.mutedForeground }}
              >
                Redirecting to verification...
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
                  Forgot Your Password?
                </Text>
                <Text style={{ color: tokens.mutedForeground }}>
                  Enter your email address and we will send you a link to reset
                  your password.
                </Text>
              </View>

              {/* Email Input */}
              <View className="mb-8">
                <Text
                  className="text-sm font-medium mb-2"
                  style={{ color: tokens.foreground }}
                >
                  Email Address
                </Text>
                <TextInput
                  className="px-4 py-3 rounded-lg border"
                  style={{
                    backgroundColor: tokens.background,
                    borderColor:
                      errors.email && touched.email
                        ? tokens.destructive
                        : tokens.border,
                    color: tokens.foreground,
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor={tokens.mutedForeground}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={handleEmailChange}
                  onBlur={handleEmailBlur}
                  editable={!loading}
                  autoCapitalize="none"
                />
                {errors.email && touched.email && (
                  <Text
                    className="text-sm mt-1"
                    style={{ color: tokens.destructive }}
                  >
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Send Code Button */}
              <Pressable
                onPress={handleSendCode}
                disabled={loading}
                className="py-4 rounded-lg mb-6"
                style={{
                  backgroundColor: tokens.primary,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <Text
                  className="text-center font-semibold text-base"
                  style={{ color: tokens.primaryForeground }}
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </Text>
              </Pressable>

              {/* Back to Login */}
              <View className="flex-row justify-center">
                <Text style={{ color: tokens.mutedForeground }}>
                  Remember your password?{" "}
                </Text>
                <Pressable onPress={() => router.back()}>
                  <Text
                    className="font-semibold"
                    style={{ color: tokens.primary }}
                  >
                    Sign In
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
