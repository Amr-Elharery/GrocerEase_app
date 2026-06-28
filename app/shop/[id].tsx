import { CartConflictModal } from "@/components/domain/CartConflictModal";
import { ProductCard } from "@/components/domain/product-card";
import { Button } from "@/components/ui/button";
import { THEME } from "@/lib/theme";
import { useCart, useToast } from "@/lib/context/cartContext";
import { useTheme } from "@/lib/theme-context";
import type { ProductDisplay, ShopDisplay } from "@/lib/types";
import { shopService } from "@/shared/shop.service";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ShoppingCart } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ShopProductsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { shopId, addItem, clearCart, conflictAddItem, cartCount } =
    useCart();
  const { showToast } = useToast();

  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<ProductDisplay | null>(null);
  const [shop, setShop] = useState<ShopDisplay | null>(null);
  const [productsByShop, setProductsByShop] = useState<ProductDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadShopData = async () => {
      setIsLoading(true);
      try {
        const shopIdNum = parseInt(id);
        const shopResult = await shopService.getShops().then((shops) =>
          shops.find((s) => s.id === shopIdNum)
        );
        setShop(shopResult ?? null);

        const { products } = await shopService.getShopProducts(shopIdNum);
        setProductsByShop(products);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadShopData();
  }, [id]);

  const categories = useMemo(() => {
    const cats: { category_name: string; products: ProductDisplay[] }[] = [];
    const seen = new Set<string>();

    for (const product of productsByShop) {
      const catName = product.category?.category_name || "Uncategorized";
      if (!seen.has(catName)) {
        seen.add(catName);
        cats.push({ category_name: catName, products: [] });
      }
      const group = cats.find((c) => c.category_name === catName);
      if (group) {
        group.products.push(product);
      }
    }
    return cats;
  }, [productsByShop]);

  const cartShop = useMemo(() => {
    if (!shopId) return null;
    return shop;
  }, [shopId, shop]);

  const handleAddToCart = useCallback(
    (product: ProductDisplay) => {
      const canAdd = !shopId || shopId === product.shop_id;
      if (!canAdd) {
        setPendingProduct(product);
        setShowConflictModal(true);
        return;
      }
      addItem(product);
      showToast("Added to cart successfully");
    },
    [addItem, shopId]
  );

  const handleConfirmConflict = useCallback(() => {
    if (pendingProduct) {
      clearCart();
      conflictAddItem(pendingProduct);
      showToast("Added to cart successfully");
    }
    setShowConflictModal(false);
    setPendingProduct(null);
  }, [pendingProduct, clearCart, conflictAddItem, showToast]);

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
      <Stack.Screen
        options={{
          title: shop.shop_name,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/cart")}
              className="mr-4 relative"
            >
              <ShoppingCart size={24} color={tokens.foreground} />
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
          ),
        }}
      />

 
        <SafeAreaView
          className="flex-1 bg-background"
          edges={["top"]}
          style={{ backgroundColor: tokens.background }}
        >
          <View className="flex-1 px-4 pt-4">
            <FlatList
              data={categories}
              keyExtractor={(item) => item.category_name}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <View className="mb-6">
                  <Text className="text-foreground text-xl font-bold mb-3">
                    {item.category_name}
                  </Text>

                  {item.products.map((product) => (
                    <View key={product.id} className="mb-3">
                      <ProductCard
                        product={product}
                      
                      />

                      <Button
                        onPress={() => handleAddToCart(product)}
                        className="mt-2"
                        disabled={product.stock === 0}
                      >
                        <Text className="text-primary-foreground font-bold">
                          {product.stock === 0 ? "Out of stock" : "Add to Cart"}
                        </Text>
                      </Button>
                    </View>
                  ))}
                </View>
              )}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center py-20">
                  <Text className="text-muted-foreground">No products found</Text>
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