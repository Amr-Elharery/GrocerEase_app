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
import { ChevronLeft, MapPin, Store } from "lucide-react-native";

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useToast } from "@/lib/hooks/useToast";
import { fetchMyAssignments } from "@/shared/delivery.service";
import { Assignment } from "@/lib/types/delivery";

const statusLabel = (status?: string) => {
  switch (status) {
    case "out_for_delivery":
      return "Out for Delivery";
    case "on_the_way":
      return "On the Way";
    case "delivered":
      return "Delivered";
    default:
      return status ?? "Pending";
  }
};

export default function MyDeliveriesScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const showToast = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchMyAssignments();
      setAssignments(data);
    } catch {
      showToast("Could not load your deliveries", "error");
    }
  }, [showToast]);

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
                className="ml-2 font-bold text-base"
                style={{ color: tokens.foreground }}
              >
                Trip · {item.orders.length} stops
              </Text>
            </View>
            <Text style={{ color: tokens.primary }} className="font-semibold">
              {statusLabel(status)}
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
              className="ml-1"
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
              className="ml-2 font-bold text-base"
              style={{ color: tokens.foreground }}
            >
              {order.shop_name ?? "Shop"}
            </Text>
          </View>
          <Text style={{ color: tokens.primary }} className="font-semibold">
            {statusLabel(order.status)}
          </Text>
        </View>
        <View className="flex-row items-center">
          <MapPin size={14} color={tokens.mutedForeground} />
          <Text
            className="ml-1"
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
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color={tokens.foreground} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: tokens.foreground }}>
          My Deliveries
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
              No active deliveries
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
