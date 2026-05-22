import { useLocalSearchParams } from "expo-router";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useEffect, useState } from "react";

type OrderItem = {
  id: number;
  name: string;
  quantity: number;
};

type DeliveryDetails = {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  status:
    | "assigned"
    | "accepted"
    | "picked_up"
    | "delivered";

  total: number;

  items: OrderItem[];
};

export default function DeliveryDetailScreen() {
  const { id } = useLocalSearchParams();

  const [delivery, setDelivery] =
    useState<DeliveryDetails | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchDeliveryDetails();
  }, []);

  const fetchDeliveryDetails = async () => {
    try {
      const response = await fetch(
        `https://your-api.com/deliveries/${id}`
      );

      const data = await response.json();

      setDelivery(data);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to load delivery details"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    newStatus: string
  ) => {
    try {
      await fetch(
        `https://your-api.com/deliveries/${id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      setDelivery((prev) =>
        prev
          ? {
              ...prev,
              status:
                newStatus as DeliveryDetails["status"],
            }
          : null
      );

      Alert.alert(
        "Success",
        `Status updated to ${newStatus}`
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to update status"
      );
    }
  };

  const callCustomer = () => {
    if (!delivery) return;

    Linking.openURL(
      `tel:${delivery.customer_phone}`
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!delivery) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-red-500">
          Failed to load delivery
        </Text>
      </SafeAreaView>
    );
  }

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
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-foreground text-3xl font-bold">
            Delivery Details
          </Text>

          <Text className="text-muted-foreground mt-1">
            Order #{delivery.id}
          </Text>
        </View>

        {/* Customer Info */}
        <View className="bg-card border border-border rounded-2xl p-4 mb-5">
          <Text className="text-foreground text-xl font-bold mb-4">
            Customer Information
          </Text>

          <Text className="text-muted-foreground">
            Customer Name
          </Text>

          <Text className="text-foreground font-semibold mt-1 mb-4">
            {delivery.customer_name}
          </Text>

          <Text className="text-muted-foreground">
            Phone Number
          </Text>

          <TouchableOpacity
            onPress={callCustomer}
          >
            <Text className="text-blue-500 text-lg font-bold mt-1 mb-4">
              {delivery.customer_phone}
            </Text>
          </TouchableOpacity>

          <Text className="text-muted-foreground">
            Address
          </Text>

          <Text className="text-foreground font-semibold mt-1">
            {delivery.customer_address}
          </Text>
        </View>

        {/* Order Items */}
        <View className="bg-card border border-border rounded-2xl p-4 mb-5">
          <Text className="text-foreground text-xl font-bold mb-4">
            Order Items
          </Text>

          {delivery.items.map((item) => (
            <View
              key={item.id}
              className="flex-row justify-between mb-4"
            >
              <Text className="text-foreground font-semibold">
                {item.name}
              </Text>

              <Text className="text-muted-foreground">
                x{item.quantity}
              </Text>
            </View>
          ))}

          <View className="h-[1px] bg-border my-3" />

          <View className="flex-row justify-between">
            <Text className="text-foreground text-lg font-bold">
              Total
            </Text>

            <Text className="text-primary text-xl font-bold">
              {delivery.total} EGP
            </Text>
          </View>
        </View>

        {/* Status */}
        <View className="bg-card border border-border rounded-2xl p-4 mb-5">
          <Text className="text-foreground text-lg font-bold">
            Current Status
          </Text>

          <Text className="text-primary text-lg font-semibold mt-2 capitalize">
            {delivery.status}
          </Text>
        </View>

        {/* Actions */}
        {delivery.status === "assigned" && (
          <TouchableOpacity
            onPress={() =>
              updateStatus("accepted")
            }
            className="bg-blue-500 py-4 rounded-2xl mb-4"
          >
            <Text className="text-white text-center text-lg font-bold">
              Accept Order
            </Text>
          </TouchableOpacity>
        )}

        {delivery.status === "accepted" && (
          <TouchableOpacity
            onPress={() =>
              updateStatus("picked_up")
            }
            className="bg-yellow-500 py-4 rounded-2xl mb-4"
          >
            <Text className="text-white text-center text-lg font-bold">
              Mark As Picked Up
            </Text>
          </TouchableOpacity>
        )}

        {delivery.status === "picked_up" && (
          <TouchableOpacity
            onPress={() =>
              updateStatus("delivered")
            }
            className="bg-green-600 py-4 rounded-2xl"
          >
            <Text className="text-white text-center text-lg font-bold">
              Mark As Delivered
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}