/**
 * Search Filter Bottom Sheet
 * Two-level category picker, price slider, store multi-select, stock toggle
 */

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import type {
  ProductSearchFilters,
  SearchCategory,
  SearchStore,
} from "@/lib/types";
import Slider from "@react-native-community/slider";
import { ChevronDown, X } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: Partial<ProductSearchFilters>) => void;
  categories: SearchCategory[];
  stores: SearchStore[];
  minPrice: number;
  maxPrice: number;
  currentFilters: ProductSearchFilters;
}

export function FilterBottomSheet({
  visible,
  onClose,
  onApply,
  categories,
  stores,
  minPrice,
  maxPrice,
  currentFilters,
}: FilterBottomSheetProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];

  // State for filters in modal
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    currentFilters.category_id,
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<
    number | undefined
  >(currentFilters.sub_category_id);
  const [priceMin, setPriceMin] = useState(
    currentFilters.min_price || minPrice,
  );
  const [priceMax, setPriceMax] = useState(
    currentFilters.max_price || maxPrice,
  );
  const [selectedStores, setSelectedStores] = useState<number[]>(
    currentFilters.store_ids || [],
  );
  const [inStockOnly, setInStockOnly] = useState(
    currentFilters.in_stock || false,
  );

  const handleApply = () => {
    onApply({
      category_id: selectedCategory,
      sub_category_id: selectedSubCategory,
      min_price: priceMin !== minPrice ? priceMin : undefined,
      max_price: priceMax !== maxPrice ? priceMax : undefined,
      store_ids: selectedStores.length > 0 ? selectedStores : undefined,
      in_stock: inStockOnly,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategory(undefined);
    setSelectedSubCategory(undefined);
    setPriceMin(minPrice);
    setPriceMax(maxPrice);
    setSelectedStores([]);
    setInStockOnly(false);
  };

  const parentCategories = categories.filter((c) => c.parent_id === null);
  const selectedParent = parentCategories.find(
    (c) => c.id === selectedCategory,
  );
  const subCategories = selectedParent?.subcategories || [];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: tokens.background }}
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: tokens.border }}
        >
          <Text
            className="text-lg font-bold"
            style={{ color: tokens.foreground }}
          >
            Filters
          </Text>
          <Pressable onPress={onClose}>
            <X size={24} color={tokens.foreground} />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {/* Category Picker */}
          <View className="mb-6">
            <Text
              className="text-sm font-semibold mb-2"
              style={{ color: tokens.foreground }}
            >
              Category
            </Text>
            <FlatList
              scrollEnabled={false}
              data={parentCategories}
              keyExtractor={(item) => `cat-${item.id}`}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setSelectedCategory(
                      selectedCategory === item.id ? undefined : item.id,
                    );
                    setSelectedSubCategory(undefined);
                  }}
                  className="py-2 px-3 rounded mb-2 flex-row items-center justify-between"
                  style={{
                    backgroundColor:
                      selectedCategory === item.id
                        ? tokens.primary
                        : tokens.muted,
                  }}
                >
                  <Text
                    style={{
                      color:
                        selectedCategory === item.id
                          ? "white"
                          : tokens.foreground,
                    }}
                  >
                    {item.category_name}
                  </Text>
                  <ChevronDown
                    size={16}
                    color={
                      selectedCategory === item.id ? "white" : tokens.foreground
                    }
                  />
                </Pressable>
              )}
            />

            {/* Sub-categories */}
            {subCategories.length > 0 && (
              <View className="ml-3 mt-2">
                <Text
                  className="text-xs font-semibold mb-2"
                  style={{ color: tokens.mutedForeground }}
                >
                  Sub-categories
                </Text>
                <FlatList
                  scrollEnabled={false}
                  data={subCategories}
                  keyExtractor={(item) => `subcat-${item.id}`}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() =>
                        setSelectedSubCategory(
                          selectedSubCategory === item.id ? undefined : item.id,
                        )
                      }
                      className="py-2 px-3 rounded mb-1"
                      style={{
                        backgroundColor:
                          selectedSubCategory === item.id
                            ? tokens.primary
                            : tokens.muted,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            selectedSubCategory === item.id
                              ? "white"
                              : tokens.foreground,
                        }}
                      >
                        {item.category_name}
                      </Text>
                    </Pressable>
                  )}
                />
              </View>
            )}
          </View>

          {/* Price Range Slider */}
          <View className="mb-6">
            <Text
              className="text-sm font-semibold mb-2"
              style={{ color: tokens.foreground }}
            >
              Price Range
            </Text>
            <View className="flex-row justify-between mb-2">
              <Text style={{ color: tokens.mutedForeground }}>
                ${priceMin.toFixed(2)}
              </Text>
              <Text style={{ color: tokens.mutedForeground }}>
                ${priceMax.toFixed(2)}
              </Text>
            </View>

            <Slider
              style={{ height: 40 }}
              minimumValue={minPrice}
              maximumValue={maxPrice}
              step={1}
              value={priceMin}
              onValueChange={setPriceMin}
              minimumTrackTintColor={tokens.primary}
              maximumTrackTintColor={tokens.border}
            />
            <Slider
              style={{ height: 40 }}
              minimumValue={minPrice}
              maximumValue={maxPrice}
              step={1}
              value={priceMax}
              onValueChange={setPriceMax}
              minimumTrackTintColor={tokens.primary}
              maximumTrackTintColor={tokens.border}
            />
          </View>

          {/* Store Multi-select */}
          <View className="mb-6">
            <Text
              className="text-sm font-semibold mb-2"
              style={{ color: tokens.foreground }}
            >
              Stores
            </Text>
            <FlatList
              scrollEnabled={false}
              data={stores}
              keyExtractor={(item) => `store-${item.id}`}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setSelectedStores((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id],
                    );
                  }}
                  className="flex-row items-center py-2 px-3 rounded mb-2"
                  style={{
                    backgroundColor: selectedStores.includes(item.id)
                      ? tokens.primary
                      : tokens.muted,
                  }}
                >
                  <View
                    className="w-5 h-5 rounded border-2 mr-2"
                    style={{
                      borderColor: selectedStores.includes(item.id)
                        ? "white"
                        : tokens.border,
                      backgroundColor: selectedStores.includes(item.id)
                        ? tokens.primary
                        : "transparent",
                    }}
                  />
                  <Text
                    style={{
                      color: selectedStores.includes(item.id)
                        ? "white"
                        : tokens.foreground,
                    }}
                  >
                    {item.shop_name}
                  </Text>
                </Pressable>
              )}
            />
          </View>

          {/* Stock Toggle */}
          <View
            className="flex-row items-center justify-between mb-6 p-3 rounded"
            style={{ backgroundColor: tokens.muted }}
          >
            <Text style={{ color: tokens.foreground }}>In Stock Only</Text>
            <Switch
              value={inStockOnly}
              onValueChange={setInStockOnly}
              trackColor={{ false: tokens.border, true: tokens.primary }}
            />
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View
          className="flex-row gap-2 px-4 py-3 border-t"
          style={{ borderColor: tokens.border }}
        >
          <Pressable
            onPress={handleReset}
            className="flex-1 py-3 rounded-lg border"
            style={{ borderColor: tokens.border }}
          >
            <Text
              className="text-center font-semibold"
              style={{ color: tokens.primary }}
            >
              Reset
            </Text>
          </Pressable>
          <Pressable
            onPress={handleApply}
            className="flex-1 py-3 rounded-lg"
            style={{ backgroundColor: tokens.primary }}
          >
            <Text className="text-center font-semibold text-white">
              Apply Filters
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
