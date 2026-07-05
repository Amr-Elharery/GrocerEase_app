import { ProtectedScreen } from "@/components/domain/ProtectedScreen";
import { THEME } from "@/lib/theme";
import { useCart } from "@/lib/context/cartContext";
import { useTheme } from "@/lib/theme-context";
import { router } from "expo-router";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartScreen() {
  const { cart, shopId, removeItem, updateQty, subtotal } = useCart();
  const { theme } = useTheme();
  const tokens = THEME[theme];

  const cartShopName = shopId ? cart[0]?.shop_name : null;

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
    <ProtectedScreen screenName="Cart">
      <SafeAreaView
        className="flex-1 bg-background"
        edges={["top"]}
        style={{ backgroundColor: tokens.background }}
      >
        <View className="flex-1 px-4 pt-4">
          <View className="mb-6">
            <Text className="text-foreground text-3xl font-bold">My Cart</Text>
            {cartShopName && (
              <Text className="text-muted-foreground mt-1">
                From {cartShopName}
              </Text>
            )}
          </View>

          {cart.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-foreground text-2xl font-bold">
                Your cart is empty
              </Text>

              <Text className="text-muted-foreground mt-2 text-center">
                Add products to see them here
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
                  <View className="bg-card border border-border p-4 rounded-2xl mb-4 flex-row">
                    <Image
                      source={item.primaryImage || { uri: item.image }}
                      className="w-24 h-24 rounded-xl"
                      resizeMode="cover"
                    />

                    <View className="flex-1 ml-4 justify-between">
                      <View>
                        <Text className="text-foreground text-xl font-bold">
                          {item.product_name || item.title}
                        </Text>

                        <Text className="text-muted-foreground mt-1">
                          {item.shop_price
                            ? `${item.shop_price} EGP`
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
                          <Text className="text-white font-bold">Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              />

              <View className="bg-card border border-border p-5 rounded-2xl">
                <View className="flex-row justify-between items-center">
                  <Text className="text-foreground text-xl font-bold">
                    Subtotal
                  </Text>

                  <Text className="text-foreground text-xl font-bold">
                    {subtotal.toFixed(2)} EGP
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => router.push("/checkout")}
                  className="bg-primary py-4 rounded-2xl mt-5"
                >
                  <Text className="text-white text-center text-lg font-bold">
                    Proceed To Checkout
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