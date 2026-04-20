import { useAuth } from "@/lib/auth-context";
import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
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

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});

  // Validation functions
  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  // Handle input changes with validation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  // Handle blur events
  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
  };

  const handleLogin = async () => {
    // Mark all fields as touched
    setTouched({ email: true, password: true });

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Navigation is handled by auth context
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/sign-up");
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
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
              Login
            </Text>
          </View>

          {/* Welcome Text */}
          <View className="mb-8">
            <Text
              className="text-lg font-semibold mb-2"
              style={{ color: tokens.foreground }}
            >
              Welcome Back!
            </Text>
            <Text style={{ color: tokens.mutedForeground }}>
              Sign in to access your account and enjoy personalized shopping
            </Text>
          </View>

          {/* Email Input */}
          <View className="mb-6">
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

          {/* Password Input */}
          <View className="mb-6">
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: tokens.foreground }}
            >
              Password
            </Text>
            <TextInput
              className="px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: tokens.background,
                borderColor:
                  errors.password && touched.password
                    ? tokens.destructive
                    : tokens.border,
                color: tokens.foreground,
              }}
              placeholder="Enter your password"
              placeholderTextColor={tokens.mutedForeground}
              secureTextEntry
              value={password}
              onChangeText={handlePasswordChange}
              onBlur={handlePasswordBlur}
              editable={!loading}
            />
            {errors.password && touched.password && (
              <Text
                className="text-sm mt-1"
                style={{ color: tokens.destructive }}
              >
                {errors.password}
              </Text>
            )}
          </View>

          {/* Forgot Password */}
          <Pressable className="mb-8" onPress={handleForgotPassword}>
            <Text
              className="text-sm font-medium text-right"
              style={{ color: tokens.primary }}
            >
              Forgot Password?
            </Text>
          </Pressable>

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
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
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View
              className="flex-1 h-px"
              style={{ backgroundColor: tokens.border }}
            />
            <Text
              className="px-3 text-sm"
              style={{ color: tokens.mutedForeground }}
            >
              or
            </Text>
            <View
              className="flex-1 h-px"
              style={{ backgroundColor: tokens.border }}
            />
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center">
            <Text style={{ color: tokens.mutedForeground }}>
              Don't have an account?{" "}
            </Text>
            <Pressable onPress={handleSignUp}>
              <Text className="font-semibold" style={{ color: tokens.primary }}>
                Sign Up
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
