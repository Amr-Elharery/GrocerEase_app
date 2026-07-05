/**
 * Search Empty and Error States
 */

import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";
import { AlertCircle, Search } from "lucide-react-native";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Search size={48} color={tokens.mutedForeground} className="mb-4" />
      <Text
        className="text-lg font-semibold text-center mb-2"
        style={{ color: tokens.foreground }}
      >
        {t("search.states.noResultsFor", { query })}
      </Text>
      <Text
        className="text-center mb-6"
        style={{ color: tokens.mutedForeground }}
      >
        {t("search.states.tryDifferentTerm")}
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
            {t("search.states.clearFilters")}
          </Text>
        </Pressable>
        <Pressable
          onPress={onSearchAllStores}
          className="py-3 px-4 rounded-lg"
          style={{ backgroundColor: tokens.primary }}
        >
          <Text className="text-center font-semibold text-white">
            {t("search.states.searchAllStores")}
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
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center px-6">
      <AlertCircle size={48} color={tokens.destructive} className="mb-4" />
      <Text
        className="text-lg font-semibold text-center mb-2"
        style={{ color: tokens.foreground }}
      >
        {t("common.somethingWentWrong")}
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
        <Text className="font-semibold text-white">{t("common.tryAgain")}</Text>
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
  const { isRTL } = useRTL();
  const { t } = useTranslation();

  return (
    <View
      className={isRTL ? "mx-4 p-4 rounded-lg border-r-4 mb-4" : "mx-4 p-4 rounded-lg border-l-4 mb-4"}
      style={{
        backgroundColor: tokens.muted,
        borderColor: tokens.primary,
      }}
    >
      <Text
        className="text-sm font-semibold mb-2"
        style={{ color: tokens.foreground }}
      >
        {t("search.states.didYouMean")}
      </Text>
      <Text className="text-sm mb-3" style={{ color: tokens.mutedForeground }}>
        {t("search.states.browseAll")} <Text className="font-semibold">{categoryName}</Text>{" "}
        {t("search.states.productsWord")}
      </Text>
      <Pressable
        onPress={onBrowse}
        className="py-2 px-3 rounded self-start"
        style={{ backgroundColor: tokens.primary }}
      >
        <Text className="text-sm font-semibold text-white">
          {t("search.states.browseCategory")}
        </Text>
      </Pressable>
    </View>
  );
}
