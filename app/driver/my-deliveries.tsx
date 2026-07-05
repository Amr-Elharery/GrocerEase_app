import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { MapPin, Store } from "lucide-react-native";
import { BackIcon } from "@/components/ui/back-icon";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";
import { useToast } from "@/lib/toast/useToast";
import { fetchMyAssignments } from "@/features/driver/services/delivery.service";
import { Assignment } from "@/features/driver/types";

const statusLabel = (t: TFunction, status?: string) => {
  switch (status) {
    case "out_for_delivery":
      return t("driver.status.outForDelivery");
    case "on_the_way":
      return t("driver.status.onTheWay");
    case "delivered":
      return t("driver.status.delivered");
    default:
      return status ?? t("driver.status.pending");
  }
};

export default function MyDeliveriesScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const showToast = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchMyAssignments();
      setAssignments(data);
    } catch {
      showToast(t("driver.myDeliveries.loadFailed"), "error");
    }
  }, [showToast, t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openAssignment = (item: Assignment) => {
    router.push({
      pathname: "/driver/delivery/[id]",
      params: {
        id:
          item.type === "group" ? String(item.order_group_id) : String(item.order.id),
        assignment: JSON.stringify(item),
      },
    });
  };

  const renderItem = ({ item }: { item: Assignment }) => {
    if (item.type === "group") {
      const status = item.orders[0]?.status;
      return (
        <TouchableOpacity
          onPress={() => openAssignment(item)}
          className="rounded-2xl border p-4 mb-3"
          style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Store size={18} color={tokens.primary} />
              <Text
                className={isRTL ? "mr-2 font-bold text-base" : "ml-2 font-bold text-base"}
                style={{ color: tokens.foreground }}
              >
                {t("driver.myDeliveries.tripStops", { count: item.orders.length })}
              </Text>
            </View>
            <Text style={{ color: tokens.primary }} className="font-semibold">
              {statusLabel(t, status)}
            </Text>
          </View>
          {item.orders.map((order) => (
            <Text
              key={order.id}
              style={{ color: tokens.mutedForeground }}
              className="mb-1"
            >
              • {order.shop_name}
            </Text>
          ))}
          <View className="flex-row items-center mt-2">
            <MapPin size={14} color={tokens.mutedForeground} />
            <Text
              className={isRTL ? "mr-1" : "ml-1"}
              style={{ color: tokens.mutedForeground }}
              numberOfLines={1}
            >
              {item.orders[0]?.customer_address}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    const order = item.order;
    return (
      <TouchableOpacity
        onPress={() => openAssignment(item)}
        className="rounded-2xl border p-4 mb-3"
        style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Store size={18} color={tokens.primary} />
            <Text
              className={isRTL ? "mr-2 font-bold text-base" : "ml-2 font-bold text-base"}
              style={{ color: tokens.foreground }}
            >
              {order.shop_name ?? t("driver.available.shop")}
            </Text>
          </View>
          <Text style={{ color: tokens.primary }} className="font-semibold">
            {statusLabel(t, order.status)}
          </Text>
        </View>
        <View className="flex-row items-center">
          <MapPin size={14} color={tokens.mutedForeground} />
          <Text
            className={isRTL ? "mr-1" : "ml-1"}
            style={{ color: tokens.mutedForeground }}
            numberOfLines={1}
          >
            {order.customer_address}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: tokens.background }}
    >
      <View
        className="flex-row items-center px-4 py-4 border-b"
        style={{ borderColor: tokens.border }}
      >
        <TouchableOpacity onPress={() => router.back()} className={isRTL ? "ml-3" : "mr-3"}>
          <BackIcon variant="chevron" size={24} color={tokens.foreground} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: tokens.foreground }}>
          {t("driver.home.myDeliveries")}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={tokens.primary} />
        </View>
      ) : (
        <FlatList
          data={assignments}
          keyExtractor={(item, index) =>
            item.type === "group"
              ? `group-${item.order_group_id}`
              : `single-${item.order.id}-${index}`
          }
          contentContainerStyle={{ padding: 16 }}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <Text
              className="text-center mt-8"
              style={{ color: tokens.mutedForeground }}
            >
              {t("driver.myDeliveries.noActive")}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
