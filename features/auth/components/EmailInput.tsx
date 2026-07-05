/**
 * Email Input Component for Auth Forms
 * Reusable across login, signup, forgot password
 */

import { THEME, useTheme } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { Text, TextInput, View } from "react-native";

interface EmailInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  error?: string;
  placeholder?: string;
  editable?: boolean;
}

export function EmailInput({
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  editable = true,
}: EmailInputProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { t } = useTranslation();

  return (
    <View className="mb-6">
      <Text
        className="text-sm font-medium mb-2"
        style={{ color: tokens.foreground }}
      >
        {t("auth.email")}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder ?? t("auth.emailAddressPlaceholder")}
        placeholderTextColor={tokens.mutedForeground}
        editable={editable}
        className="px-4 py-3 rounded-lg border"
        style={[
          {
            borderColor: error ? "#ef4444" : tokens.border,
            backgroundColor: tokens.input,
            color: tokens.foreground,
          },
        ]}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {error && (
        <Text className="text-xs mt-2" style={{ color: "#ef4444" }}>
          {error}
        </Text>
      )}
    </View>
  );
}
