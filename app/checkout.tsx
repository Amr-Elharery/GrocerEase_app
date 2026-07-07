import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ProtectedScreen } from "@/features/auth/components/ProtectedScreen";
import { useAddress } from "@/features/addresses/hooks/addressContext";
import { useCart } from "@/features/cart/hooks/cartContext";
import { BackIcon } from "@/components/ui/back-icon";
import { THEME, useTheme } from "@/lib/theme";
import { useToast } from "@/lib/toast/useToast";
import httpService from "@/shared/httpService";
import { placeOrder } from "@/features/checkout/services/checkout.service";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutScreen() {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { t } = useTranslation();
  const toast = useToast();
  const { cart, shopId, subtotal, clearCart } = useCart();
  const { addresses, selectedAddressId } = useAddress();

  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [loading, setLoading] = useState(false);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const deliveryFee = subtotal > 0 ? 15 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    console.log("[checkout] handlePlaceOrder called", {
      selectedAddressId,
      addressesCount: addresses.length,
      cartLength: cart.length,
      shopId,
    });

    if (!selectedAddress) {
      Alert.alert(t("checkout.missingInfoTitle"), t("checkout.missingAddress"));
      return;
    }

    if (cart.length === 0) {
      Alert.alert(t("checkout.emptyCartTitle"), t("cart.empty"));
      return;
    }

    try {
      setLoading(true);

      let customerAddressId = selectedAddress.id;

      if (!customerAddressId) {
        const created = await httpService.post(`/addresses`, {
          area_id: selectedAddress.area_id,
          street: selectedAddress.street,
          building: selectedAddress.building,
          floor: selectedAddress.floor,
          apt_number: selectedAddress.apt_number,
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude,
          label: selectedAddress.label,
          additional_directions: selectedAddress.additional_directions,
        });
        customerAddressId = created.data.id;
      }

      const payload = {
        shop_id: shopId,
        customer_address_id: customerAddressId,
        payment_method: paymentMethod,
        items: cart.map((item) => ({
          shop_product_id: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await placeOrder(payload);
      console.log(response);
      if (!response?.data) {
        throw new Error(t("checkout.placeOrderFailed"));
      }

      clearCart();
      toast(t("checkout.orderPlaced"), "success");
      router.replace("/profile-orders");
    } catch (error: any) {
      console.error("[checkout] place order failed", error);
      Alert.alert(
        t("common.error"),
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          t("checkout.placeOrderFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedScreen screenName={t("checkout.title")}>
      <SafeAreaView
        className="flex-1 bg-background"
        edges={["top"]}
        style={{ backgroundColor: tokens.background }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full mb-4"
            style={{ backgroundColor: tokens.muted }}
          >
            <BackIcon variant="chevron" size={22} color={tokens.foreground} />
          </TouchableOpacity>

          <View className="mb-6">
            <Text
              className="text-foreground text-3xl font-bold"
              style={{ color: tokens.foreground }}
            >
              {t("checkout.title")}
            </Text>

            <Text
              className="text-muted-foreground mt-1"
              style={{ color: tokens.mutedForeground }}
            >
              {t("checkout.subtitle")}
            </Text>
          </View>

          {/* Delivery Address (read-only: the customer's currently selected address) */}
          <View className="bg-card border border-border rounded-2xl p-4 mb-5">
            <Text
              className="text-foreground text-lg font-bold mb-4"
              style={{ color: tokens.foreground }}
            >
              {t("checkout.deliveryAddress")}
            </Text>

            {selectedAddress ? (
              <View
                className="p-3 rounded-xl border"
                style={{
                  backgroundColor: tokens.background,
                  borderColor: tokens.border,
                }}
              >
                <Text
                  className="text-foreground font-semibold"
                  style={{ color: tokens.foreground }}
                >
                  {selectedAddress.label || t("checkout.address")}
                </Text>
                <Text
                  className="text-muted-foreground mt-1"
                  style={{ color: tokens.mutedForeground }}
                >
                  {selectedAddress.street}
                  {selectedAddress.building
                    ? `, ${selectedAddress.building}`
                    : ""}
                  {selectedAddress.floor
                    ? `, ${t("checkout.floor", { floor: selectedAddress.floor })}`
                    : ""}
                  {selectedAddress.apt_number
                    ? `, ${t("checkout.apt", { apt: selectedAddress.apt_number })}`
                    : ""}
                </Text>
              </View>
            ) : (
              <View className="items-center py-6">
                <Text
                  className="text-muted-foreground text-center"
                  style={{ color: tokens.mutedForeground }}
                >
                  {t("checkout.noSavedAddresses")}
                </Text>
              </View>
            )}
          </View>

          {/* Payment Method */}
          <View className="bg-card border border-border rounded-2xl p-4 mb-5">
            <Text
              className="text-foreground text-lg font-bold mb-4"
              style={{ color: tokens.foreground }}
            >
              {t("checkout.paymentMethod")}
            </Text>

            <TouchableOpacity
              onPress={() => setPaymentMethod("cash_on_delivery")}
              className="bg-background border rounded-xl p-4"
              style={{
                backgroundColor: tokens.background,
                borderColor:
                  paymentMethod === "cash_on_delivery"
                    ? tokens.primary
                    : tokens.border,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text
                    className="text-foreground font-semibold"
                    style={{ color: tokens.foreground }}
                  >
                    {t("checkout.cod")}
                  </Text>

                  <Text
                    className="text-muted-foreground text-sm mt-1"
                    style={{ color: tokens.mutedForeground }}
                  >
                    {t("checkout.codHint")}
                  </Text>
                </View>

                {paymentMethod === "cash_on_delivery" && (
                  <View
                    className="w-5 h-5 rounded-full items-center justify-center"
                    style={{ backgroundColor: tokens.primary }}
                  >
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Order Summary */}
          <View className="bg-card border border-border rounded-2xl p-4 mb-6">
            <Text
              className="text-foreground text-lg font-bold mb-4"
              style={{ color: tokens.foreground }}
            >
              {t("checkout.orderSummary")}
            </Text>

            <View className="flex-row justify-between mb-3">
              <Text
                className="text-muted-foreground"
                style={{ color: tokens.mutedForeground }}
              >
                {t("checkout.subtotalItems", { count: cart.length })}
              </Text>

              <Text
                className="text-foreground font-semibold"
                style={{ color: tokens.foreground }}
              >
                {subtotal.toFixed(2)} {t("common.egp")}
              </Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <Text
                className="text-muted-foreground"
                style={{ color: tokens.mutedForeground }}
              >
                {t("checkout.deliveryFee")}
              </Text>

              <Text
                className="text-foreground font-semibold"
                style={{ color: tokens.foreground }}
              >
                {deliveryFee.toFixed(2)} {t("common.egp")}
              </Text>
            </View>

            <View
              className="h-[1px] bg-border mb-4"
              style={{ backgroundColor: tokens.border }}
            />

            <View className="flex-row justify-between">
              <Text
                className="text-foreground text-lg font-bold"
                style={{ color: tokens.foreground }}
              >
                {t("checkout.total")}
              </Text>

              <Text
                className="text-primary text-lg font-bold"
                style={{ color: tokens.primary }}
              >
                {total.toFixed(2)} {t("common.egp")}
              </Text>
            </View>
          </View>

          {/* Place Order Button */}
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={loading}
            className={`py-4 rounded-2xl ${
              loading ? "bg-gray-400" : "bg-primary"
            }`}
          >
            <Text className="text-white text-center text-lg font-bold">
              {loading ? t("checkout.placingOrder") : t("checkout.placeOrder")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ProtectedScreen>
  );
}
