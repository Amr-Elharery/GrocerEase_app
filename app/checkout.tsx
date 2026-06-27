import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function CheckoutScreen() {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Example cart total
  const subtotal = 0;
  const deliveryFee =0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!street || !city) {
      Alert.alert(
        "Missing Information",
        "Please fill all required fields."
      );
      return;
    }

    try {
      setLoading(true);

      // API Request
      const response = await fetch(
        "https://your-api.com/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            street,
            city,
            notes,
            payment_method: "COD",
            total,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      // Navigate to confirmation screen
      router.push("/");
    } catch (error) {
      Alert.alert(
        "Error",
        "Something went wrong while placing the order."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top"]}
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
          <Text className="text-foreground text-3xl font-bold">
            Checkout
          </Text>

          <Text className="text-muted-foreground mt-1">
            Complete your order details
          </Text>
        </View>

        {/* Shipping Address */}
        <View className="bg-card border border-border rounded-2xl p-4 mb-5">
          <Text className="text-foreground text-lg font-bold mb-4">
            Shipping Address
          </Text>

          {/* Street */}
          <View className="mb-4">
            <Text className="text-muted-foreground mb-2">
              Street Address
            </Text>

            <TextInput
              value={street}
              onChangeText={setStreet}
              placeholder="Enter your street"
              placeholderTextColor="#888"
              className="bg-background border border-border rounded-xl px-4 py-4 text-foreground"
            />
          </View>

          {/* City */}
          <View className="mb-4">
            <Text className="text-muted-foreground mb-2">
              City
            </Text>

            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Enter your city"
              placeholderTextColor="#888"
              className="bg-background border border-border rounded-xl px-4 py-4 text-foreground"
            />
          </View>

          {/* Notes */}
          <View>
            <Text className="text-muted-foreground mb-2">
              Notes
            </Text>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-background border border-border rounded-xl px-4 py-4 text-foreground min-h-[100px]"
            />
          </View>
        </View>

        {/* Payment Method */}
        <View className="bg-card border border-border rounded-2xl p-4 mb-5">
          <Text className="text-foreground text-lg font-bold mb-4">
            Payment Method
          </Text>

          <View className="bg-background border border-border rounded-xl p-4">
            <Text className="text-foreground font-semibold">
              Cash On Delivery (COD)
            </Text>

            <Text className="text-muted-foreground text-sm mt-1">
              Pay with cash upon delivery
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View className="bg-card border border-border rounded-2xl p-4 mb-6">
          <Text className="text-foreground text-lg font-bold mb-4">
            Order Summary
          </Text>

          <View className="flex-row justify-between mb-3">
            <Text className="text-muted-foreground">
              Subtotal
            </Text>

            <Text className="text-foreground font-semibold">
              ${subtotal.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <Text className="text-muted-foreground">
              Delivery Fee
            </Text>

            <Text className="text-foreground font-semibold">
              ${deliveryFee.toFixed(2)}
            </Text>
          </View>

          <View className="h-[1px] bg-border mb-4" />

          <View className="flex-row justify-between">
            <Text className="text-foreground text-lg font-bold">
              Total
            </Text>

            <Text className="text-primary text-lg font-bold">
              ${total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={loading}
          className={`py-4 rounded-2xl ${
            loading
              ? "bg-gray-400"
              : "bg-green-600"
          }`}
        >
          <Text className="text-white text-center text-lg font-bold">
            {loading
              ? "Placing Order..."
              : "Place Order"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}