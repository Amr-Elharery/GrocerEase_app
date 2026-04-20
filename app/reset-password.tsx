import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react-native";
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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { email, code } = useLocalSearchParams<{
    email: string;
    code: string;
  }>();
  const tokens = THEME[theme];

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    newPassword?: boolean;
    confirmPassword?: boolean;
  }>({});

  // Validation functions
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

  // Handle input changes with validation
  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    if (touched.newPassword) {
      setErrors((prev) => ({ ...prev, newPassword: validatePassword(value) }));
    }
    // Also validate confirm password if it's been touched
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
        confirmPassword: validateConfirmPassword(value, newPassword),
      }));
    }
  };

  // Handle blur events
  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, newPassword: true }));
    setErrors((prev) => ({
      ...prev,
      newPassword: validatePassword(newPassword),
    }));
  };

  const handleConfirmPasswordBlur = () => {
    setTouched((prev) => ({ ...prev, confirmPassword: true }));
    setErrors((prev) => ({
      ...prev,
      confirmPassword: validateConfirmPassword(confirmPassword, newPassword),
    }));
  };

  // Auto-navigate after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.replace("/login");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleResetPassword = async () => {
    // Mark all fields as touched
    setTouched({ newPassword: true, confirmPassword: true });

    // Validate all fields
    const passwordError = validatePassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(
      confirmPassword,
      newPassword,
    );

    setErrors({
      newPassword: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (passwordError || confirmPasswordError) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement reset password API call with email, code, and newPassword
      console.log("Resetting password for:", email, "with code:", code);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (error) {
      console.error("Reset password error:", error);
      alert("Failed to reset password. Please try again.");
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
              New Password
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
                Password Reset Successful!
              </Text>
              <Text
                className="text-center mt-3"
                style={{ color: tokens.mutedForeground }}
              >
                Your password has been updated successfully. You can now sign in
                with your new password.
              </Text>
              <Text
                className="text-center mt-4 text-sm"
                style={{ color: tokens.mutedForeground }}
              >
                Redirecting to login...
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
                  Create New Password
                </Text>
                <Text style={{ color: tokens.mutedForeground }}>
                  Enter a strong password to secure your account.
                </Text>
              </View>

              {/* New Password Input */}
              <View className="mb-6">
                <Text
                  className="text-sm font-medium mb-2"
                  style={{ color: tokens.foreground }}
                >
                  New Password
                </Text>
                <View
                  className="flex-row items-center px-4 py-3 rounded-lg border"
                  style={{
                    backgroundColor: tokens.background,
                    borderColor:
                      errors.newPassword && touched.newPassword
                        ? tokens.destructive
                        : tokens.border,
                  }}
                >
                  <TextInput
                    className="flex-1"
                    style={{
                      color: tokens.foreground,
                    }}
                    placeholder="Enter new password"
                    placeholderTextColor={tokens.mutedForeground}
                    secureTextEntry={!showPassword}
                    value={newPassword}
                    onChangeText={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    editable={!loading}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="ml-2"
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={tokens.mutedForeground} />
                    ) : (
                      <Eye size={20} color={tokens.mutedForeground} />
                    )}
                  </Pressable>
                </View>
                {errors.newPassword && touched.newPassword && (
                  <Text
                    className="text-sm mt-1"
                    style={{ color: tokens.destructive }}
                  >
                    {errors.newPassword}
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
                <View
                  className="flex-row items-center px-4 py-3 rounded-lg border"
                  style={{
                    backgroundColor: tokens.background,
                    borderColor:
                      errors.confirmPassword && touched.confirmPassword
                        ? tokens.destructive
                        : tokens.border,
                  }}
                >
                  <TextInput
                    className="flex-1"
                    style={{
                      color: tokens.foreground,
                    }}
                    placeholder="Confirm new password"
                    placeholderTextColor={tokens.mutedForeground}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    onBlur={handleConfirmPasswordBlur}
                    editable={!loading}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="ml-2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={tokens.mutedForeground} />
                    ) : (
                      <Eye size={20} color={tokens.mutedForeground} />
                    )}
                  </Pressable>
                </View>
                {errors.confirmPassword && touched.confirmPassword && (
                  <Text
                    className="text-sm mt-1"
                    style={{ color: tokens.destructive }}
                  >
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>

              {/* Reset Button */}
              <Pressable
                onPress={handleResetPassword}
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
                  {loading ? "Resetting..." : "Reset Password"}
                </Text>
              </Pressable>
 gi
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
