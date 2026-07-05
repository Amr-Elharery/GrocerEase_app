import { ProtectedScreen } from "@/features/auth/components/ProtectedScreen";
import { useRTL } from "@/lib/i18n/RTLContext";
import { useToast } from "@/lib/toast/useToast";
import { THEME, useTheme } from "@/lib/theme";
import { useCart } from "@/features/cart/hooks/cartContext";
import { recommendationsService } from "@/features/recommendations/services/recommendations.service";
import { RecommendationSection } from "@/features/recommendations/components/RecommendationSection";
import type { FBTRecommendation } from "@/features/recommendations/types";
import type { ProductDisplay } from "@/features/products/types";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const fallbackProductImage = require("../../assets/images/icon.png");

export default function CartScreen() {
  const { cart, shopId, addItem, removeItem, updateQty, subtotal } = useCart();
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const toast = useToast();

  const cartShopName = shopId ? cart[0]?.shop_name : null;

  const [recommendations, setRecommendations] = useState<FBTRecommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  useEffect(() => {
    if (!shopId || cart.length === 0) {
      setRecommendations([]);
      return;
    }
    const productIds = cart
      .map((item) => item.product_id)
      .filter((id): id is number => typeof id === "number");
    if (productIds.length === 0) {
      setRecommendations([]);
      return;
    }

    let isActive = true;
    setRecommendationsLoading(true);
    recommendationsService
      .getCartCompletion(shopId, productIds)
      .then((data) => {
        if (isActive) setRecommendations(data);
      })
      .finally(() => {
        if (isActive) setRecommendationsLoading(false);
      });
    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId, cart.map((item) => `${item.product_id}:${item.quantity}`).join(",")]);

  const handleAddRecommendation = (item: FBTRecommendation) => {
    if (!item.shop_product_id || !shopId) return;
    const recommendedProduct: ProductDisplay = {
      id: item.shop_product_id,
      product_id: item.product_id,
      category_id: 0,
      product_name: item.name,
      description: "",
      price: item.price ?? 0,
      created_at: "",
      updated_at: "",
      brand: item.brand ?? undefined,
      shop_id: shopId,
      shop_name: cartShopName ?? "",
      shop_price: item.price ?? 0,
      stock: item.available_stock ?? 0,
      images: [],
      primaryImage: item.image_url ?? undefined,
    };
    addItem(recommendedProduct);
    toast(t("stores.shopScreen.addedToCart"), "success");
  };

  const increaseQty = (id: number) => {
    const item = cart.find((i) => i.id === id);
    if (item) {
      updateQty(id, item.quantity + 1);
    }
  };

  const decreaseQty = (id: number) => {
    const item = cart.find((i) => i.id === id);
    if (item) {
      updateQty(id, item.quantity - 1);
    }
  };

  return (
    <ProtectedScreen screenName={t("cart.title")}>
      <SafeAreaView
        className="flex-1 bg-background"
        edges={["top"]}
        style={{ backgroundColor: tokens.background }}
      >
        <View className="flex-1 px-4 pt-4">
          <View className="mb-6">
            <Text className="text-foreground text-3xl font-bold">{t("cart.title")}</Text>
            {cartShopName && (
              <Text className="text-muted-foreground mt-1">
                {t("cart.fromShop", { shop: cartShopName })}
              </Text>
            )}
          </View>

          {cart.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-foreground text-2xl font-bold">
                {t("cart.empty")}
              </Text>

              <Text className="text-muted-foreground mt-2 text-center">
                {t("cart.emptyHint")}
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={cart}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                  <View className={isRTL ? "bg-card border border-border p-4 rounded-2xl mb-4 flex-row-reverse" : "bg-card border border-border p-4 rounded-2xl mb-4 flex-row"}>
                    <Image
                      source={
                        item.primaryImage
                          ? { uri: item.primaryImage }
                          : fallbackProductImage
                      }
                      className="w-24 h-24 rounded-xl"
                      resizeMode="cover"
                    />

                    <View className={isRTL ? "flex-1 mr-4 justify-between" : "flex-1 ml-4 justify-between"}>
                      <View>
                        <Text className="text-foreground text-xl font-bold">
                          {item.product_name || item.title}
                        </Text>

                        <Text className="text-muted-foreground mt-1">
                          {item.shop_price
                            ? `${item.shop_price} ${t("common.egp")}`
                            : `$${item.price}`}
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between mt-4">
                        <View className="flex-row items-center bg-background border border-border rounded-xl px-3 py-2">
                          <TouchableOpacity onPress={() => decreaseQty(item.id)}>
                            <Text className="text-foreground text-xl font-bold">
                              -
                            </Text>
                          </TouchableOpacity>

                          <Text className="text-foreground mx-4 text-lg font-bold">
                            {item.quantity}
                          </Text>

                          <TouchableOpacity onPress={() => increaseQty(item.id)}>
                            <Text className="text-foreground text-xl font-bold">
                              +
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          onPress={() => removeItem(item.id)}
                          className="bg-destructive px-4 py-2 rounded-xl"
                        >
                          <Text className="text-white font-bold">{t("common.remove")}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              />

              <RecommendationSection
                title={t("cart.youMightAlsoNeed")}
                items={recommendations}
                isLoading={recommendationsLoading}
                onAddPress={handleAddRecommendation}
              />

              <View className="bg-card border border-border p-5 rounded-2xl">
                <View className="flex-row justify-between items-center">
                  <Text className="text-foreground text-xl font-bold">
                    {t("cart.subtotal")}
                  </Text>

                  <Text className="text-foreground text-xl font-bold">
                    {subtotal.toFixed(2)} {t("common.egp")}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => router.push("/checkout")}
                  className="bg-primary py-4 rounded-2xl mt-5"
                >
                  <Text className="text-white text-center text-lg font-bold">
                    {t("cart.checkout")}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </ProtectedScreen>
  );
}