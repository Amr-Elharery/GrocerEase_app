import { BackIcon } from "@/components/ui/back-icon";
import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";
import { authService } from "@/features/auth/services/auth.service";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useTranslation } from "react-i18next";
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
  const { isRTL } = useRTL();
  const { t } = useTranslation();

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
    if (!password) return t("auth.changePassword.currentRequired");
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return t("auth.changePassword.newRequired");
    if (password.length < 8) return t("auth.changePassword.minLength");
    if (!/(?=.*[a-z])/.test(password))
      return t("auth.changePassword.needLowercase");
    if (!/(?=.*[A-Z])/.test(password))
      return t("auth.changePassword.needUppercase");
    if (!/(?=.*\d)/.test(password))
      return t("auth.changePassword.needNumber");
    return "";
  };

  const validateConfirmPassword = (
    confirmPassword: string,
    password: string,
  ) => {
    if (!confirmPassword) return t("auth.changePassword.confirmRequired");
    if (confirmPassword !== password) return t("auth.changePassword.mismatch");
    return "";
  };

  const validatePasswordNotSame = (
    newPassword: string,
    currentPassword: string,
  ) => {
    if (newPassword === currentPassword) {
      return t("auth.changePassword.samePassword");
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
         alert(response.message || t("auth.changePassword.successMessage"));
         setCurrentPassword("");
         setNewPassword("");
         setConfirmPassword("");
         setTouched({});
         setErrors({});
         router.back();
       } else {
        alert(
          response.message || t("auth.changePassword.failed"),
        );
      }
    } catch (error) {
      console.error("Change password error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("auth.changePassword.failed");
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
              <BackIcon variant="arrow" size={24} color={tokens.foreground} />
            </Pressable>
            <Text
              className={isRTL ? "text-2xl font-bold mr-3" : "text-2xl font-bold ml-3"}
              style={{ color: tokens.foreground }}
            >
              {t("auth.changePassword.title")}
            </Text>
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text
              className="text-lg font-semibold mb-2"
              style={{ color: tokens.foreground }}
            >
              {t("auth.changePassword.subtitle")}
            </Text>
            <Text style={{ color: tokens.mutedForeground }}>
              {t("auth.changePassword.description")}
            </Text>
          </View>

          {/* Current Password Input */}
          <View className="mb-6">
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: tokens.foreground }}
            >
              {t("auth.changePassword.currentPassword")}
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
                placeholder={t("auth.changePassword.currentPasswordPlaceholder")}
                placeholderTextColor={tokens.mutedForeground}
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={handleCurrentPasswordChange}
                onBlur={handleCurrentPasswordBlur}
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                className={isRTL ? "mr-2" : "ml-2"}
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
              {t("auth.changePassword.newPassword")}
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
                placeholder={t("auth.changePassword.newPasswordPlaceholder")}
                placeholderTextColor={tokens.mutedForeground}
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={handlePasswordChange}
                onBlur={handlePasswordBlur}
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowNewPassword(!showNewPassword)}
                className={isRTL ? "mr-2" : "ml-2"}
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
              {t("auth.changePassword.confirmNewPassword")}
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
                placeholder={t("auth.changePassword.confirmPasswordPlaceholder")}
                placeholderTextColor={tokens.mutedForeground}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                onBlur={handleConfirmPasswordBlur}
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className={isRTL ? "mr-2" : "ml-2"}
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
              {loading ? t("auth.changePassword.updating") : t("auth.changePassword.changeButton")}
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
              {t("auth.changePassword.requirementsTitle")}
            </Text>
            <Text className="text-sm" style={{ color: tokens.mutedForeground }}>
              {t("auth.changePassword.requirementsList")}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
