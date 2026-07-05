import { useToast } from "@/lib/toast/useToast";
import { useAddress } from "@/features/addresses/hooks/addressContext";
import {
  getShoppingList,
  requestOptimizationPlan,
  removeFromShoppingList,
  updateShoppingListQuantity,
  type ShoppingListItem,
} from "@/features/shopping-list/services/shopping-list.service";

import { useFocusEffect, useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { BackIcon } from "@/components/ui/back-icon";
import { useTranslation } from "react-i18next";

import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { ProtectedScreen } from "@/features/auth/components/ProtectedScreen";
import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";

const fallbackProductImage = require("../../assets/images/icon.png");
const MAX_STORES = 3;

export default function ShoppingListScreen() {
  const router = useRouter();
  const toast = useToast();
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const { addresses, selectedAddressId } = useAddress();

  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // =========================
  // Load Shopping List
  // =========================
  const loadShoppingList = useCallback(async () => {
    try {
      setIsLoading(true);

      const list = await getShoppingList();

      setItems(list);
    } catch (error) {
      console.error("Error loading shopping list:", error);

      toast(t("shoppingList.loadFailed"), "error");
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  useFocusEffect(
    useCallback(() => {
      loadShoppingList();
    }, [loadShoppingList]),
  );

  // =========================
  // Update Quantity
  // =========================
  const updateQuantity = useCallback(
    async (productId: number, delta: number) => {
      try {
        const item = items.find((i) => i.product_id === productId);

        if (!item) return;

        const newQty = Math.max(1, item.qty + delta);

        const updated = await updateShoppingListQuantity(productId, newQty);

        setItems(updated);
      } catch (error) {
        console.error("Error updating quantity:", error);

        toast(t("shoppingList.updateQtyFailed"), "error");
      }
    },
    [items, toast, t],
  );

  // =========================
  // Delete Item
  // =========================
  const deleteItem = useCallback(
    async (productId: number) => {
      try {
        const updated = await removeFromShoppingList(productId);

        setItems(updated);

        toast(t("shoppingList.removedFromList"), "success");
      } catch (error) {
        console.error("Error removing item:", error);

        toast(t("shoppingList.removeFailed"), "error");
      }
    },
    [toast, t],
  );

  // =========================
  // Optimize Shopping List
  // =========================
  const handleOptimize = useCallback(async () => {
    if (items.length === 0) {
      toast(t("shoppingList.empty"), "warning");
      return;
    }

    if (!selectedAddressId) {
      toast(t("shoppingList.selectAddressFirst"), "warning");
      router.push("/address-book");
      return;
    }

    try {
      setIsOptimizing(true);

      const plan = await requestOptimizationPlan(
        items,
        selectedAddressId,
        MAX_STORES,
      );

      router.push({
        pathname: "/optimization",
        params: {
          plan: JSON.stringify(plan),
          items: JSON.stringify(items),
          customerAddressId: String(selectedAddressId),
        },
      });
    } catch (error: any) {
      console.error("Optimization error:", error);

      if (error?.response?.status === 404) {
        toast(
          t("shoppingList.noShopsCarryItems"),
          "error",
        );
      } else {
        toast(t("shoppingList.optimizeFailed"), "error");
      }
    } finally {
      setIsOptimizing(false);
    }
  }, [items, router, toast, selectedAddressId, t]);

  const isEmpty = items.length === 0;

  return (
    <ProtectedScreen screenName={t("shoppingList.title")}>
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1">
          {/* ================= HEADER ================= */}
          <View className="flex-row items-center gap-3 px-4 py-4 border-b border-border">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-muted"
            >
              <BackIcon variant="chevron" size={22} className="text-foreground" />
            </Pressable>

            <View className="flex-1">
              <Text className="text-foreground text-2xl font-bold">
                {t("shoppingList.title")}
              </Text>

              {!isEmpty && (
                <Text className="text-muted-foreground text-xs mt-1">
                  {t("shoppingList.itemCount", { count: items.length })}
                </Text>
              )}
            </View>
          </View>

          {/* ================= LOADING ================= */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" />
            </View>
          ) : isEmpty ? (
            /* ================= EMPTY STATE ================= */

            <View className="flex-1 items-center justify-center px-6">
              <View className="h-20 w-20 rounded-full bg-muted items-center justify-center mb-4">
                <Text className="text-4xl">📋</Text>
              </View>

              <Text
                style={{
                  color: tokens.foreground,
                  fontSize: 20,
                  fontWeight: "600",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                {t("shoppingList.empty")}
              </Text>

              <Text
                style={{
                  color: tokens.mutedForeground,
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                {t("shoppingList.emptyHint")}
              </Text>

              <Pressable
                onPress={() => router.push("/(tabs)/search")}
                className="bg-primary rounded-full px-6 py-3"
              >
                <Text className="text-primary-foreground font-semibold">
                  {t("shoppingList.browseProducts")}
                </Text>
              </Pressable>
            </View>
          ) : (
            /* ================= LIST ITEMS ================= */

            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                padding: 16,
                paddingBottom: 120,
              }}
            >
              {items.map((item) => {
                const imageSource = item.image_url
                  ? { uri: item.image_url }
                  : fallbackProductImage;

                return (
                  <View
                    key={item.product_id}
                    className={isRTL ? "flex-row-reverse gap-3 bg-card border border-border rounded-2xl p-3 mb-3" : "flex-row gap-3 bg-card border border-border rounded-2xl p-3 mb-3"}
                  >
                    {/* Product Image */}
                    <Image
                      source={imageSource}
                      className="h-20 w-20 rounded-xl"
                      resizeMode="cover"
                    />

                    {/* Product Info */}
                    <View className="flex-1">
                      <View className={isRTL ? "flex-row-reverse justify-between items-start" : "flex-row justify-between items-start"}>
                        <View className={isRTL ? "flex-1 pl-2" : "flex-1 pr-2"}>
                          <Text
                            className="text-foreground font-semibold text-base"
                            numberOfLines={1}
                          >
                            {item.product_name}
                          </Text>

                          {!!item.brand && (
                            <Text className="text-muted-foreground text-xs mt-1">
                              {item.brand}
                            </Text>
                          )}
                        </View>

                        {/* Delete */}
                        <Pressable
                          onPress={() =>
                            Alert.alert(
                              t("shoppingList.removeItemTitle"),
                              t("shoppingList.removeItemMessage", { name: item.product_name }),
                              [
                                {
                                  text: t("common.cancel"),
                                  style: "cancel",
                                },
                                {
                                  text: t("common.remove"),
                                  style: "destructive",
                                  onPress: () => deleteItem(item.product_id),
                                },
                              ],
                            )
                          }
                          className="h-8 w-8 rounded-full items-center justify-center bg-destructive/10"
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Pressable>
                      </View>

                      {/* Quantity Stepper */}
                      <View className="flex-row items-center justify-between mt-4">
                        <Text className="text-muted-foreground text-xs">
                          {t("shoppingList.qty")}
                        </Text>

                        <View className="flex-row items-center gap-2">
                          <Pressable
                            onPress={() => updateQuantity(item.product_id, -1)}
                            className="h-7 w-7 rounded-full bg-muted items-center justify-center"
                          >
                            <Text className="text-foreground text-sm font-bold">
                              −
                            </Text>
                          </Pressable>

                          <View className="min-w-[40px] items-center rounded-full bg-muted px-3 py-1">
                            <Text className="text-foreground text-xs font-semibold">
                              {item.qty}
                            </Text>
                          </View>

                          <Pressable
                            onPress={() => updateQuantity(item.product_id, 1)}
                            className="h-7 w-7 rounded-full bg-muted items-center justify-center"
                          >
                            <Text className="text-foreground text-sm font-bold">
                              +
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* ================= OPTIMIZE BUTTON ================= */}

          {!isEmpty && !isLoading && (
            <View className="px-4 pb-6 pt-3 border-t border-border bg-background">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-muted-foreground text-sm">
                  {selectedAddressId
                    ? t("shoppingList.deliveringTo", {
                        address: addresses.find((a) => a.id === selectedAddressId)?.label || t("shoppingList.selectedAddress"),
                      })
                    : t("shoppingList.noAddressSelected")}
                </Text>
              </View>

              <Pressable
                onPress={handleOptimize}
                disabled={isOptimizing}
                className="bg-primary rounded-full py-4 items-center"
              >
                {isOptimizing ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#ffffff" />

                    <Text className="text-primary-foreground font-semibold text-base">
                      {t("shoppingList.findingBestDeal")}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-primary-foreground font-semibold text-base">
                    {t("shoppingList.optimize")}
                  </Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ProtectedScreen>
  );
}
