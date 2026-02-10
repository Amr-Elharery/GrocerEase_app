import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { useRouter } from "expo-router";
import { CheckCircle, ChevronLeft, Copy } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const storeGroups = [
  {
    id: "group-1",
    storeName: "Kazyon",
    items: [
      { id: "item-1", product: MOCK_PRODUCTS[0], quantity: 2 },
      { id: "item-2", product: MOCK_PRODUCTS[1], quantity: 1 },
    ],
  },
  {
    id: "group-2",
    storeName: "Spinneys",
    items: [{ id: "item-3", product: MOCK_PRODUCTS[2], quantity: 6 }],
  },
  {
    id: "group-3",
    storeName: "Al Othaim",
    items: [{ id: "item-4", product: MOCK_PRODUCTS[3], quantity: 3 }],
  },
];

export default function DeliveryCurrentOrderScreen() {
  const router = useRouter();
  const [deliveryStarted, setDeliveryStarted] = useState(false);

  const handleStartDelivery = () => {
    setDeliveryStarted(true);
    setTimeout(() => {
      router.push("/delivery/(tabs)/inProgress");
    }, 500);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 py-4 border-b border-border">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-muted"
          >
            <ChevronLeft size={22} className="text-foreground" />
          </Pressable>
          <Text className="text-foreground text-2xl font-bold">
            Current Order
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 py-6 gap-4"
        >
          {/* Order ID */}
          <View className="items-center">
            <View className="px-6 py-2 rounded-full border border-border bg-card">
              <Text className="text-foreground font-semibold">
                Order ID: #45821
              </Text>
            </View>
          </View>

          {/* Customer Info */}
          <View className="bg-card border border-border rounded-xl p-4 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground font-semibold text-base">
                Customer Info
              </Text>

              <Pressable className="flex-row items-center gap-1 bg-muted px-3 py-1 rounded-full">
                <Copy size={14} className="text-foreground" />
                <Text className="text-foreground text-xs font-semibold">
                  Copy
                </Text>
              </Pressable>
            </View>

            <Text className="text-muted-foreground text-sm">
              Name: Ahmed Ali
            </Text>
            <Text className="text-muted-foreground text-sm">
              Phone: 01012345678
            </Text>
            <Text className="text-muted-foreground text-sm">
              Address: Nasr City, Abbas El Akkad St, Building 12, Floor 3
            </Text>
          </View>

          {/* Order Summary */}
          <View className="bg-card border border-border rounded-xl p-4 gap-3">
            <Text className="text-foreground font-semibold text-lg">
              Order Summary
            </Text>

            {storeGroups.map((group) => (
              <View key={group.id} className="gap-1">
                <Text className="text-foreground font-semibold text-base">
                  {group.storeName}
                </Text>
                {group.items.map((item) => (
                  <View
                    key={item.id}
                    className="flex-row justify-between items-center gap-2 ml-2"
                  >
                    <View className="flex-1">
                      <Text className="text-muted-foreground text-sm">
                        {item.product?.product_name} × {item.quantity}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}

            <View className="flex-row justify-between border-t border-border pt-3 mt-2">
              <Text className="text-foreground font-semibold">Order Total</Text>
              <Text className="text-foreground font-bold">220 EGP</Text>
            </View>
          </View>

          {/* Fees */}
          <View className="bg-card border border-border rounded-xl p-4 gap-3">
            <Text className="text-foreground font-semibold text-base">
              Payment
            </Text>

            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Delivery Fee</Text>
              <Text className="text-foreground">25 EGP</Text>
            </View>

            <View className="flex-row justify-between border-t border-border pt-3">
              <Text className="text-foreground font-bold">Total</Text>
              <Text className="text-foreground font-bold text-lg">245 EGP</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View className="px-4 pb-6">
          <Pressable
            onPress={handleStartDelivery}
            disabled={deliveryStarted}
            className={`rounded-full py-3 items-center flex-row justify-center gap-2 ${
              deliveryStarted
                ? "bg-success/20 border-2 border-success"
                : "bg-primary"
            }`}
          >
            {deliveryStarted && (
              <CheckCircle size={20} className="text-success" />
            )}
            <Text
              className={`text-base font-semibold ${
                deliveryStarted ? "text-success" : "text-primary-foreground"
              }`}
            >
              {deliveryStarted ? "Delivery Started" : "Start Delivery"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
