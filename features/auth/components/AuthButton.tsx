/**
 * Auth Button Component
 * Reusable button for auth forms with loading state
 */

import { THEME, useTheme } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { Pressable, Text } from "react-native";

interface AuthButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: string;
  variant?: "primary" | "secondary" | "outline";
}

export function AuthButton({
  onPress,
  loading = false,
  disabled = false,
  children,
  variant = "primary",
}: AuthButtonProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { t } = useTranslation();

  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: tokens.secondary,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: tokens.border,
        };
      default:
        return {
          backgroundColor: tokens.primary,
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "outline":
        return {
          color: tokens.foreground,
        };
      default:
        return {
          color: "#ffffff",
        };
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className="py-3 px-6 rounded-lg items-center justify-center"
      style={[
        getButtonStyle(),
        {
          opacity: isDisabled ? 0.5 : 1,
        },
      ]}
    >
      <Text
        className="font-semibold text-base"
        style={getTextStyle()}
        numberOfLines={1}
      >
        {loading ? t("common.loading") : children}
      </Text>
    </Pressable>
  );
}
