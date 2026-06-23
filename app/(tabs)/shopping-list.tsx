import { useToast } from "@/lib/hooks/useToast";
import {
  getShoppingList,
  optimizeShoppingList,
  removeFromShoppingList,
  updateShoppingListQuantity,
  type ShoppingListItem,
} from "@/shared/shopping-list.service";

import { useRouter } from "expo-router";
import { ChevronLeft, Trash2 } from "lucide-react-native";

import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { ProtectedScreen } from "@/components/domain/ProtectedScreen";
import { SafeAreaView } from "react-native-safe-area-context";

const fallbackProductImage = require("../../assets/images/icon.png");

export default function ShoppingListScreen() {
  const router = useRouter();
  const toast = useToast();

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

      toast("Failed to load shopping list", "error");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const mockData = [
      {
        product_id: 1,
        product_name: "Fresh Milk",
        brand: "Juhayna",
        image_url:
          "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=500",
        qty: 2,
      },
      {
        product_id: 2,
        product_name: "Potato Chips",
        brand: "Lay's",
        image_url:
          "https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=500",
        qty: 1,
      },
      {
        product_id: 3,
        product_name: "Chocolate Cookies",
        brand: "Oreo",
        image_url:
          "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=500",
        qty: 4,
      },
      {
        product_id: 4,
        product_name: "Orange Juice",
        brand: "Fresh",
        image_url:
          "https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?q=80&w=500",
        qty: 1,
      },
    ];

    setItems(mockData);
    setIsLoading(false);

    // later switch back to:
    // loadShoppingList();
  }, []);

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

        toast("Failed to update quantity", "error");
      }
    },
    [items, toast],
  );

  // =========================
  // Delete Item
  // =========================
  const deleteItem = useCallback(
    async (productId: number) => {
      try {
        const updated = await removeFromShoppingList(productId);

        setItems(updated);

        toast("Removed from list", "success");
      } catch (error) {
        console.error("Error removing item:", error);

        toast("Failed to remove item", "error");
      }
    },
    [toast],
  );

  // =========================
  // Optimize Shopping List
  // =========================
  const handleOptimize = useCallback(async () => {
    if (items.length === 0) {
      toast("Your list is empty", "warning");

      return;
    }

    try {
      setIsOptimizing(true);

      // Send only product_id + qty
      const payload = items.map((item) => ({
        product_id: item.product_id,
        qty: item.qty,
      }));

      const result = await optimizeShoppingList(payload);

      router.push({
        pathname: "/optimization",
        params: {
          result: JSON.stringify(result),
        },
      });
    } catch (error) {
      console.error("Optimization error:", error);

      toast("Failed to optimize list", "error");
    } finally {
      setIsOptimizing(false);
    }
  }, [items, router, toast]);

  const isEmpty = items.length === 0;

  return (
    <ProtectedScreen screenName="Shopping Lists">
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1">
          {/* ================= HEADER ================= */}
          <View className="flex-row items-center gap-3 px-4 py-4 border-b border-border">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-muted"
            >
              <ChevronLeft size={22} className="text-foreground" />
            </Pressable>

            <View className="flex-1">
              <Text className="text-foreground text-2xl font-bold">
                Shopping List
              </Text>

              {!isEmpty && (
                <Text className="text-muted-foreground text-xs mt-1">
                  {items.length} item
                  {items.length !== 1 ? "s" : ""}
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

              <Text className="text-foreground text-xl font-semibold mb-2">
                Your list is empty
              </Text>

              <Text className="text-muted-foreground text-center mb-6">
                Add products from the browse screen.
              </Text>

              <Pressable
                onPress={() => router.push("/(tabs)")}
                className="bg-primary rounded-full px-6 py-3"
              >
                <Text className="text-primary-foreground font-semibold">
                  Browse Products
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
                    className="flex-row gap-3 bg-card border border-border rounded-2xl p-3 mb-3"
                  >
                    {/* Product Image */}
                    <Image
                      source={imageSource}
                      className="h-20 w-20 rounded-xl"
                      resizeMode="cover"
                    />

                    {/* Product Info */}
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1 pr-2">
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
                              "Remove Item",
                              `Remove ${item.product_name} from list?`,
                              [
                                {
                                  text: "Cancel",
                                  style: "cancel",
                                },
                                {
                                  text: "Remove",
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
                          Qty
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
              <Pressable
                onPress={handleOptimize}
                disabled={isOptimizing}
                className="bg-primary rounded-full py-4 items-center"
              >
                {isOptimizing ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#ffffff" />

                    <Text className="text-primary-foreground font-semibold text-base">
                      Finding the best deal...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-primary-foreground font-semibold text-base">
                    Optimize
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
