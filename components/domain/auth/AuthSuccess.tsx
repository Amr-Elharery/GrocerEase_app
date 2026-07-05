/**
 * Auth Success Message Component
 * Displays success message after auth operations
 */

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { CheckCircle } from "lucide-react-native";
import { Text, View } from "react-native";

interface AuthSuccessProps {
  title: string;
  message: string;
}

export function AuthSuccess({ title, message }: AuthSuccessProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];

  return (
    <View className="items-center justify-center py-8">
      <CheckCircle size={64} color={tokens.primary} className="mb-4" />
      <Text
        className="text-xl font-bold text-center mb-2"
        style={{ color: tokens.foreground }}
      >
        {title}
      </Text>
      <Text
        className="text-center text-sm"
        style={{ color: tokens.mutedForeground }}
      >
        {message}
      </Text>
    </View>
  );
}
