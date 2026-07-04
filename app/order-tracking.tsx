import {
  cancelOrder,
  fetchOrderById,
  type OrderSummary,
} from "@/shared/order.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle2, Truck, XCircle } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_STEPS = [
  "Pending",
  "Out for Delivery",
  "On the Way",
  "Delivered",
] as const;

const statusIndex = (status: string) => {
  const normalized = status.toLowerCase();
  return STATUS_STEPS.findIndex(
    (step) =>
      step.toLowerCase() === normalized ||
      normalized.includes(step.toLowerCase()),
  );
};

const formatMoney = (value?: number) => {
  return `EGP ${Number(value ?? 0).toFixed(2)}`;
};

export default function OrderTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    preload?: string;
    groupId?: string;
    preloadGroup?: string;
  }>();
  const orderId = params.id;
  const preload = params.preload;
  const groupId = params.groupId;
  const preloadGroup = params.preloadGroup;
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const isGroup = orders !== null && orders.length > 1;

  const combinedStatus = orders?.[0]?.status ?? "";
  const currentStep = useMemo(() => {
    const index = statusIndex(combinedStatus);
    return index >= 0 ? index : 0;
  }, [combinedStatus]);

  // The delivery fee is one combined charge for the whole trip, not
  // charged per shop, so only the first order's fee counts.
  const combinedDeliveryFee = useMemo(
    () => Number(orders?.[0]?.delivery_fee ?? 0),
    [orders],
  );
  const combinedSubTotal = useMemo(
    () => (orders ?? []).reduce((sum, o) => sum + Number(o.sub_total ?? 0), 0),
    [orders],
  );
  const combinedTotal = useMemo(
    () => combinedSubTotal + combinedDeliveryFee,
    [combinedSubTotal, combinedDeliveryFee],
  );
  const combinedItems = useMemo(
    () =>
      (orders ?? []).flatMap((o) =>
        (o.items ?? []).map((item) => ({
          ...item,
          shop_name: o.shop_name,
        })),
      ),
    [orders],
  );

  const loadOrder = useCallback(async () => {
    if (!orderId && !preload && !groupId && !preloadGroup) return;
    try {
      setLoading(true);

      if (preloadGroup) {
        try {
          const parsed = JSON.parse(preloadGroup);
          setOrders(Array.isArray(parsed) ? parsed : [parsed]);
          return;
        } catch (e) {
          console.warn("Invalid group preload data", e);
        }
      }

      if (orderId) {
        const data = await fetchOrderById(orderId);
        setOrders([data]);
        return;
      }

      if (preload) {
        try {
          const parsed = JSON.parse(preload);
          setOrders([parsed]);
          return;
        } catch (e) {
          console.warn("Invalid preload data", e);
        }
      }
    } catch (error: any) {
      console.error("Order load failed", error);

      if (preload) {
        try {
          const parsed = JSON.parse(preload);
          setOrders([parsed]);
          return;
        } catch (e) {
          console.warn("Preload parse failed", e);
        }
      }

      const status = error?.response?.status;
      if (status === 401) {
        Alert.alert(
          "Session Expired",
          "Please log in again to view this order.",
        );
        return;
      }

      Alert.alert(
        "Order Tracking",
        error?.message || "Unable to load order details.",
      );
    } finally {
      setLoading(false);
    }
  }, [orderId, preload, groupId, preloadGroup]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const handleCancel = async () => {
    if (!orderId || !orders || orders.length !== 1) return;
    const order = orders[0];
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            setCancelling(true);
            await cancelOrder(orderId);
            setOrders([{ ...order, status: "Cancelled" }]);
            Alert.alert(
              "Order Canceled",
              "Your order has been canceled successfully.",
            );
          } catch (error: any) {
            Alert.alert(
              "Cancel Order",
              error?.message || "Unable to cancel the order.",
            );
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  const showCancel =
    !isGroup && orders?.[0]?.status?.toLowerCase() === "pending";

  const titleText = orders
    ? isGroup
      ? `Orders ${orders.map((o) => o.order_number || o.id).join(", ")}`
      : orders[0]?.order_number || String(orders[0]?.id ?? "")
    : "";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-6">
          <View className="mb-5 flex-row items-center justify-between py-4">
            <Pressable
              onPress={() => router.back()}
              className="rounded-full p-2"
            >
              <XCircle size={24} className="text-foreground" />
            </Pressable>
            <Text className="flex-1 text-xl font-semibold text-foreground text-center">
              Order Tracking
            </Text>
            <View className="w-10" />
          </View>

          {loading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : orders && orders.length > 0 ? (
            <>
              <View className="mb-6 rounded-3xl border border-border bg-card p-4">
                <Text className="text-sm text-muted-foreground">
                  {isGroup ? "Orders" : "Order ID"}
                </Text>
                <Text className="text-lg font-semibold text-foreground">
                  {titleText}
                </Text>
                {isGroup && (
                  <Text className="mt-1 text-xs text-muted-foreground">
                    Multi-shop delivery · {orders.length} shops
                  </Text>
                )}
                <Text className="mt-2 text-sm text-muted-foreground">
                  Status
                </Text>
                <Text className="text-base font-semibold text-foreground">
                  {combinedStatus}
                </Text>
              </View>

              <View className="mb-6">
                {STATUS_STEPS.map((step, index) => {
                  const complete = index <= currentStep;
                  return (
                    <View key={step} className="flex-row items-center mb-4">
                      <View className="w-8 items-center">
                        <View
                          className={`h-8 w-8 rounded-full items-center justify-center ${complete ? "bg-primary" : "bg-muted"}`}
                        >
                          {complete ? (
                            <CheckCircle2
                              size={18}
                              className="text-primary-foreground"
                            />
                          ) : (
                            <View className="h-3.5 w-3.5 rounded-full bg-background" />
                          )}
                        </View>
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {step}
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          {index === currentStep
                            ? "Current stage"
                            : index < currentStep
                              ? "Completed"
                              : "Upcoming"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View className="mb-6 rounded-3xl border border-border bg-card p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View>
                    <Text className="text-base font-semibold text-foreground">
                      Delivery Address
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {orders[0]?.address?.full_address || "Not available"}
                    </Text>
                  </View>
                  <Truck size={24} className="text-primary" />
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">ETA</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {orders[0]?.eta || "TBD"}
                  </Text>
                </View>
              </View>

              <View className="mb-6 rounded-3xl border border-border bg-card p-4">
                <Text className="mb-3 text-base font-semibold text-foreground">
                  Items
                </Text>
                <FlatList
                  data={combinedItems}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  renderItem={({ item }) => (
                    <View className="mb-3 flex-row items-center justify-between">
                      <View className="flex-1 pr-2">
                        <Text className="text-sm font-medium text-foreground">
                          {item.product_name || "Item"}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          Qty {item.quantity ?? 1}
                          {isGroup && item.shop_name
                            ? ` · ${item.shop_name}`
                            : ""}
                        </Text>
                      </View>
                      <Text className="text-sm font-semibold text-foreground">
                        {formatMoney(item.subtotal ?? item.price ?? 0)}
                      </Text>
                    </View>
                  )}
                  ItemSeparatorComponent={() => (
                    <View className="h-px bg-border my-2" />
                  )}
                  scrollEnabled={false}
                />
              </View>

              <View className="rounded-3xl border border-border bg-card p-4">
                <Text className="text-base font-semibold text-foreground mb-3">
                  Order Summary
                </Text>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-muted-foreground">
                    Subtotal
                  </Text>
                  <Text className="text-sm text-foreground">
                    {formatMoney(combinedSubTotal)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-muted-foreground">
                    Delivery
                  </Text>
                  <Text className="text-sm text-foreground">
                    {formatMoney(combinedDeliveryFee)}
                  </Text>
                </View>
                <View className="h-px bg-border my-3" />
                <View className="flex-row justify-between">
                  <Text className="text-base font-semibold text-foreground">
                    Total
                  </Text>
                  <Text className="text-base font-semibold text-foreground">
                    {formatMoney(combinedTotal)}
                  </Text>
                </View>
              </View>

              {showCancel && (
                <Pressable
                  onPress={handleCancel}
                  disabled={cancelling}
                  className="mt-6 rounded-3xl bg-destructive px-4 py-4 items-center"
                  style={{ opacity: cancelling ? 0.7 : 1 }}
                >
                  {cancelling ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-base font-semibold text-white">
                      Cancel Order
                    </Text>
                  )}
                </Pressable>
              )}
            </>
          ) : (
            <View className="items-center justify-center py-20">
              <Text className="text-base text-muted-foreground">
                Order not found.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
