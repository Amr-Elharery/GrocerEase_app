/**
 * Text Input Component for Auth Forms
 * Generic text input for various fields
 */

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { Text, TextInput, View } from "react-native";

interface TextInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  error?: string;
  placeholder?: string;
  label?: string;
  editable?: boolean;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "decimal-pad"
    | "phone-pad";
}

export function TextInputField({
  value,
  onChangeText,
  onBlur,
  error,
  placeholder = "",
  label,
  editable = true,
  keyboardType = "default",
}: TextInputFieldProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];

  return (
    <View className="mb-6">
      {label && (
        <Text
          className="text-sm font-medium mb-2"
          style={{ color: tokens.foreground }}
        >
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={tokens.mutedForeground}
        editable={editable}
        keyboardType={keyboardType}
        className="px-4 py-3 rounded-lg border"
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
      {error && (
        <Text className="text-xs mt-2" style={{ color: "#ef4444" }}>
          {error}
        </Text>
      )}
    </View>
  );
}
