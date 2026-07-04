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
import { ChevronLeft } from "lucide-react-native";

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useToast } from "@/lib/hooks/useToast";
import { acceptGroupOrder, acceptOrder } from "@/shared/delivery.service";
import { AvailableJob, DeliveryOrder } from "@/lib/types/delivery";

export default function JobDetailScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const showToast = useToast();
  const params = useLocalSearchParams<{ id: string; job: string }>();

  const job: AvailableJob | null = useMemo(() => {
    try {
      return JSON.parse(params.job);
    } catch {
      return null;
    }
  }, [params.job]);

  const [accepting, setAccepting] = useState(false);

  if (!job) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: tokens.background }}
      >
        <Text style={{ color: tokens.mutedForeground }}>Job not found</Text>
      </SafeAreaView>
    );
  }

  const handleAccept = async () => {
    try {
      setAccepting(true);
      if (job.type === "group") {
        await acceptGroupOrder(job.order_group_id);
      } else {
        await acceptOrder(job.order.id);
      }
      router.replace("/driver/my-deliveries");
    } catch (error: any) {
      if (error?.response?.status === 409) {
        showToast("This order was just taken by another driver", "error");
        router.back();
      } else {
        showToast("Could not accept this job", "error");
      }
    } finally {
      setAccepting(false);
    }
  };

  const renderOrder = (order: DeliveryOrder) => (
    <View
      key={order.id}
      className="rounded-2xl border p-4 mb-3"
      style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
    >
      <Text className="font-bold text-base mb-1" style={{ color: tokens.foreground }}>
        {order.shop_name ?? "Shop"}
      </Text>
      <Text style={{ color: tokens.mutedForeground }}>{order.shop_address}</Text>

      <Text
        className="mt-3 mb-1 text-sm"
        style={{ color: tokens.mutedForeground }}
      >
        Items
      </Text>
      {(order.items ?? []).map((item) => (
        <View
          key={item.id}
          className="flex-row justify-between py-1"
        >
          <Text style={{ color: tokens.foreground }}>
            {item.quantity ?? 1}x {item.product_name ?? "Item"}
          </Text>
          <Text style={{ color: tokens.foreground }}>{item.subtotal ?? 0}</Text>
        </View>
      ))}

      <View className="flex-row justify-between mt-3 pt-3 border-t" style={{ borderColor: tokens.border }}>
        <Text style={{ color: tokens.mutedForeground }}>Subtotal + Fee</Text>
        <Text className="font-semibold" style={{ color: tokens.foreground }}>
          {order.subtotal ?? 0} + {order.delivery_fee ?? 0}
        </Text>
      </View>
    </View>
  );

  const customerAddress =
    job.type === "group"
      ? job.orders[0]?.customer_address
      : job.order.customer_address;

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
          {job.type === "group" ? "Multi-stop Delivery" : "Order Detail"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {job.type === "group" ? (
          job.orders.map(renderOrder)
        ) : (
          renderOrder(job.order)
        )}

        <View
          className="rounded-2xl border p-4 mt-1"
          style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
        >
          <Text
            className="text-sm mb-1"
            style={{ color: tokens.mutedForeground }}
          >
            Customer Drop-off Address
          </Text>
          <Text style={{ color: tokens.foreground }}>{customerAddress}</Text>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 p-4 border-t"
        style={{ borderColor: tokens.border, backgroundColor: tokens.background }}
      >
        <TouchableOpacity
          onPress={handleAccept}
          disabled={accepting}
          className="py-4 rounded-2xl"
          style={{ backgroundColor: accepting ? tokens.muted : tokens.primary }}
        >
          {accepting ? (
            <ActivityIndicator color={tokens.primaryForeground} />
          ) : (
            <Text
              className="text-center text-lg font-bold"
              style={{ color: tokens.primaryForeground }}
            >
              Accept
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
