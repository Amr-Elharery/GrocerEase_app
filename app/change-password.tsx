import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { authService } from "@/shared/auth.service";
import { useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
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

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = THEME[theme];

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    currentPassword?: boolean;
    newPassword?: boolean;
    confirmPassword?: boolean;
  }>({});

  // Validation functions
  const validateCurrentPassword = (password: string) => {
    if (!password) return "Current password is required";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "New password is required";
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
    if (!confirmPassword) return "Please confirm your new password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const validatePasswordNotSame = (
    newPassword: string,
    currentPassword: string,
  ) => {
    if (newPassword === currentPassword) {
      return "New password must be different from current password";
    }
    return "";
  };

  // Handle input changes with validation
  const handleCurrentPasswordChange = (value: string) => {
    setCurrentPassword(value);
    if (touched.currentPassword) {
      setErrors((prev) => ({
        ...prev,
        currentPassword: validateCurrentPassword(value),
      }));
    }
  };

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
  const handleCurrentPasswordBlur = () => {
    setTouched((prev) => ({ ...prev, currentPassword: true }));
    setErrors((prev) => ({
      ...prev,
      currentPassword: validateCurrentPassword(currentPassword),
    }));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, newPassword: true }));
    const passwordError = validatePassword(newPassword);
    const samePasswordError = validatePasswordNotSame(
      newPassword,
      currentPassword,
    );
    setErrors((prev) => ({
      ...prev,
      newPassword: passwordError || samePasswordError,
    }));
  };

  const handleConfirmPasswordBlur = () => {
    setTouched((prev) => ({ ...prev, confirmPassword: true }));
    setErrors((prev) => ({
      ...prev,
      confirmPassword: validateConfirmPassword(confirmPassword, newPassword),
    }));
  };

  const handleChangePassword = async () => {
    // Mark all fields as touched
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    // Validate all fields
    const currentPasswordError = validateCurrentPassword(currentPassword);
    const passwordError = validatePassword(newPassword);
    const samePasswordError = validatePasswordNotSame(
      newPassword,
      currentPassword,
    );
    const confirmPasswordError = validateConfirmPassword(
      confirmPassword,
      newPassword,
    );

    setErrors({
      currentPassword: currentPasswordError,
      newPassword: passwordError || samePasswordError,
      confirmPassword: confirmPasswordError,
    });

    if (
      currentPasswordError ||
      passwordError ||
      samePasswordError ||
      confirmPasswordError
    ) {
      return;
    }

    setLoading(true);
    try {
      // Call the change password API
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
      });
          
if (response.success) {
         alert(response.message || "Password changed successfully!");
         setCurrentPassword("");
         setNewPassword("");
         setConfirmPassword("");
         setTouched({});
         setErrors({});
         router.back();
       } else {
        alert(
          response.message || "Failed to change password. Please try again.",
        );
      }
    } catch (error) {
      console.error("Change password error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to change password. Please try again.";
      alert(errorMessage);
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
              Change Password
            </Text>
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text
              className="text-lg font-semibold mb-2"
              style={{ color: tokens.foreground }}
            >
              Update Your Password
            </Text>
            <Text style={{ color: tokens.mutedForeground }}>
              Enter your current password and set a new, strong password for
              your account.
            </Text>
          </View>

          {/* Current Password Input */}
          <View className="mb-6">
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: tokens.foreground }}
            >
              Current Password
            </Text>
            <View
              className="flex-row items-center px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: tokens.background,
                borderColor:
                  errors.currentPassword && touched.currentPassword
                    ? tokens.destructive
                    : tokens.border,
              }}
            >
              <TextInput
                className="flex-1"
                style={{
                  color: tokens.foreground,
                }}
                placeholder="Enter your current password"
                placeholderTextColor={tokens.mutedForeground}
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={handleCurrentPasswordChange}
                onBlur={handleCurrentPasswordBlur}
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                className="ml-2"
              >
                {showCurrentPassword ? (
                  <EyeOff size={20} color={tokens.mutedForeground} />
                ) : (
                  <Eye size={20} color={tokens.mutedForeground} />
                )}
              </Pressable>
            </View>
            {errors.currentPassword && touched.currentPassword && (
              <Text
                className="text-sm mt-1"
                style={{ color: tokens.destructive }}
              >
                {errors.currentPassword}
              </Text>
            )}
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
                placeholder="Enter your new password"
                placeholderTextColor={tokens.mutedForeground}
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={handlePasswordChange}
                onBlur={handlePasswordBlur}
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowNewPassword(!showNewPassword)}
                className="ml-2"
              >
                {showNewPassword ? (
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
              Confirm New Password
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
                placeholder="Confirm your new password"
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

          {/* Change Password Button */}
          <Pressable
            onPress={handleChangePassword}
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
              {loading ? "Updating..." : "Change Password"}
            </Text>
          </Pressable>

          {/* Info Box */}
          <View
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: tokens.muted,
              borderColor: tokens.border,
            }}
          >
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: tokens.foreground }}
            >
              Password Requirements:
            </Text>
            <Text className="text-sm" style={{ color: tokens.mutedForeground }}>
              • At least 8 characters{"\n"}• One uppercase letter{"\n"}• One
              lowercase letter{"\n"}• One number
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
