import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Store } from "lucide-react-native";

import { CartConflictModal } from "@/components/domain/CartConflictModal";
import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useCart } from "@/lib/context/cartContext";
import type { ProductDisplay } from "@/lib/types";

const fallbackProductImage = require("../../assets/images/icon.png");

export default function ShopProductDetailScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const params = useLocalSearchParams<{ id: string; product: string }>();
  const { cart, shopId, addItem, clearCart, conflictAddItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const product: ProductDisplay | null = useMemo(() => {
    try {
      return JSON.parse(params.product);
    } catch {
      return null;
    }
  }, [params.product]);

  if (!product) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: tokens.background }}
      >
        <Text style={{ color: tokens.mutedForeground }}>Product not found</Text>
      </SafeAreaView>
    );
  }

  const outOfStock = product.stock === 0;
  const imageSource = product.primaryImage
    ? { uri: product.primaryImage }
    : fallbackProductImage;

  const handleAddToCart = () => {
    const canAdd = !shopId || shopId === product.shop_id;
    if (!canAdd) {
      setShowConflictModal(true);
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    Alert.alert("Success", "Added to cart successfully");
  };

  const handleConfirmConflict = () => {
    clearCart();
    for (let i = 0; i < quantity; i++) {
      conflictAddItem(product);
    }
    Alert.alert("Success", "Added to cart successfully");
    setShowConflictModal(false);
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: tokens.background }}
    >
      <View
        className="flex-row items-center px-4 py-4 border-b"
        style={{ borderColor: tokens.border }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color={tokens.foreground} />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold flex-1"
          numberOfLines={1}
          style={{ color: tokens.foreground }}
        >
          Product Details
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Image
          source={imageSource}
          style={{ width: "100%", height: 280 }}
          resizeMode="cover"
        />

        <View className="p-4">
          {!!product.brand && (
            <Text
              className="text-sm mb-1"
              style={{ color: tokens.mutedForeground }}
            >
              {product.brand}
            </Text>
          )}

          <Text
            className="text-2xl font-bold mb-1"
            style={{ color: tokens.foreground }}
          >
            {product.product_name}
          </Text>

          {!!product.unit && (
            <Text
              className="text-sm mb-3"
              style={{ color: tokens.mutedForeground }}
            >
              {product.unit}
            </Text>
          )}

          <View className="flex-row items-center mb-4">
            <View
              className="flex-row items-center bg-muted px-2 py-1 rounded mr-2"
              style={{ backgroundColor: tokens.muted }}
            >
              <Store size={14} color={tokens.mutedForeground} />
              <Text
                className="ml-1 text-xs"
                style={{ color: tokens.mutedForeground }}
              >
                {product.shop_name}
              </Text>
            </View>

            {outOfStock ? (
              <Text className="text-xs font-semibold text-destructive">
                Out of stock
              </Text>
            ) : product.stock < 10 ? (
              <Text className="text-xs font-semibold" style={{ color: "#f59e0b" }}>
                Only {product.stock} left
              </Text>
            ) : null}
          </View>

          {product.shop_price > 0 && (
            <Text
              className="text-3xl font-bold mb-4"
              style={{ color: tokens.primary }}
            >
              {product.shop_price.toFixed(2)} EGP
            </Text>
          )}

          {!!product.description && (
            <>
              <Text
                className="text-base font-semibold mb-1"
                style={{ color: tokens.foreground }}
              >
                Description
              </Text>
              <Text
                className="text-sm mb-6"
                style={{ color: tokens.mutedForeground }}
              >
                {product.description}
              </Text>
            </>
          )}

          {/* Recommendations placeholder - not wired up yet */}
          <View
            className="rounded-2xl border p-4 mb-4"
            style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
          >
            <Text
              className="text-base font-semibold mb-1"
              style={{ color: tokens.foreground }}
            >
              You Might Also Like
            </Text>
            <Text
              className="text-sm"
              style={{ color: tokens.mutedForeground }}
            >
              Recommendations coming soon
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 p-4 border-t flex-row items-center gap-3"
        style={{ borderColor: tokens.border, backgroundColor: tokens.background }}
      >
        <View
          className="flex-row items-center border rounded-full px-2"
          style={{ borderColor: tokens.border }}
        >
          <TouchableOpacity
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-9 w-9 items-center justify-center"
          >
            <Text
              className="text-lg font-bold"
              style={{ color: tokens.foreground }}
            >
              −
            </Text>
          </TouchableOpacity>
          <Text
            className="mx-3 font-semibold"
            style={{ color: tokens.foreground }}
          >
            {quantity}
          </Text>
          <TouchableOpacity
            onPress={() => setQuantity((q) => q + 1)}
            className="h-9 w-9 items-center justify-center"
          >
            <Text
              className="text-lg font-bold"
              style={{ color: tokens.foreground }}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={outOfStock}
          className="flex-1 py-4 rounded-2xl items-center"
          style={{ backgroundColor: outOfStock ? tokens.muted : tokens.primary }}
        >
          <Text
            className="text-lg font-bold"
            style={{
              color: outOfStock ? tokens.mutedForeground : tokens.primaryForeground,
            }}
          >
            {outOfStock ? "Out of Stock" : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>

      <CartConflictModal
        visible={showConflictModal}
        currentShopName={product.shop_name}
        cartShopName={cart[0]?.shop_name || ""}
        onConfirm={handleConfirmConflict}
        onCancel={() => setShowConflictModal(false)}
      />
    </SafeAreaView>
  );
}
