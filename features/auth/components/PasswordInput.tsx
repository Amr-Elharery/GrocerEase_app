/**
 * Password Input Component for Auth Forms
 * Supports show/hide password toggle
 */

import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";
import { Eye, EyeOff } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  error?: string;
  placeholder?: string;
  label?: string;
  editable?: boolean;
}

export function PasswordInput({
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  label,
  editable = true,
}: PasswordInputProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-6">
      <Text
        className="text-sm font-medium mb-2"
        style={{ color: tokens.foreground }}
      >
        {label ?? t("auth.signUp.password")}
      </Text>
      <View className="relative flex-row items-center">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder ?? t("auth.signUp.password")}
          placeholderTextColor={tokens.mutedForeground}
          editable={editable}
          secureTextEntry={!showPassword}
          className={isRTL ? "flex-1 px-4 py-3 rounded-lg border pl-12" : "flex-1 px-4 py-3 rounded-lg border pr-12"}
          style={[
            {
              borderColor: error ? "#ef4444" : tokens.border,
              backgroundColor: tokens.input,
              color: tokens.foreground,
            },
          ]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          className={isRTL ? "absolute left-4" : "absolute right-4"}
        >
          {showPassword ? (
            <EyeOff size={20} color={tokens.mutedForeground} />
          ) : (
            <Eye size={20} color={tokens.mutedForeground} />
          )}
        </Pressable>
      </View>
      {error && (
        <Text className="text-xs mt-2" style={{ color: "#ef4444" }}>
          {error}
        </Text>
      )}
    </View>
  );
}
