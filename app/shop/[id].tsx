import { CartConflictModal } from "@/components/domain/CartConflictModal";
import { ProductCard } from "@/components/domain/product-card";
import { THEME } from "@/lib/theme";
import { useCart } from "@/lib/context/cartContext";
import { useTheme } from "@/lib/theme-context";
import type { ProductDisplay, ShopDisplay } from "@/lib/types";
import { shopService } from "@/shared/shop.service";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Search, ShoppingCart, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 20;

export default function ShopProductsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { shopId, addItem, clearCart, conflictAddItem, cartCount } =
    useCart();

  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<ProductDisplay | null>(null);
  const [shop, setShop] = useState<ShopDisplay | null>(null);
  const [productsByShop, setProductsByShop] = useState<ProductDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadShopData = async () => {
      setIsLoading(true);
      try {
        const shopIdNum = parseInt(id);
        const shopResult = await shopService.getShops().then((shops) =>
          shops.find((s) => s.id === shopIdNum)
        );
        setShop(shopResult ?? null);

        const { products } = await shopService.getShopProducts(
          shopIdNum,
          PAGE_SIZE,
          0,
        );
        setProductsByShop(products);
        setOffset(products.length);
        setHasMore(products.length === PAGE_SIZE);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadShopData();
  }, [id]);

  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;
    setIsLoadingMore(true);
    try {
      const shopIdNum = parseInt(id);
      const { products } = await shopService.getShopProducts(
        shopIdNum,
        PAGE_SIZE,
        offset,
      );
      setProductsByShop((prev) => [...prev, ...products]);
      setOffset((prev) => prev + products.length);
      setHasMore(products.length === PAGE_SIZE);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [id, isLoadingMore, hasMore, isLoading, offset]);

  const cartShop = useMemo(() => {
    if (!shopId) return null;
    return shop;
  }, [shopId, shop]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return productsByShop;
    return productsByShop.filter((product) =>
      product.product_name.toLowerCase().includes(q),
    );
  }, [productsByShop, searchQuery]);

  const handleProductPress = useCallback(
    (product: ProductDisplay) => {
      router.push({
        pathname: "/shop-product/[id]",
        params: { id: String(product.id), product: JSON.stringify(product) },
      });
    },
    [router],
  );

  const handleAddToCart = useCallback(
    (product: ProductDisplay) => {
      const canAdd = !shopId || shopId === product.shop_id;
      if (!canAdd) {
        setPendingProduct(product);
        setShowConflictModal(true);
        return;
      }
      addItem(product);
      Alert.alert("Success", "Added to cart successfully");
    },
    [addItem, shopId]
  );

  const handleConfirmConflict = useCallback(() => {
    if (pendingProduct) {
      clearCart();
      conflictAddItem(pendingProduct);
      Alert.alert("Success", "Added to cart successfully");
    }
    setShowConflictModal(false);
    setPendingProduct(null);
  }, [pendingProduct, clearCart, conflictAddItem]);

  const handleCancelConflict = useCallback(() => {
    setShowConflictModal(false);
    setPendingProduct(null);
  }, []);

  

  if (isLoading) {
    return (
       
        <SafeAreaView
          className="flex-1 bg-background"
          edges={["top"]}
          style={{ backgroundColor: tokens.background }}
        >
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={tokens.primary} />
          </View>
        </SafeAreaView>
     
    );
  }

  if (!shop) {
    return (
      
        <SafeAreaView
          className="flex-1 bg-background"
          edges={["top"]}
          style={{ backgroundColor: tokens.background }}
        >
          <View className="flex-1 items-center justify-center">
            <Text className="text-foreground">Shop not found</Text>
          </View>
        </SafeAreaView>
  
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: shop.shop_name }} />


        <SafeAreaView
          className="flex-1 bg-background"
          edges={["top"]}
          style={{ backgroundColor: tokens.background }}
        >
          <View className="flex-1 px-4 pt-4">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: tokens.muted }}
              >
                <ChevronLeft size={22} color={tokens.foreground} />
              </TouchableOpacity>

              <Text
                className="text-lg font-bold flex-1 mx-2"
                numberOfLines={1}
                style={{ color: tokens.foreground }}
              >
                {shop.shop_name}
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/(tabs)/cart")}
                className="relative h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: tokens.muted }}
              >
                <ShoppingCart size={20} color={tokens.foreground} />
                {cartCount > 0 && (
                  <View
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                    style={{ backgroundColor: tokens.primary }}
                  >
                    <Text className="text-xs font-bold text-white">
                      {cartCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View
              className="flex-row items-center border rounded-xl px-3 mb-4"
              style={{ borderColor: tokens.border, backgroundColor: tokens.input }}
            >
              <Search size={18} color={tokens.mutedForeground} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search products in this shop"
                placeholderTextColor={tokens.mutedForeground}
                className="flex-1 px-2 py-3"
                style={{ color: tokens.foreground }}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <X size={18} color={tokens.mutedForeground} />
                </Pressable>
              )}
            </View>

            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => String(item.id)}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={handleProductPress}
                  onAddToCart={handleAddToCart}
                />
              )}
              onEndReached={loadMoreProducts}
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                isLoadingMore ? (
                  <ActivityIndicator
                    style={{ marginVertical: 12 }}
                    color={tokens.primary}
                  />
                ) : null
              }
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center py-20">
                  <Text className="text-muted-foreground">
                    {searchQuery
                      ? "No products match your search"
                      : "No products found"}
                  </Text>
                </View>
              }
            />
          </View>
        </SafeAreaView>
      

      <CartConflictModal
        visible={showConflictModal}
        currentShopName={shop?.shop_name || ""}
        cartShopName={cartShop?.shop_name || ""}
        onConfirm={handleConfirmConflict}
        onCancel={handleCancelConflict}
      />
    </>
  );
}