import { ProtectedScreen } from "@/components/domain/ProtectedScreen";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartScreen() {
  // Empty cart initially
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Increase quantity
  const increaseQty = (id: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  // Decrease quantity
  const decreaseQty = (id: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // Remove item
  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Subtotal
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <ProtectedScreen screenName="Cart">
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1 px-4 pt-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-foreground text-3xl font-bold">My Cart</Text>

            <Text className="text-muted-foreground mt-1">
              Review your selected items
            </Text>
          </View>

          {/* Empty Cart */}
          {cartItems.length === 0 ? (
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
              {/* Cart List */}
              <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: 20,
                }}
                renderItem={({ item }) => (
                  <View className="bg-card border border-border p-4 rounded-2xl mb-4 flex-row">
                    {/* Product Image */}
                    <Image
                      source={{ uri: item.image }}
                      className="w-24 h-24 rounded-xl"
                      resizeMode="cover"
                    />

                    {/* Product Info */}
                    <View className="flex-1 ml-4 justify-between">
                      <View>
                        <Text className="text-foreground text-xl font-bold">
                          {item.title}
                        </Text>

                        <Text className="text-muted-foreground mt-1">
                          ${item.price}
                        </Text>
                      </View>

                      {/* Quantity + Remove */}
                      <View className="flex-row items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <View className="flex-row items-center bg-background border border-border rounded-xl px-3 py-2">
                          <TouchableOpacity
                            onPress={() => decreaseQty(item.id)}
                          >
                            <Text className="text-foreground text-xl font-bold">
                              -
                            </Text>
                          </TouchableOpacity>

                          <Text className="text-foreground mx-4 text-lg font-bold">
                            {item.quantity}
                          </Text>

                          <TouchableOpacity
                            onPress={() => increaseQty(item.id)}
                          >
                            <Text className="text-foreground text-xl font-bold">
                              +
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* Remove Button */}
                        <TouchableOpacity
                          onPress={() => removeItem(item.id)}
                          className="bg-red-500 px-4 py-2 rounded-xl"
                        >
                          <Text className="text-white font-bold">Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              />

              {/* Bottom Section */}
              <View className="bg-card border border-border p-5 rounded-2xl">
                {/* Subtotal */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-foreground text-xl font-bold">
                    Subtotal
                  </Text>

                  <Text className="text-foreground text-xl font-bold">
                    ${subtotal.toFixed(2)}
                  </Text>
                </View>

                {/* Checkout Button */}
                <TouchableOpacity
                  onPress={() => router.push("/checkout")}
                  className="bg-green-600 py-4 rounded-2xl mt-5"
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
