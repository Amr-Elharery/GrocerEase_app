/**
 * Search Bar Component
 * Auto-complete enabled search input with suggestions
 */

import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";
import { Search, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  editable?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  isLoading = false,
  placeholder,
  editable = true,
}: SearchBarProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();
  const { t } = useTranslation();

  return (
    <View
      className={isRTL ? "flex-row-reverse items-center px-3 py-2 rounded-lg border" : "flex-row items-center px-3 py-2 rounded-lg border"}
      style={{
        backgroundColor: tokens.input,
        borderColor: tokens.border,
      }}
    >
      <Search size={20} color={tokens.mutedForeground} />
      <TextInput
        className={isRTL ? "flex-1 mr-2 text-base" : "flex-1 ml-2 text-base"}
        style={{ color: tokens.foreground }}
        placeholder={placeholder ?? t("home.header.searchProducts")}
        placeholderTextColor={tokens.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        editable={editable && !isLoading}
        returnKeyType="search"
      />
      {isLoading ? (
        <ActivityIndicator size="small" color={tokens.primary} />
      ) : value ? (
        <Pressable onPress={onClear} className="p-1">
          <X size={20} color={tokens.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  );
}
