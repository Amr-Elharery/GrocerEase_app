import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, MapPin, Store } from "lucide-react-native";

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useToast } from "@/lib/hooks/useToast";
import {
  updateGroupDeliveryStatus,
  updateOrderDeliveryStatus,
} from "@/shared/delivery.service";
import { Assignment, DeliveryStatus } from "@/lib/types/delivery";

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

export default function DeliveryDetailScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const showToast = useToast();
  const params = useLocalSearchParams<{ id: string; assignment: string }>();

  const initialAssignment: Assignment | null = useMemo(() => {
    try {
      return JSON.parse(params.assignment);
    } catch {
      return null;
    }
  }, [params.assignment]);

  const [assignment, setAssignment] = useState<Assignment | null>(
    initialAssignment,
  );
  const [updating, setUpdating] = useState(false);

  if (!assignment) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: tokens.background }}
      >
        <Text style={{ color: tokens.mutedForeground }}>Delivery not found</Text>
      </SafeAreaView>
    );
  }

  const currentStatus =
    assignment.type === "group"
      ? (assignment.orders[0]?.status as string | undefined)
      : (assignment.order.status as string | undefined);

  const nextStatus: DeliveryStatus | null =
    currentStatus === "delivered"
      ? null
      : currentStatus === "on_the_way"
        ? "delivered"
        : "on_the_way";

  const stops =
    assignment.type === "group" ? assignment.orders : [assignment.order];
  const customerAddress = stops[0]?.customer_address;

  const applyStatusLocally = (status: DeliveryStatus) => {
    setAssignment((prev) => {
      if (!prev) return prev;
      if (prev.type === "group") {
        return {
          ...prev,
          orders: prev.orders.map((o) => ({ ...o, status })),
        };
      }
      return { ...prev, order: { ...prev.order, status } };
    });
  };

  const handleUpdateStatus = async () => {
    if (!nextStatus) return;
    try {
      setUpdating(true);
      if (assignment.type === "group") {
        await updateGroupDeliveryStatus(assignment.order_group_id, nextStatus);
      } else {
        await updateOrderDeliveryStatus(assignment.order.id, nextStatus);
      }
      applyStatusLocally(nextStatus);
      showToast(`Marked as ${statusLabel(nextStatus)}`, "success");
    } catch (error: any) {
      const code = error?.response?.status;
      if (code === 400) {
        showToast("Please follow the delivery status order", "error");
      } else if (code === 403) {
        showToast("This delivery is not assigned to you", "error");
        router.back();
      } else {
        showToast("Could not update status", "error");
      }
    } finally {
      setUpdating(false);
    }
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
          {assignment.type === "group" ? "Trip Detail" : "Delivery Detail"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View
          className="rounded-2xl border p-4 mb-3"
          style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
        >
          <Text className="text-sm mb-1" style={{ color: tokens.mutedForeground }}>
            Current Status
          </Text>
          <Text className="text-lg font-bold" style={{ color: tokens.primary }}>
            {statusLabel(currentStatus)}
          </Text>
        </View>

        <Text
          className="mb-2 font-semibold"
          style={{ color: tokens.foreground }}
        >
          {assignment.type === "group" ? "Pickup Stops" : "Pickup"}
        </Text>
        {stops.map((order, index) => (
          <View
            key={order.id}
            className="rounded-2xl border p-4 mb-3"
            style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
          >
            <View className="flex-row items-center mb-1">
              <Store size={16} color={tokens.primary} />
              <Text
                className="ml-2 font-semibold"
                style={{ color: tokens.foreground }}
              >
                {assignment.type === "group" ? `Stop ${index + 1}: ` : ""}
                {order.shop_name ?? "Shop"}
              </Text>
            </View>
            <Text style={{ color: tokens.mutedForeground }}>
              {order.shop_address}
            </Text>
          </View>
        ))}

        <Text
          className="mb-2 font-semibold"
          style={{ color: tokens.foreground }}
        >
          Drop-off
        </Text>
        <View
          className="rounded-2xl border p-4"
          style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
        >
          <View className="flex-row items-center">
            <MapPin size={16} color={tokens.primary} />
            <Text
              className="ml-2 font-semibold"
              style={{ color: tokens.foreground }}
            >
              Customer Address
            </Text>
          </View>
          <Text style={{ color: tokens.mutedForeground }} className="mt-1">
            {customerAddress}
          </Text>
        </View>
      </ScrollView>

      {nextStatus && (
        <View
          className="absolute bottom-0 left-0 right-0 p-4 border-t"
          style={{ borderColor: tokens.border, backgroundColor: tokens.background }}
        >
          <TouchableOpacity
            onPress={handleUpdateStatus}
            disabled={updating}
            className="py-4 rounded-2xl"
            style={{ backgroundColor: updating ? tokens.muted : tokens.primary }}
          >
            {updating ? (
              <ActivityIndicator color={tokens.primaryForeground} />
            ) : (
              <Text
                className="text-center text-lg font-bold"
                style={{ color: tokens.primaryForeground }}
              >
                Mark as {statusLabel(nextStatus)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
