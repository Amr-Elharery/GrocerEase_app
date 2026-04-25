import { Button } from '@/components/ui/button';
import type { ProductSearchItem, SearchCategory } from '@/lib/types';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, TriangleAlert, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAGE_LIMIT = 20;
const fallbackImage = require('../../assets/images/icon.png');
const MOCK_STORE_OPTIONS = [
  { id: 1, shop_name: 'Main Store' },
  { id: 2, shop_name: 'Downtown Store' },
  { id: 3, shop_name: 'City Mall Store' },
];

function ProductSkeleton({ list }: { list: boolean }) {
  return (
    <View className={`bg-card border border-border rounded-xl p-3 m-1 ${list ? '' : 'flex-1'}`}>
      <View className={`bg-muted rounded-lg mb-2 ${list ? 'h-24 w-24' : 'h-24 w-full'}`} />
      <View className="h-3 rounded bg-muted mb-2" />
      <View className="h-3 rounded bg-muted w-2/3 mb-2" />
      <View className="h-4 rounded bg-muted w-1/3" />
    </View>
  );
}

function ProductCard({
  item,
  list,
  onPress,
}: {
  item: ProductSearchItem;
  list: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`bg-card border border-border rounded-xl p-3 m-1 ${list ? 'flex-row' : 'flex-1'}`}
    >
      <Image
        source={item.thumbnail ? { uri: item.thumbnail } : fallbackImage}
        resizeMode="cover"
        className={`${list ? 'w-24 h-24 mr-3' : 'w-full h-24 mb-2'} rounded-lg`}
      />
      <View className={list ? 'flex-1' : ''}>
        <Text className="text-foreground font-semibold text-sm" numberOfLines={2}>
          {item.product_name}
        </Text>
        <Text className="text-muted-foreground text-xs mt-1">{item.sub_category_name}</Text>
        <Text className="text-primary font-bold mt-1">{item.cheapest_price.toFixed(2)} EGP</Text>
      </View>
    </Pressable>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isQueryFocused, setIsQueryFocused] = useState(false);
  const [categories, setCategories] = useState<SearchCategory[]>([]);
  const [stores, setStores] = useState<{ id: number; shop_name: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [selectedStoreIds, setSelectedStoreIds] = useState<number[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 0 });
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{ products: string[]; sub_categories: SearchCategory[] }>({
    products: [],
    sub_categories: [],
  });
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [items, setItems] = useState<ProductSearchItem[]>([]);
  const [allProducts, setAllProducts] = useState<ProductSearchItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategoryId) count += 1;
    if (selectedSubCategoryId) count += 1;
    if (selectedStoreIds.length) count += 1;
    if (inStockOnly) count += 1;
    if (priceRange.min > priceBounds.min || priceRange.max < priceBounds.max) count += 1;
    return count;
  }, [inStockOnly, priceBounds.max, priceBounds.min, priceRange.max, priceRange.min, selectedCategoryId, selectedStoreIds.length, selectedSubCategoryId]);

  const subCategories = useMemo(
    () => categories.filter((item) => item.parent_id !== null),
    [categories]
  );

  const rootCategories = useMemo(
    () => categories.filter((item) => item.parent_id === null),
    [categories]
  );

  const availableSubCategories = useMemo(
    () =>
      subCategories.filter((item) =>
        selectedCategoryId ? item.parent_id === selectedCategoryId : true
      ),
    [selectedCategoryId, subCategories]
  );

  const exactSubCategoryMatch = useMemo(
    () =>
      subCategories.find(
        (item) => item.category_name.trim().toLowerCase() === query.trim().toLowerCase()
      ) ?? null,
    [query, subCategories]
  );

  const suggestionOpen = useMemo(
    () =>
      isQueryFocused &&
      query.trim().length > 0 &&
      (isLoadingSuggestions ||
        suggestions.products.length > 0 ||
        suggestions.sub_categories.length > 0),
    [isLoadingSuggestions, isQueryFocused, query, suggestions.products.length, suggestions.sub_categories.length]
  );

  const loadProductsFromFakeStore = useCallback(async () => {
    setErrorMessage(null);
    setIsInitialLoading(true);
    try {
      const response = await fetch('https://fakestoreapi.com/products');
      const data = await response.json();
      const rows = Array.isArray(data) ? data : [];
      const categoryToId = new Map<string, number>();
      const categoryRecords: SearchCategory[] = [];
      let nextCategoryId = 1;

      const normalized: ProductSearchItem[] = rows.map((item: any) => {
        const categoryName = String(item?.category ?? 'Uncategorized');
        if (!categoryToId.has(categoryName)) {
          categoryToId.set(categoryName, nextCategoryId);
          categoryRecords.push({
            id: nextCategoryId,
            category_name: categoryName,
            parent_id: null,
          });
          categoryRecords.push({
            id: nextCategoryId + 1000,
            category_name: categoryName,
            parent_id: nextCategoryId,
          });
          nextCategoryId += 1;
        }
        const categoryId = categoryToId.get(categoryName) ?? 1;
        return {
          id: Number(item?.id ?? 0),
          product_name: String(item?.title ?? ''),
          sub_category_name: categoryName,
          category_id: categoryId,
          sub_category_id: categoryId + 1000,
          cheapest_price: Number(item?.price ?? 0),
          thumbnail: item?.w ? String(item.image) : null,
        };
      });

      const prices = normalized.map((item) => item.cheapest_price);
      const min = prices.length ? Math.floor(Math.min(...prices)) : 0;
      const max = prices.length ? Math.ceil(Math.max(...prices)) : 0;

      setAllProducts(normalized);
      setCategories(categoryRecords);
      setStores(MOCK_STORE_OPTIONS);
      setPriceBounds({ min, max });
      setPriceRange({ min, max });
    } catch (error: any) {
      setErrorMessage(error?.message ?? 'Failed to load products.');
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(
    async (nextPage: number, reset = false) => {
      if (!allProducts.length) {
        setItems([]);
        setHasNextPage(false);
        return;
      }
      if (!reset) setIsFetchingMore(true);

      const q = query.trim().toLowerCase();
      const filtered = allProducts.filter((item) => {
        if (q) {
          const match =
            item.product_name.toLowerCase().includes(q) ||
            item.sub_category_name.toLowerCase().includes(q);
          if (!match) return false;
        }
        if (selectedCategoryId && item.category_id !== selectedCategoryId) return false;
        if (selectedSubCategoryId && item.sub_category_id !== selectedSubCategoryId) return false;
        if (item.cheapest_price < priceRange.min || item.cheapest_price > priceRange.max) return false;
        return true;
      });

      const start = (nextPage - 1) * PAGE_LIMIT;
      const nextItems = filtered.slice(start, start + PAGE_LIMIT);
      setItems((previous) => (reset ? nextItems : [...previous, ...nextItems]));
      setPage(nextPage);
      setHasNextPage(start + PAGE_LIMIT < filtered.length);
      setIsFetchingMore(false);
    },
    [allProducts, priceRange.max, priceRange.min, query, selectedCategoryId, selectedSubCategoryId]
  );

  useEffect(() => {
    loadProductsFromFakeStore().catch(() => undefined);
  }, [loadProductsFromFakeStore]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1, true).catch(() => undefined);
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmed = query.trim();
      if (!trimmed) {
        setSuggestions({ products: [], sub_categories: [] });
        return;
      }

      setIsLoadingSuggestions(true);
      const normalized = trimmed.toLowerCase();
      const products = Array.from(
        new Set(
          allProducts
            .map((item) => item.product_name)
            .filter((name) => name.toLowerCase().includes(normalized))
        )
      ).slice(0, 8);
      const sub_categories = subCategories
        .filter((item) => item.category_name.toLowerCase().includes(normalized))
        .slice(0, 8);
      setSuggestions({ products, sub_categories });
      setIsLoadingSuggestions(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [allProducts, query, subCategories]);

  const onLoadMore = () => {
    if (isFetchingMore || isInitialLoading || !hasNextPage) return;
    fetchProducts(page + 1).catch(() => undefined);
  };

  const onSelectCategory = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId(null);
  };

  const onSelectSubCategory = (subCategoryId: number | null, parentId?: number | null) => {
    setSelectedSubCategoryId(subCategoryId);
    if (parentId) setSelectedCategoryId(parentId);
  };

  const onToggleStore = (storeId: number) => {
    setSelectedStoreIds((previous) =>
      previous.includes(storeId)
        ? previous.filter((id) => id !== storeId)
        : [...previous, storeId]
    );
  };

  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setSelectedStoreIds([]);
    setInStockOnly(false);
    setPriceRange({ min: priceBounds.min, max: priceBounds.max });
  };

  const onSearchAllStores = () => {
    setSelectedStoreIds([]);
  };

  const renderHeader = (
    <View className="px-4 pt-3 pb-2 border-b border-border bg-background relative z-10">
      <View className="flex-row items-center bg-muted border border-border rounded-lg px-3 py-2">
        <Search size={18} className="text-muted-foreground mr-2" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsQueryFocused(true)}
          onBlur={() => setTimeout(() => setIsQueryFocused(false), 120)}
          placeholder="Search products"
          placeholderTextColor="rgb(115 115 115)"
          className="flex-1 text-foreground"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')}>
            <X size={16} className="text-muted-foreground" />
          </Pressable>
        )}
      </View>

      {suggestionOpen && (
        <View className="bg-card border border-border rounded-lg mt-2 p-3">
          {isLoadingSuggestions ? (
            <Text className="text-muted-foreground text-sm">Loading suggestions...</Text>
          ) : (
            <>
              <Text className="text-foreground font-semibold mb-2">Products</Text>
              {suggestions.products.length ? (
                suggestions.products.map((name) => (
                  <Pressable
                    key={`product-${name}`}
                    className="py-2"
                    onPress={() => {
                      setQuery(name);
                      setIsQueryFocused(false);
                    }}
                  >
                    <Text className="text-foreground">{name}</Text>
                  </Pressable>
                ))
              ) : (
                <Text className="text-muted-foreground text-sm mb-2">No matching products</Text>
              )}

              <Text className="text-foreground font-semibold mt-1 mb-2">Sub-categories</Text>
              {suggestions.sub_categories.length ? (
                suggestions.sub_categories.map((category) => (
                  <Pressable
                    key={`sub-${category.id}`}
                    className="py-2"
                    onPress={() => {
                      onSelectSubCategory(category.id, category.parent_id);
                      setIsQueryFocused(false);
                    }}
                  >
                    <Text className="text-foreground">{category.category_name}</Text>
                  </Pressable>
                ))
              ) : (
                <Text className="text-muted-foreground text-sm">No matching sub-categories</Text>
              )}
            </>
          )}
        </View>
      )}

      <View className="flex-row items-center justify-between mt-3">
        <Text className="text-muted-foreground text-sm">
          {items.length} result{items.length === 1 ? '' : 's'}
        </Text>
        <Pressable
          onPress={() => setFiltersOpen(true)}
          className="flex-row items-center bg-card border border-border rounded-lg px-3 py-2"
        >
          <SlidersHorizontal size={16} className="text-foreground mr-2" />
          <Text className="text-foreground">Filters</Text>
          {activeFilterCount > 0 && (
            <View className="ml-2 min-w-5 h-5 rounded-full bg-primary items-center justify-center px-1">
              <Text className="text-primary-foreground text-xs font-semibold">{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {renderHeader}

      {errorMessage ? (
        <View className="flex-1 items-center justify-center px-5">
          <TriangleAlert size={34} className="text-destructive mb-3" />
          <Text className="text-foreground font-semibold text-base mb-2">Failed to load products</Text>
          <Text className="text-muted-foreground text-center mb-4">{errorMessage}</Text>
          <Button onPress={() => fetchProducts(1, true)}>
            <Text>Retry</Text>
          </Button>
        </View>
      ) : isInitialLoading ? (
        <ScrollView className="flex-1 px-2 pt-3">
          <View className="flex-row flex-wrap">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} list={false} />
            ))}
          </View>
        </ScrollView>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-foreground font-semibold text-base mb-2">
            No results for "{query.trim() || 'your search'}"
          </Text>
          <Text className="text-muted-foreground text-center mb-4">
            Try changing your query or clearing filters.
          </Text>
          <View className="w-full gap-3">
            <Button onPress={clearFilters} variant="outline">
              <Text>Clear filters</Text>
            </Button>
            <Button onPress={onSearchAllStores}>
              <Text>Search all stores</Text>
            </Button>
            {exactSubCategoryMatch && (
              <Button
                variant="ghost"
                onPress={() => {
                  setQuery('');
                  onSelectSubCategory(exactSubCategoryMatch.id, exactSubCategoryMatch.parent_id);
                }}
              >
                <Text>Browse all {exactSubCategoryMatch.category_name} products</Text>
              </Button>
            )}
          </View>
        </View>
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          className="flex-1 px-2 pt-3"
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              list={false}
              onPress={() => router.push({ pathname: '/product-details', params: { id: String(item.id) } })}
            />
          )}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            <View className="pt-2">
              {isFetchingMore && (
                <View className="flex-row flex-wrap">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <ProductSkeleton key={`more-${index}`} list={false} />
                  ))}
                </View>
              )}
              {!hasNextPage && items.length > 0 && (
                <Text className="text-muted-foreground text-center py-4">All products loaded</Text>
              )}
            </View>
          }
        />
      )}

      <Modal visible={filtersOpen} transparent animationType="slide" onRequestClose={() => setFiltersOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setFiltersOpen(false)}>
          <Pressable className="mt-auto bg-background rounded-t-3xl p-4" onPress={() => undefined}>
            <View className="w-12 h-1.5 bg-border rounded-full self-center mb-4" />
            <Text className="text-foreground text-lg font-semibold mb-3">Search filters</Text>

            <Text className="text-foreground font-semibold mb-2">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              <View className="flex-row gap-2">
                <Pressable
                  className={`px-3 py-2 rounded-full border ${
                    selectedCategoryId === null ? 'bg-primary border-primary' : 'bg-card border-border'
                  }`}
                  onPress={() => onSelectCategory(null)}
                >
                  <Text className={selectedCategoryId === null ? 'text-primary-foreground' : 'text-foreground'}>
                    All categories
                  </Text>
                </Pressable>
                {rootCategories.map((category) => (
                  <Pressable
                    key={category.id}
                    className={`px-3 py-2 rounded-full border ${
                      selectedCategoryId === category.id ? 'bg-primary border-primary' : 'bg-card border-border'
                    }`}
                    onPress={() => onSelectCategory(category.id)}
                  >
                    <Text
                      className={selectedCategoryId === category.id ? 'text-primary-foreground' : 'text-foreground'}
                    >
                      {category.category_name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text className="text-foreground font-semibold mb-2">Sub-category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              <View className="flex-row gap-2">
                <Pressable
                  className={`px-3 py-2 rounded-full border ${
                    selectedSubCategoryId === null ? 'bg-primary border-primary' : 'bg-card border-border'
                  }`}
                  onPress={() => onSelectSubCategory(null)}
                >
                  <Text className={selectedSubCategoryId === null ? 'text-primary-foreground' : 'text-foreground'}>
                    Any sub-category
                  </Text>
                </Pressable>
                {availableSubCategories.map((subCategory) => (
                  <Pressable
                    key={subCategory.id}
                    className={`px-3 py-2 rounded-full border ${
                      selectedSubCategoryId === subCategory.id ? 'bg-primary border-primary' : 'bg-card border-border'
                    }`}
                    onPress={() => onSelectSubCategory(subCategory.id, subCategory.parent_id)}
                  >
                    <Text
                      className={
                        selectedSubCategoryId === subCategory.id ? 'text-primary-foreground' : 'text-foreground'
                      }
                    >
                      {subCategory.category_name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text className="text-foreground font-semibold mb-2">
              Price range: {priceRange.min.toFixed(0)} - {priceRange.max.toFixed(0)} EGP
            </Text>
            <Slider
              minimumValue={priceBounds.min}
              maximumValue={priceBounds.max}
              step={1}
              value={priceRange.min}
              onValueChange={(value) =>
                setPriceRange((previous) => ({
                  ...previous,
                  min: Math.min(Number(value), previous.max),
                }))
              }
            />
            <Slider
              minimumValue={priceBounds.min}
              maximumValue={priceBounds.max}
              step={1}
              value={priceRange.max}
              onValueChange={(value) =>
                setPriceRange((previous) => ({
                  ...previous,
                  max: Math.max(Number(value), previous.min),
                }))
              }
            />

            <Text className="text-foreground font-semibold mt-3 mb-2">Stores</Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {stores.map((store) => (
                <Pressable
                  key={store.id}
                  className={`px-3 py-2 rounded-full border ${
                    selectedStoreIds.includes(store.id)
                      ? 'bg-primary border-primary'
                      : 'bg-card border-border'
                  }`}
                  onPress={() => onToggleStore(store.id)}
                >
                  <Text
                    className={
                      selectedStoreIds.includes(store.id)
                        ? 'text-primary-foreground'
                        : 'text-foreground'
                    }
                  >
                    {store.shop_name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              className={`px-3 py-3 rounded-lg mb-3 border ${
                inStockOnly ? 'border-primary bg-primary/10' : 'border-border bg-card'
              }`}
              onPress={() => setInStockOnly((current) => !current)}
            >
              <Text className="text-foreground">In stock only (active and available)</Text>
            </Pressable>

            <View className="flex-row gap-2">
              <Pressable
                className="flex-1 rounded-lg border border-border bg-card py-3 items-center"
                onPress={clearFilters}
              >
                <Text className="text-foreground">Clear</Text>
              </Pressable>
              <Pressable
                className="flex-1 rounded-lg border border-primary bg-primary py-3 items-center"
                onPress={() => setFiltersOpen(false)}
              >
                <Text className="text-primary-foreground font-semibold">Apply</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
