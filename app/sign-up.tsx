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

export default function SignUpScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { signup } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    fullName?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  // Validation functions
  const validateFullName = (name: string) => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2)
      return "Full name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(name.trim()))
      return "Full name can only contain letters and spaces";
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password))
      return "Password must contain at least one number";
    return "";
  };

  const validateConfirmPassword = (
    confirmPassword: string,
    password: string,
  ) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const handleFullNameChange = (value: string) => {
    setFullName(value);
    if (touched.fullName) {
      setErrors((prev) => ({ ...prev, fullName: validateFullName(value) }));
    }
  };

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

    if (touched.confirmPassword && confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(confirmPassword, value),
      }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, password),
      }));
    }
  };

  const handleFullNameBlur = () => {
    setTouched((prev) => ({ ...prev, fullName: true }));
    setErrors((prev) => ({ ...prev, fullName: validateFullName(fullName) }));
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
  };

  const handleConfirmPasswordBlur = () => {
    setTouched((prev) => ({ ...prev, confirmPassword: true }));
    setErrors((prev) => ({
      ...prev,
      confirmPassword: validateConfirmPassword(confirmPassword, password),
    }));
  };

  const handleSignUp = async () => {
     
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

  
    const fullNameError = validateFullName(fullName);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(
      confirmPassword,
      password,
    );

    setErrors({
      fullName: fullNameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (fullNameError || emailError || passwordError || confirmPasswordError) {
      return;
    }

    setLoading(true);
    try {
      await signup(fullName, email, password);
       
    } catch (error) {
      console.error("Sign up error:", error);
      alert("Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/login");
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
              Sign Up
            </Text>
          </View>

          {/* Welcome Text */}
          <View className="mb-8">
            <Text
              className="text-lg font-semibold mb-2"
              style={{ color: tokens.foreground }}
            >
              Create Account
            </Text>
            <Text style={{ color: tokens.mutedForeground }}>
              Join us to enjoy personalized shopping and exclusive deals
            </Text>
          </View>

          {/* Full Name Input */}
          <View className="mb-6">
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: tokens.foreground }}
            >
              Full Name
            </Text>
            <TextInput
              className="px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: tokens.background,
                borderColor:
                  errors.fullName && touched.fullName
                    ? tokens.destructive
                    : tokens.border,
                color: tokens.foreground,
              }}
              placeholder="Enter your full name"
              placeholderTextColor={tokens.mutedForeground}
              value={fullName}
              onChangeText={handleFullNameChange}
              onBlur={handleFullNameBlur}
              editable={!loading}
            />
            {errors.fullName && touched.fullName && (
              <Text
                className="text-sm mt-1"
                style={{ color: tokens.destructive }}
              >
                {errors.fullName}
              </Text>
            )}
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
              placeholder="Create a password"
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

          {/* Confirm Password Input */}
          <View className="mb-8">
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: tokens.foreground }}
            >
              Confirm Password
            </Text>
            <TextInput
              className="px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: tokens.background,
                borderColor:
                  errors.confirmPassword && touched.confirmPassword
                    ? tokens.destructive
                    : tokens.border,
                color: tokens.foreground,
              }}
              placeholder="Confirm your password"
              placeholderTextColor={tokens.mutedForeground}
              secureTextEntry
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              onBlur={handleConfirmPasswordBlur}
              editable={!loading}
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <Text
                className="text-sm mt-1"
                style={{ color: tokens.destructive }}
              >
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          {/* Sign Up Button */}
          <Pressable
            onPress={handleSignUp}
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
              {loading ? "Creating Account..." : "Create Account"}
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

          {/* Login Link */}
          <View className="flex-row justify-center">
            <Text style={{ color: tokens.mutedForeground }}>
              Already have an account?{" "}
            </Text>
            <Pressable onPress={handleLogin}>
              <Text className="font-semibold" style={{ color: tokens.primary }}>
                Sign In
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
