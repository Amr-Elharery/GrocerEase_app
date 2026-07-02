import { fetchOrders, type OrderSummary } from "@/shared/order.service";
import { useFocusEffect, useRouter } from "expo-router";
import * as React from "react";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS = ["Ongoing", "Delivered", "Cancelled"] as const;

type OrderTab = (typeof TABS)[number];

const groupOrders = (orders: OrderSummary[]) => {
  const ongoing = orders.filter((order) => {
    const status = order.status?.toLowerCase() || "";
    return status !== "delivered" && status !== "cancelled";
  });
  const delivered = orders.filter(
    (order) => order.status?.toLowerCase() === "delivered",
  );
  const cancelled = orders.filter(
    (order) => order.status?.toLowerCase() === "cancelled",
  );
  return { ongoing, delivered, cancelled };
};

 

export default function ProfileOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [activeTab, setActiveTab] = useState<OrderTab>("Ongoing");
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
      console.log(data);
    } catch (error: any) {
      console.error("Failed to load orders", error);
    
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadOrders();
    }, [loadOrders]),
  );

  const { ongoing, delivered, cancelled } = groupOrders(orders);
  const visibleOrders =
    activeTab === "Ongoing"
      ? ongoing
      : activeTab === "Delivered"
        ? delivered
        : cancelled;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8">
        <View className="mt-4 mb-4 flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-foreground">
            My Orders
          </Text>
        </View>

        <View className="mb-6 flex-row rounded-full border border-border bg-card p-1">
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 rounded-full px-4 py-3 items-center ${activeTab === tab ? "bg-primary" : ""}`}
            >
              <Text
                className={`${activeTab === tab ? "text-primary-foreground" : "text-foreground"} font-semibold`}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : visibleOrders.length === 0 ? (
          <View className="items-center justify-center rounded-3xl border border-dashed border-border bg-card p-8">
            <Text className="text-base font-semibold text-foreground">
              No {activeTab.toLowerCase()} orders yet
            </Text>
            <Text className="mt-2 text-sm text-muted-foreground">
              Your {activeTab.toLowerCase()} orders will appear here.
            </Text>
          </View>
        ) : (
          visibleOrders.map((order) => (
            <Pressable
              key={String(order.id)}
              onPress={() => {
                if (activeTab === "Ongoing") {
                  // Pass a serialized preload of the order so tracking can show details
                  router.push({
                    pathname: "/order-tracking",
                    params: {
                      id: String(order.id),
                      preload: JSON.stringify(order),
                    },
                  });
                }
              }}
              className="mb-4 rounded-3xl border border-border bg-card px-4 py-4"
              style={{ opacity: activeTab === "Ongoing" ? 1 : 0.9 }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-foreground">
                  Order {order.order_number || order.id}
                </Text>
                <Text className="text-sm font-semibold text-primary">
                  {order.status}
                </Text>
              </View>
              <Text className="text-sm text-muted-foreground">
                {order.items?.length ?? 0} items •{" "}
                {order.eta || "ETA unavailable"}
              </Text>
              <Text className="mt-3 text-sm text-foreground">
                Total: EGP {Number(order.sub_total ?? 0).toFixed(2)}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
