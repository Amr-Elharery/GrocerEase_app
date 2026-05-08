/**
 * Search Empty and Error States
 */

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { AlertCircle, Search } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface EmptySearchStateProps {
  query: string;
  onClearFilters: () => void;
  onSearchAllStores: () => void;
}

export function EmptySearchState({
  query,
  onClearFilters,
  onSearchAllStores,
}: EmptySearchStateProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Search size={48} color={tokens.mutedForeground} className="mb-4" />
      <Text
        className="text-lg font-semibold text-center mb-2"
        style={{ color: tokens.foreground }}
      >
        No results for "{query}"
      </Text>
      <Text
        className="text-center mb-6"
        style={{ color: tokens.mutedForeground }}
      >
        Try searching for a different term or adjusting your filters
      </Text>

      <View className="gap-3 w-full">
        <Pressable
          onPress={onClearFilters}
          className="py-3 px-4 rounded-lg border"
          style={{ borderColor: tokens.primary }}
        >
          <Text
            className="text-center font-semibold"
            style={{ color: tokens.primary }}
          >
            Clear Filters
          </Text>
        </Pressable>
        <Pressable
          onPress={onSearchAllStores}
          className="py-3 px-4 rounded-lg"
          style={{ backgroundColor: tokens.primary }}
        >
          <Text className="text-center font-semibold text-white">
            Search All Stores
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

interface ErrorSearchStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorSearchState({ error, onRetry }: ErrorSearchStateProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];

  return (
    <View className="flex-1 items-center justify-center px-6">
      <AlertCircle size={48} color={tokens.destructive} className="mb-4" />
      <Text
        className="text-lg font-semibold text-center mb-2"
        style={{ color: tokens.foreground }}
      >
        Something went wrong
      </Text>
      <Text
        className="text-center mb-6 text-sm"
        style={{ color: tokens.mutedForeground }}
      >
        {error}
      </Text>

      <Pressable
        onPress={onRetry}
        className="py-3 px-6 rounded-lg"
        style={{ backgroundColor: tokens.primary }}
      >
        <Text className="font-semibold text-white">Try Again</Text>
      </Pressable>
    </View>
  );
}

interface CategorySuggestionProps {
  categoryName: string;
  onBrowse: () => void;
}

export function CategorySuggestion({
  categoryName,
  onBrowse,
}: CategorySuggestionProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];

  return (
    <View
      className="mx-4 p-4 rounded-lg border-l-4 mb-4"
      style={{
        backgroundColor: tokens.muted,
        borderColor: tokens.primary,
      }}
    >
      <Text
        className="text-sm font-semibold mb-2"
        style={{ color: tokens.foreground }}
      >
        Did you mean?
      </Text>
      <Text className="text-sm mb-3" style={{ color: tokens.mutedForeground }}>
        Browse all <Text className="font-semibold">{categoryName}</Text>{" "}
        products
      </Text>
      <Pressable
        onPress={onBrowse}
        className="py-2 px-3 rounded self-start"
        style={{ backgroundColor: tokens.primary }}
      >
        <Text className="text-sm font-semibold text-white">
          Browse Category
        </Text>
      </Pressable>
    </View>
  );
}
