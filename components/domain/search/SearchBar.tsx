/**
 * Search Bar Component
 * Auto-complete enabled search input with suggestions
 */

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { Search, X } from "lucide-react-native";
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
  placeholder = "Search products...",
  editable = true,
}: SearchBarProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];

  return (
    <View
      className="flex-row items-center px-3 py-2 rounded-lg border"
      style={{
        backgroundColor: tokens.input,
        borderColor: tokens.border,
      }}
    >
      <Search size={20} color={tokens.mutedForeground} />
      <TextInput
        className="flex-1 ml-2 text-base"
        style={{ color: tokens.foreground }}
        placeholder={placeholder}
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
