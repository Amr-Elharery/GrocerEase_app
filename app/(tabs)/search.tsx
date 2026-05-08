/**
 * Search Screen
 * Part of Product Discovery Feature
 *
 * Architecture: Feature-Based Design Pattern
 * - Search service: shared/search.service.ts
 * - Hooks: lib/hooks/useSearch.ts
 * - UI Components: components/domain/search/
 *
 * Features:
 * - Autocomplete search with 200ms debounce
 * - Filter panel: categories (2-level), price range, stores, stock toggle
 * - Search results with infinite scroll
 * - Empty, error, and category suggestion states
 */

import {
  CategorySuggestion,
  EmptySearchState,
  ErrorSearchState,
  FilterBottomSheet,
  ProductCard,
  SearchBar,
  SearchSuggestions,
} from "@/components/domain/search";
import {
  useFindMatchingCategory,
  useSearchAutoComplete,
  useSearchFilterOptions,
  useSearchResults,
} from "@/lib/hooks/useSearch";
import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import type { ProductSearchFilters, ProductSearchItem } from "@/lib/types";
import { Filter } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];

  // Search state
  const {
    query,
    setQuery,
    suggestions,
    isLoading: suggestionsLoading,
  } = useSearchAutoComplete();

  // Results state
  const {
    filters,
    results,
    isLoading: resultsLoading,
    error: resultsError,
    updateFilters,
    loadMore,
    clearFilters,
    getActiveFilterCount,
    fetchResults,
  } = useSearchResults();

  // Filter options state
  const { options: filterOptions, isLoading: optionsLoading } =
    useSearchFilterOptions();

  // Category matching
  const { matchingCategory, findCategory } = useFindMatchingCategory();

  // UI state
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Handle search query change
  const handleSearchChange = useCallback(
    (text: string) => {
      setQuery(text);
      setShowSuggestions(true);
      if (text.length === 0) {
        clearFilters();
      }
    },
    [setQuery, clearFilters],
  );

  // Handle product suggestion tap
  const handleProductSelect = useCallback(
    (productName: string) => {
      setQuery(productName);
      updateFilters({ q: productName });
      setShowSuggestions(false);
      Keyboard.dismiss();
    },
    [setQuery, updateFilters],
  );

  // Handle category suggestion tap
  const handleCategorySelect = useCallback(
    (categoryId: number, categoryName?: string) => {
      updateFilters({
        sub_category_id: categoryId,
        q: "", // Clear query when selecting category
      });
      setQuery("");
      setShowSuggestions(false);
      Keyboard.dismiss();
    },
    [updateFilters, setQuery],
  );

  // Handle search submit
  const handleSearchSubmit = useCallback(async () => {
    if (query.trim().length === 0) return;

    setShowSuggestions(false);
    Keyboard.dismiss();

    // Check if query matches a category
    const matchingCat = await findCategory(query);
    if (matchingCat) {
      updateFilters({ sub_category_id: matchingCat.id, q: "" });
      setQuery("");
    } else {
      updateFilters({ q: query.trim() });
    }
  }, [query, findCategory, updateFilters, setQuery]);

  // Handle filter apply
  const handleApplyFilters = useCallback(
    (newFilters: Partial<ProductSearchFilters>) => {
      updateFilters(newFilters);
    },
    [updateFilters],
  );

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setQuery("");
    setShowSuggestions(false);
  }, [setQuery]);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    fetchResults();
  }, [fetchResults]);

  // Handle search all stores (clear filters)
  const handleSearchAllStores = useCallback(() => {
    clearFilters();
    if (query.trim().length > 0) {
      updateFilters({ q: query.trim() });
    }
  }, [clearFilters, query, updateFilters]);

  // Handle browse category suggestion
  const handleBrowseCategory = useCallback(() => {
    if (matchingCategory) {
      updateFilters({
        sub_category_id: matchingCategory.id,
        q: "",
      });
      setQuery("");
      setShowSuggestions(false);
    }
  }, [matchingCategory, updateFilters, setQuery]);

  // Handle product card tap
  const handleProductPress = useCallback((product: ProductSearchItem) => {
    // TODO: Navigate to product details
    console.log("Product pressed:", product);
  }, []);

  // Handle add to cart
  const handleAddToCart = useCallback((product: ProductSearchItem) => {
    // TODO: Add product to shopping list/cart
    console.log("Add to cart:", product);
  }, []);

  // Handle infinite scroll
  const handleEndReached = useCallback(() => {
    if (results.has_next_page && !resultsLoading) {
      loadMore();
    }
  }, [results.has_next_page, resultsLoading, loadMore]);

  const activeFilterCount = getActiveFilterCount();
  const isSearching =
    results.items.length > 0 || (query.trim().length > 0 && !showSuggestions);

  return (
    <SafeAreaView
      style={{ backgroundColor: tokens.background }}
      className="flex-1"
      edges={["top"]}
    >
      <View className="flex-1">
        {/* Search Header */}
        <View
          className="px-4 py-3 gap-2 border-b"
          style={{ borderColor: tokens.border }}
        >
          <View className="flex-row gap-2">
            <View className="flex-1">
              <SearchBar
                value={query}
                onChangeText={handleSearchChange}
                onSubmit={handleSearchSubmit}
                onClear={handleClearSearch}
                isLoading={suggestionsLoading}
                editable={!resultsLoading}
              />
            </View>

            {/* Filter Button */}
            <Pressable
              onPress={() => setShowFilterSheet(true)}
              className="p-2 rounded-lg relative"
              style={{ backgroundColor: tokens.muted }}
            >
              <Filter size={24} color={tokens.foreground} />
              {activeFilterCount > 0 && (
                <View
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                  style={{ backgroundColor: tokens.primary }}
                >
                  <Text className="text-xs font-bold text-white">
                    {activeFilterCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <SearchSuggestions
              suggestions={suggestions}
              isLoading={suggestionsLoading}
              onProductSelect={handleProductSelect}
              onCategorySelect={handleCategorySelect}
            />
          )}
        </View>

        {/* Content */}
        {isSearching ? (
          <>
            {/* Results */}
            {resultsError ? (
              <ErrorSearchState error={resultsError} onRetry={handleRetry} />
            ) : results.items.length === 0 && !resultsLoading ? (
              <View className="flex-1">
                <EmptySearchState
                  query={query}
                  onClearFilters={handleSearchAllStores}
                  onSearchAllStores={handleSearchAllStores}
                />
              </View>
            ) : (
              <>
                {/* Category Suggestion */}
                {matchingCategory && results.items.length === 0 && (
                  <CategorySuggestion
                    categoryName={matchingCategory.category_name}
                    onBrowse={handleBrowseCategory}
                  />
                )}

                {/* Search Results Grid */}
                <FlatList
                  data={results.items}
                  keyExtractor={(item) => `${item.id}`}
                  numColumns={2}
                  columnWrapperStyle={{ justifyContent: "space-between" }}
                  renderItem={({ item }) => (
                    <ProductCard
                      product={item}
                      onPress={handleProductPress}
                      onAddToCart={handleAddToCart}
                    />
                  )}
                  onEndReached={handleEndReached}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={
                    resultsLoading ? (
                      <View className="py-4 items-center w-full">
                        <ActivityIndicator
                          size="large"
                          color={tokens.primary}
                        />
                      </View>
                    ) : null
                  }
                  ListEmptyComponent={
                    !resultsLoading ? <View className="flex-1" /> : null
                  }
                  contentContainerStyle={{
                    paddingHorizontal: 4,
                    paddingVertical: 8,
                  }}
                />
              </>
            )}
          </>
        ) : (
          /* Empty State */
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg" style={{ color: tokens.mutedForeground }}>
              Start searching to find products
            </Text>
          </View>
        )}
      </View>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        onApply={handleApplyFilters}
        categories={filterOptions.categories}
        stores={filterOptions.stores}
        minPrice={filterOptions.min_price}
        maxPrice={filterOptions.max_price}
        currentFilters={filters}
      />
    </SafeAreaView>
  );
}
