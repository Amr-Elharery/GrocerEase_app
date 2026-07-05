import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, MapPin, Store } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useToast } from "@/lib/hooks/useToast";
import {
  clearShoppingList,
  submitOptimizedOrder,
  type OptimizationPlan,
  type ShoppingListItem,
} from "@/shared/shopping-list.service";

const formatMoney = (value?: number) => `EGP ${Number(value ?? 0).toFixed(2)}`;

export default function OptimizationScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const toast = useToast();
  const params = useLocalSearchParams<{
    plan: string;
    items: string;
    customerAddressId: string;
  }>();

  const [submitting, setSubmitting] = useState(false);

  const plan: OptimizationPlan | null = useMemo(() => {
    try {
      return JSON.parse(params.plan);
    } catch {
      return null;
    }
  }, [params.plan]);

  const localItems: ShoppingListItem[] = useMemo(() => {
    try {
      return JSON.parse(params.items) ?? [];
    } catch {
      return [];
    }
  }, [params.items]);

  const customerAddressId = Number(params.customerAddressId);

  const shopGroups = useMemo(() => {
    if (!plan) return [];

    const groups = new Map<
      number,
      { shop_id: number; store: string; items: { product_id: string; product_name?: string; price: number; quantity: number }[] }
    >();

    for (const [productId, assignment] of Object.entries(plan.item_assignment)) {
      const localItem = localItems.find(
        (i) => String(i.product_id) === productId,
      );
      const existing = groups.get(assignment.shop_id);
      const entry = {
        product_id: productId,
        product_name: localItem?.product_name,
        price: assignment.price,
        quantity: localItem?.qty ?? 1,
      };

      if (existing) {
        existing.items.push(entry);
      } else {
        groups.set(assignment.shop_id, {
          shop_id: assignment.shop_id,
          store: assignment.store,
          items: [entry],
        });
      }
    }

    return Array.from(groups.values());
  }, [plan, localItems]);

  const handleConfirm = async () => {
    if (!plan) return;

    try {
      setSubmitting(true);

      const orders = shopGroups.map((group) => ({
        shop_id: group.shop_id,
        customer_address_id: customerAddressId,
        payment_method: "cash_on_delivery",
        items: group.items.map((item) => {
          const assignment = plan.item_assignment[item.product_id];
          return {
            shop_product_id: assignment.shop_product_id,
            quantity: item.quantity,
          };
        }),
      }));

      await submitOptimizedOrder({
        customer_address_id: customerAddressId,
        payment_method: "cash_on_delivery",
        orders,
      });

      await clearShoppingList();
      toast("Order placed successfully", "success");
      router.replace("/profile-orders");
    } catch (error: any) {
      console.error("Order submission failed", error);
      toast(
        "Could not place your order. Stock or prices may have changed — please re-run the plan.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!plan) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: tokens.background }}
      >
        <Text style={{ color: tokens.mutedForeground }}>
          No optimization plan found
        </Text>
      </SafeAreaView>
    );
  }

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
        <Pressable onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color={tokens.foreground} />
        </Pressable>
        <View>
          <Text
            className="text-xl font-bold"
            style={{ color: tokens.foreground }}
          >
            Review Your Plan
          </Text>
          <Text style={{ color: tokens.mutedForeground }}>
            {plan.stores_to_visit.length} shop
            {plan.stores_to_visit.length !== 1 ? "s" : ""} · Confirm before
            ordering
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {shopGroups.map((group) => (
          <View
            key={group.shop_id}
            className="rounded-2xl border p-4 mb-3"
            style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
          >
            <View className="flex-row items-center mb-2">
              <Store size={18} color={tokens.primary} />
              <Text
                className="ml-2 font-bold text-base"
                style={{ color: tokens.foreground }}
              >
                {group.store}
              </Text>
            </View>
            {group.items.map((item) => (
              <View
                key={item.product_id}
                className="flex-row justify-between py-1"
              >
                <Text style={{ color: tokens.foreground }}>
                  {item.quantity}x {item.product_name ?? `Product #${item.product_id}`}
                </Text>
                <Text style={{ color: tokens.foreground }}>
                  {formatMoney(item.price * item.quantity)}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {Array.isArray(plan.route) && plan.route.length > 0 && (
          <View
            className="rounded-2xl border p-4 mb-3"
            style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
          >
            <Text
              className="font-semibold mb-2"
              style={{ color: tokens.foreground }}
            >
              Route
            </Text>
            {plan.route.map((stop: any, index: number) => (
              <View key={index} className="flex-row items-center mb-1">
                <MapPin size={14} color={tokens.mutedForeground} />
                <Text className="ml-2" style={{ color: tokens.mutedForeground }}>
                  {typeof stop === "string" ? stop : JSON.stringify(stop)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View
          className="rounded-2xl border p-4"
          style={{ borderColor: tokens.border, backgroundColor: tokens.card }}
        >
          <View className="flex-row justify-between mb-2">
            <Text style={{ color: tokens.mutedForeground }}>Items Cost</Text>
            <Text style={{ color: tokens.foreground }}>
              {formatMoney(plan.item_cost)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text style={{ color: tokens.mutedForeground }}>Delivery Cost</Text>
            <Text style={{ color: tokens.foreground }}>
              {formatMoney(plan.delivery_cost)}
            </Text>
          </View>
          <View
            className="flex-row justify-between mt-2 pt-2 border-t"
            style={{ borderColor: tokens.border }}
          >
            <Text
              className="font-bold text-lg"
              style={{ color: tokens.foreground }}
            >
              Total
            </Text>
            <Text
              className="font-bold text-lg"
              style={{ color: tokens.primary }}
            >
              {formatMoney(plan.total_cost)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 p-4 border-t"
        style={{ borderColor: tokens.border, backgroundColor: tokens.background }}
      >
        <Pressable
          onPress={handleConfirm}
          disabled={submitting}
          className="py-4 rounded-2xl items-center"
          style={{ backgroundColor: submitting ? tokens.muted : tokens.primary }}
        >
          {submitting ? (
            <ActivityIndicator color={tokens.primaryForeground} />
          ) : (
            <Text
              className="text-lg font-bold"
              style={{ color: tokens.primaryForeground }}
            >
              Confirm & Place Order
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
