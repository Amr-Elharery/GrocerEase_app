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
  const params = useLocalSearchParams<{ id?: string; preload?: string }>();
  const orderId = params.id;
  const preload = params.preload;
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const currentStep = useMemo(() => {
    if (!order) return 0;
    const index = statusIndex(order.status);
    return index >= 0 ? index : 0;
  }, [order]);

  const loadOrder = useCallback(async () => {
    if (!orderId && !preload) return;
    try {
      setLoading(true);

      if (orderId) {
        const data = await fetchOrderById(orderId);
        setOrder(data);
        return;
      }

      // no id but preload available
      if (preload) {
        try {
          const parsed = JSON.parse(preload);
          setOrder(parsed);
          return;
        } catch (e) {
          console.warn("Invalid preload data", e);
        }
      }
    } catch (error: any) {
      console.error("Order load failed", error);

      // If API failed (401 or network), try to use preload fallback
      if (preload) {
        try {
          const parsed = JSON.parse(preload);
          setOrder(parsed);
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
  }, [orderId, preload]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const handleCancel = async () => {
    if (!orderId || !order) return;
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            setCancelling(true);
            await cancelOrder(orderId);
            setOrder({ ...order, status: "Cancelled" });
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

  const showCancel = order?.status?.toLowerCase() === "pending";

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
          ) : order ? (
            <>
              <View className="mb-6 rounded-3xl border border-border bg-card p-4">
                <Text className="text-sm text-muted-foreground">Order ID</Text>
                <Text className="text-lg font-semibold text-foreground">
                  {order.order_number || String(order.id)}
                </Text>
                <Text className="mt-2 text-sm text-muted-foreground">
                  Status
                </Text>
                <Text className="text-base font-semibold text-foreground">
                  {order.status}
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
                      {order.address?.full_address ||
                        `${order.address?.street || ""} ${order.address?.city || ""}`.trim()}
                    </Text>
                  </View>
                  <Truck size={24} className="text-primary" />
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">ETA</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {order.eta || "TBD"}
                  </Text>
                </View>
              </View>

              <View className="mb-6 rounded-3xl border border-border bg-card p-4">
                <Text className="mb-3 text-base font-semibold text-foreground">
                  Items
                </Text>
                <FlatList
                  data={order.items ?? []}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <View className="mb-3 flex-row items-center justify-between">
                      <View>
                        <Text className="text-sm font-medium text-foreground">
                          {item.product_name || "Item"}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          Qty {item.quantity ?? 1}
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
                    {formatMoney(order.sub_total)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-muted-foreground">
                    Delivery
                  </Text>
                  <Text className="text-sm text-foreground">
                    {formatMoney(order.delivery_fee)}
                  </Text>
                </View>
                <View className="h-px bg-border my-3" />
                <View className="flex-row justify-between">
                  <Text className="text-base font-semibold text-foreground">
                    Total
                  </Text>
                  <Text className="text-base font-semibold text-foreground">
                    {formatMoney(order.total)}
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
