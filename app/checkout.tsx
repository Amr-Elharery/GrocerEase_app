import React, { useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ProtectedScreen } from "@/components/domain/ProtectedScreen";
import { useAddress } from "@/lib/context/addressContext";
import { useCart } from "@/lib/context/cartContext";
import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import httpService from "@/shared/httpService";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = "/orders";

export default function CheckoutScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { cart, shopId, subtotal, clearCart } = useCart();
  const { addresses, selectedAddressId, selectAddress } = useAddress();

  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [loading, setLoading] = useState(false);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const deliveryFee = subtotal > 0 ? 15 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    console.log("[checkout] handlePlaceOrder called", {
      selectedAddressId,
      addressesCount: addresses.length,
      cartLength: cart.length,
      shopId,
    });

    if (!selectedAddress) {
      Alert.alert("Missing Information", "Please select a delivery address.");
      return;
    }

    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty.");
      return;
    }

    try {
      setLoading(true);

      let customerAddressId = selectedAddress.id;

      if (!customerAddressId) {
        const created = await httpService.post(`/addresses`, {
          area_id: selectedAddress.area_id,
          street: selectedAddress.street,
          building: selectedAddress.building,
          floor: selectedAddress.floor,
          apt_number: selectedAddress.apt_number,
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude,
          label: selectedAddress.label,
          additional_directions: selectedAddress.additional_directions,
        });
        customerAddressId = created.data.id;
      }

      const payload = {
        shop_id: shopId,
        customer_address_id: customerAddressId,
        payment_method: paymentMethod,
        items: cart.map((item) => ({
          shop_product_id: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await httpService.post(API_URL, payload);
      console.log(response);
      if (!response?.data) {
        throw new Error("Failed to place order");
      }

      clearCart();
      router.replace("/");
    } catch (error: any) {
      console.error("[checkout] place order failed", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while placing the order.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderAddressItem = ({ item }: { item: any }) => {
    const isSelected = selectedAddressId === item.id;
    return (
      <TouchableOpacity
        onPress={() => selectAddress(item.id)}
        className={`bg-card border rounded-2xl p-4 mb-3 ${
          isSelected ? "border-green-500" : "border-border"
        }`}
        style={{
          backgroundColor: tokens.card,
          borderColor: isSelected ? "#22c55e" : tokens.border,
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text
              className="text-foreground font-bold text-base"
              style={{ color: tokens.foreground }}
            >
              {item.label || "Address"}
            </Text>
            <Text
              className="text-muted-foreground mt-1"
              style={{ color: tokens.mutedForeground }}
            >
              {item.street}
              {item.building ? `, ${item.building}` : ""}
              {item.floor ? `, Floor ${item.floor}` : ""}
              {item.apt_number ? `, Apt ${item.apt_number}` : ""}
            </Text>
            <Text
              className="text-muted-foreground text-sm mt-1"
              style={{ color: tokens.mutedForeground }}
            >
              Area ID: {item.area_id}
            </Text>
          </View>
          {isSelected && (
            <View className="w-5 h-5 rounded-full bg-green-500 items-center justify-center">
              <Text className="text-white text-xs font-bold">✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ProtectedScreen screenName="Checkout">
      <SafeAreaView
        className="flex-1 bg-background"
        edges={["top"]}
        style={{ backgroundColor: tokens.background }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-6">
            <Text
              className="text-foreground text-3xl font-bold"
              style={{ color: tokens.foreground }}
            >
              Checkout
            </Text>

            <Text
              className="text-muted-foreground mt-1"
              style={{ color: tokens.mutedForeground }}
            >
              Complete your order details
            </Text>
          </View>

          {/* Saved Addresses */}
          <View className="bg-card border border-border rounded-2xl p-4 mb-5">
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-foreground text-lg font-bold"
                style={{ color: tokens.foreground }}
              >
                Delivery Address
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/address-book")}
                className="bg-primary px-3 py-1 rounded-lg"
                style={{ backgroundColor: tokens.primary }}
              >
                <Text
                  className="text-primary-foreground text-sm font-bold"
                  style={{ color: tokens.primaryForeground }}
                >
                  + Add New
                </Text>
              </TouchableOpacity>
            </View>

            {addresses.length === 0 ? (
              <View className="items-center py-6">
                <Text
                  className="text-muted-foreground text-center"
                  style={{ color: tokens.mutedForeground }}
                >
                  No saved addresses. Tap Add New to create one.
                </Text>
              </View>
            ) : (
              <FlatList
                data={addresses}
                keyExtractor={(item) =>
                  item.id ? item.id.toString() : Math.random().toString()
                }
                renderItem={renderAddressItem}
                scrollEnabled={false}
              />
            )}

            {selectedAddress && (
              <View
                className="mt-3 p-3 rounded-xl border"
                style={{
                  backgroundColor: tokens.background,
                  borderColor: tokens.border,
                }}
              >
                <Text
                  className="text-foreground font-semibold"
                  style={{ color: tokens.foreground }}
                >
                  Selected:
                </Text>
                <Text
                  className="text-muted-foreground"
                  style={{ color: tokens.mutedForeground }}
                >
                  {selectedAddress.label || "Address"} —{" "}
                  {selectedAddress.street}
                  {selectedAddress.building
                    ? `, ${selectedAddress.building}`
                    : ""}
                </Text>
              </View>
            )}
          </View>

          {/* Payment Method */}
          <View className="bg-card border border-border rounded-2xl p-4 mb-5">
            <Text
              className="text-foreground text-lg font-bold mb-4"
              style={{ color: tokens.foreground }}
            >
              Payment Method
            </Text>

            <TouchableOpacity
              onPress={() => setPaymentMethod("cash_on_delivery")}
              className={`bg-background border rounded-xl p-4 ${
                paymentMethod === "cash_on_delivery"
                  ? "border-green-500"
                  : "border-border"
              }`}
              style={{
                backgroundColor: tokens.background,
                borderColor:
                  paymentMethod === "cash_on_delivery"
                    ? "#22c55e"
                    : tokens.border,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text
                    className="text-foreground font-semibold"
                    style={{ color: tokens.foreground }}
                  >
                    Cash On Delivery (COD)
                  </Text>

                  <Text
                    className="text-muted-foreground text-sm mt-1"
                    style={{ color: tokens.mutedForeground }}
                  >
                    Pay with cash upon delivery
                  </Text>
                </View>

                {paymentMethod === "cash_on_delivery" && (
                  <View className="w-5 h-5 rounded-full bg-green-500 items-center justify-center">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Order Summary */}
          <View className="bg-card border border-border rounded-2xl p-4 mb-6">
            <Text
              className="text-foreground text-lg font-bold mb-4"
              style={{ color: tokens.foreground }}
            >
              Order Summary
            </Text>

            <View className="flex-row justify-between mb-3">
              <Text
                className="text-muted-foreground"
                style={{ color: tokens.mutedForeground }}
              >
                Subtotal ({cart.length} items)
              </Text>

              <Text
                className="text-foreground font-semibold"
                style={{ color: tokens.foreground }}
              >
                {subtotal.toFixed(2)} EGP
              </Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <Text
                className="text-muted-foreground"
                style={{ color: tokens.mutedForeground }}
              >
                Delivery Fee
              </Text>

              <Text
                className="text-foreground font-semibold"
                style={{ color: tokens.foreground }}
              >
                {deliveryFee.toFixed(2)} EGP
              </Text>
            </View>

            <View
              className="h-[1px] bg-border mb-4"
              style={{ backgroundColor: tokens.border }}
            />

            <View className="flex-row justify-between">
              <Text
                className="text-foreground text-lg font-bold"
                style={{ color: tokens.foreground }}
              >
                Total
              </Text>

              <Text
                className="text-primary text-lg font-bold"
                style={{ color: tokens.primary }}
              >
                {total.toFixed(2)} EGP
              </Text>
            </View>
          </View>

          {/* Place Order Button */}
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={loading}
            className={`py-4 rounded-2xl ${
              loading ? "bg-gray-400" : "bg-green-600"
            }`}
          >
            <Text className="text-white text-center text-lg font-bold">
              {loading ? "Placing Order..." : "Place Order"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ProtectedScreen>
  );
}
