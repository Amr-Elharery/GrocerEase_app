/**
 * Search Suggestions Dropdown
 * Shows product and category suggestions
 */

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import type { ProductSearchSuggestionResponse } from "@/lib/types";
import { Folder, Package } from "lucide-react-native";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

interface SearchSuggestionsProps {
  suggestions: ProductSearchSuggestionResponse;
  isLoading: boolean;
  onProductSelect: (productName: string) => void;
  onCategorySelect: (categoryId: number, categoryName: string) => void;
}

export function SearchSuggestions({
  suggestions,
  isLoading,
  onProductSelect,
  onCategorySelect,
}: SearchSuggestionsProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];

  if (
    !suggestions.products.length &&
    !suggestions.sub_categories.length &&
    !isLoading
  ) {
    return null;
  }

  return (
    <View
      className="rounded-lg border mt-2 max-h-80"
      style={{
        backgroundColor: tokens.background,
        borderColor: tokens.border,
      }}
    >
      {isLoading ? (
        <View className="py-4 items-center">
          <ActivityIndicator color={tokens.primary} />
        </View>
      ) : (
        <FlatList
          scrollEnabled={false}
          data={[
            ...suggestions.products.map((p) => ({ type: "product", value: p })),
            ...suggestions.sub_categories.map((c) => ({
              type: "category",
              value: c,
            })),
          ]}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          renderItem={({ item }) => (
            <>
              {item.type === "product" ? (
                <Pressable
                  onPress={() => onProductSelect(item.value)}
                  className="flex-row items-center px-3 py-2 border-b"
                  style={{ borderColor: tokens.border }}
                >
                  <Package size={16} color={tokens.mutedForeground} />
                  <Text
                    className="ml-2 text-sm flex-1"
                    style={{ color: tokens.foreground }}
                  >
                    {item.value}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() =>
                    onCategorySelect(item.value.id, item.value.category_name)
                  }
                  className="flex-row items-center px-3 py-2 border-b"
                  style={{ borderColor: tokens.border }}
                >
                  <Folder size={16} color={tokens.primary} />
                  <View className="ml-2 flex-1">
                    <Text
                      className="text-xs"
                      style={{ color: tokens.mutedForeground }}
                    >
                      Sub-category
                    </Text>
                    <Text
                      className="text-sm font-medium"
                      style={{ color: tokens.foreground }}
                    >
                      {item.value.category_name}
                    </Text>
                  </View>
                </Pressable>
              )}
            </>
          )}
        />
      )}
    </View>
  );
}
