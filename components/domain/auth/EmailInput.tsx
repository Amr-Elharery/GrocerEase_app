/**
 * Email Input Component for Auth Forms
 * Reusable across login, signup, forgot password
 */

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
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
  placeholder = "Email address",
  editable = true,
}: EmailInputProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];

  return (
    <View className="mb-6">
      <Text
        className="text-sm font-medium mb-2"
        style={{ color: tokens.foreground }}
      >
        Email
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
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
