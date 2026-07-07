import {
  cancelOrder,
  fetchOrderById,
  hydrateOrderDetails,
  type OrderSummary,
} from "@/features/orders/services/order.service";
import { useRTL } from "@/lib/i18n/RTLContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle2, Truck, XCircle } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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

const STATUS_STEP_KEYS = ["pending", "outForDelivery", "onTheWay", "delivered"] as const;

const statusIndex = (status: string) => {
  const normalized = status.toLowerCase();
  return STATUS_STEPS.findIndex(
    (step) =>
      step.toLowerCase() === normalized ||
      normalized.includes(step.toLowerCase()),
  );
};

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const formatMoney = (value?: number) => `${t("common.egp")} ${Number(value ?? 0).toFixed(2)}`;
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
          const rawOrders: OrderSummary[] = Array.isArray(parsed) ? parsed : [parsed];
          const hydrated = await Promise.all(rawOrders.map(hydrateOrderDetails));
          setOrders(hydrated);
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
          const hydrated = await hydrateOrderDetails(parsed);
          setOrders([hydrated]);
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
          t("orderTracking.sessionExpiredTitle"),
          t("orderTracking.sessionExpiredMessage"),
        );
        return;
      }

      Alert.alert(
        t("orderTracking.title"),
        error?.message || t("orderTracking.loadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [orderId, preload, groupId, preloadGroup, t]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const handleCancel = async () => {
    if (!orderId || !orders || orders.length !== 1) return;
    const order = orders[0];
    Alert.alert(t("orderTracking.cancelTitle"), t("orderTracking.cancelConfirm"), [
      { text: t("orderTracking.no"), style: "cancel" },
      {
        text: t("orderTracking.yes"),
        onPress: async () => {
          try {
            setCancelling(true);
            await cancelOrder(orderId);
            setOrders([{ ...order, status: "Cancelled" }]);
            Alert.alert(
              t("orderTracking.canceledTitle"),
              t("orderTracking.canceledMessage"),
            );
          } catch (error: any) {
            Alert.alert(
              t("orderTracking.cancelTitle"),
              error?.message || t("orderTracking.cancelFailed"),
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
      ? t("orderTracking.ordersTitle", { numbers: orders.map((o) => o.order_number || o.id).join(", ") })
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
              {t("orderTracking.title")}
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
                  {isGroup ? t("orderTracking.orders") : t("orderTracking.orderId")}
                </Text>
                <Text className="text-lg font-semibold text-foreground">
                  {titleText}
                </Text>
                {isGroup && (
                  <Text className="mt-1 text-xs text-muted-foreground">
                    {t("orderTracking.multiShopDelivery", { count: orders.length })}
                  </Text>
                )}
                <Text className="mt-2 text-sm text-muted-foreground">
                  {t("orderTracking.status")}
                </Text>
                <Text className="text-base font-semibold text-foreground">
                  {combinedStatus}
                </Text>
              </View>

              <View className="mb-6">
                {STATUS_STEPS.map((step, index) => {
                  const complete = index <= currentStep;
                  const stepKey = STATUS_STEP_KEYS[index];
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
                      <View className={isRTL ? "mr-3 flex-1" : "ml-3 flex-1"}>
                        <Text className="text-base font-semibold text-foreground">
                          {t(`driver.status.${stepKey}`)}
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          {index === currentStep
                            ? t("orderTracking.currentStage")
                            : index < currentStep
                              ? t("orderTracking.completed")
                              : t("orderTracking.upcoming")}
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
                      {t("checkout.deliveryAddress")}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {orders[0]?.address?.full_address || t("orderTracking.notAvailable")}
                    </Text>
                  </View>
                  <Truck size={24} className="text-primary" />
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">{t("orderTracking.eta")}</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {orders[0]?.eta || t("orderTracking.tbd")}
                  </Text>
                </View>
              </View>

              <View className="mb-6 rounded-3xl border border-border bg-card p-4">
                <Text className="mb-3 text-base font-semibold text-foreground">
                  {t("driver.job.items")}
                </Text>
                <FlatList
                  data={combinedItems}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  renderItem={({ item }) => (
                    <View className={isRTL ? "mb-3 flex-row-reverse items-center justify-between" : "mb-3 flex-row items-center justify-between"}>
                      {item.image_url ? (
                        <Image
                          source={{ uri: item.image_url }}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            marginRight: isRTL ? 0 : 8,
                            marginLeft: isRTL ? 8 : 0,
                          }}
                          resizeMode="cover"
                        />
                      ) : null}
                      <View className={isRTL ? "flex-1 pl-2" : "flex-1 pr-2"}>
                        <Text className="text-sm font-medium text-foreground">
                          {item.product_name || t("driver.job.item")}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          {t("orderTracking.qty", { count: item.quantity ?? 1 })}
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
                  {t("checkout.orderSummary")}
                </Text>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-muted-foreground">
                    {t("cart.subtotal")}
                  </Text>
                  <Text className="text-sm text-foreground">
                    {formatMoney(combinedSubTotal)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-muted-foreground">
                    {t("checkout.deliveryFee")}
                  </Text>
                  <Text className="text-sm text-foreground">
                    {formatMoney(combinedDeliveryFee)}
                  </Text>
                </View>
                <View className="h-px bg-border my-3" />
                <View className="flex-row justify-between">
                  <Text className="text-base font-semibold text-foreground">
                    {t("checkout.total")}
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
                      {t("orderTracking.cancelOrder")}
                    </Text>
                  )}
                </Pressable>
              )}
            </>
          ) : (
            <View className="items-center justify-center py-20">
              <Text className="text-base text-muted-foreground">
                {t("orderTracking.notFound")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
