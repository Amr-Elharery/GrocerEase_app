import { fetchOrders, type OrderSummary } from "@/features/orders/services/order.service";
import { BackIcon } from "@/components/ui/back-icon";
import { useFocusEffect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
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
const TAB_KEYS: Record<(typeof TABS)[number], string> = {
  Ongoing: "ongoing",
  Delivered: "delivered",
  Cancelled: "cancelled",
};

type OrderTab = (typeof TABS)[number];

type OrderOrGroup =
  | { type: "single"; order: OrderSummary }
  | { type: "group"; order_group_id: string | number; orders: OrderSummary[] };

const combineIntoGroups = (orders: OrderSummary[]): OrderOrGroup[] => {
  const seenGroups = new Map<string, OrderSummary[]>();
  const result: OrderOrGroup[] = [];

  for (const order of orders) {
    if (order.order_group_id) {
      const key = String(order.order_group_id);
      if (!seenGroups.has(key)) {
        seenGroups.set(key, []);
      }
      seenGroups.get(key)!.push(order);
    }
  }

  const handledGroups = new Set<string>();
  for (const order of orders) {
    if (order.order_group_id) {
      const key = String(order.order_group_id);
      if (handledGroups.has(key)) continue;
      handledGroups.add(key);
      result.push({
        type: "group",
        order_group_id: order.order_group_id,
        orders: seenGroups.get(key)!,
      });
    } else {
      result.push({ type: "single", order });
    }
  }

  return result;
};

const groupStatus = (group: OrderSummary[]) =>
  group[0]?.status?.toLowerCase() || "";

const groupOrders = (orders: OrderSummary[]) => {
  const items = combineIntoGroups(orders);
  const ongoing = items.filter((item) => {
    const status =
      item.type === "group"
        ? groupStatus(item.orders)
        : item.order.status?.toLowerCase() || "";
    return status !== "delivered" && status !== "cancelled";
  });
  const delivered = items.filter((item) => {
    const status =
      item.type === "group"
        ? groupStatus(item.orders)
        : item.order.status?.toLowerCase() || "";
    return status === "delivered";
  });
  const cancelled = items.filter((item) => {
    const status =
      item.type === "group"
        ? groupStatus(item.orders)
        : item.order.status?.toLowerCase() || "";
    return status === "cancelled";
  });
  return { ongoing, delivered, cancelled };
};

 

export default function ProfileOrdersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
        <Pressable
          onPress={() => router.back()}
          className="mt-4 h-10 w-10 items-center justify-center rounded-full bg-muted"
        >
          <BackIcon variant="chevron" size={22} className="text-foreground" />
        </Pressable>

        <View className="mt-4 mb-4 flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-foreground">
            {t("profile.myOrders")}
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
                {t(`orderTracking.tabs.${TAB_KEYS[tab]}`)}
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
              {t("orderTracking.noOrdersYet", { tab: t(`orderTracking.tabs.${TAB_KEYS[activeTab]}`) })}
            </Text>
            <Text className="mt-2 text-sm text-muted-foreground">
              {t("orderTracking.ordersWillAppear", { tab: t(`orderTracking.tabs.${TAB_KEYS[activeTab]}`) })}
            </Text>
          </View>
        ) : (
          visibleOrders.map((item) => {
            if (item.type === "group") {
              const orders = item.orders;
              // Delivery fee is one combined charge for the trip, not
              // per-shop, so only the first order's fee counts.
              const combinedSubTotal = orders.reduce(
                (sum, o) => sum + Number(o.sub_total ?? 0),
                0,
              );
              const combinedDeliveryFee = Number(orders[0]?.delivery_fee ?? 0);
              const combinedTotal = combinedSubTotal + combinedDeliveryFee;
              const combinedItemCount = orders.reduce(
                (sum, o) => sum + (o.items?.length ?? 0),
                0,
              );
              const orderNumbers = orders
                .map((o) => o.order_number || o.id)
                .join(", ");

              return (
                <Pressable
                  key={`group-${item.order_group_id}`}
                  onPress={() => {
                    if (activeTab === "Ongoing") {
                      router.push({
                        pathname: "/order-tracking",
                        params: {
                          groupId: String(item.order_group_id),
                          preloadGroup: JSON.stringify(orders),
                        },
                      });
                    }
                  }}
                  className="mb-4 rounded-3xl border border-border bg-card px-4 py-4"
                  style={{ opacity: activeTab === "Ongoing" ? 1 : 0.9 }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-base font-semibold text-foreground">
                      {t("orderTracking.orderShops", { numbers: orderNumbers, count: orders.length })}
                    </Text>
                    <Text className="text-sm font-semibold text-primary">
                      {orders[0]?.status}
                    </Text>
                  </View>
                  <Text className="text-sm text-muted-foreground">
                    {t("orderTracking.itemsEta", { count: combinedItemCount, eta: orders[0]?.eta || t("orderTracking.etaUnavailable") })}
                  </Text>
                  <Text className="mt-3 text-sm text-foreground">
                    {t("orderTracking.totalAmount", { amount: combinedTotal.toFixed(2), currency: t("common.egp") })}
                  </Text>
                </Pressable>
              );
            }

            const order = item.order;
            return (
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
                    {t("orderTracking.order", { number: order.order_number || order.id })}
                  </Text>
                  <Text className="text-sm font-semibold text-primary">
                    {order.status}
                  </Text>
                </View>
                <Text className="text-sm text-muted-foreground">
                  {t("orderTracking.itemsEta", { count: order.items?.length ?? 0, eta: order.eta || t("orderTracking.etaUnavailable") })}
                </Text>
                <Text className="mt-3 text-sm text-foreground">
                  {t("orderTracking.totalAmount", { amount: Number(order.total ?? 0).toFixed(2), currency: t("common.egp") })}
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
