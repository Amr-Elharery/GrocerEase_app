import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

type Delivery = {
  id: number;
  customer_address: string;
  item_count: number;
  status: "assigned" | "accepted" | "picked_up";
};

export default function DeliveryHomeScreen() {
  const [deliveries, setDeliveries] = useState<
    Delivery[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "https://your-api.com/deliveries/assigned"
      );

      const data = await response.json();

      setDeliveries(data);
    } catch (err) {
      setError("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (
    status: string
  ) => {
    switch (status) {
      case "assigned":
        return "bg-yellow-500";

      case "accepted":
        return "bg-blue-500";

      case "picked_up":
        return "bg-green-600";

      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top"]}
    >
      <View className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-foreground text-3xl font-bold">
            Deliveries
          </Text>

          <Text className="text-muted-foreground mt-1">
            Assigned orders for delivery
          </Text>
        </View>

        {error ? (
          <Text className="text-red-500">
            {error}
          </Text>
        ) : (
          <FlatList
            data={deliveries}
            keyExtractor={(item) =>
              item.id.toString()
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname:
                      "/delivery-detail",
                    params: {
                      id: item.id.toString(),
                    },
                  })
                }
                className="bg-card border border-border rounded-2xl p-4 mb-4"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-foreground text-xl font-bold">
                    Order #{item.id}
                  </Text>

                  <View
                    className={`px-3 py-1 rounded-full ${getStatusStyle(
                      item.status
                    )}`}
                  >
                    <Text className="text-white text-xs font-bold capitalize">
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text className="text-muted-foreground mt-4">
                  Customer Address
                </Text>

                <Text className="text-foreground font-semibold mt-1">
                  {item.customer_address}
                </Text>

                <View className="mt-4">
                  <Text className="text-muted-foreground">
                    Items Count
                  </Text>

                  <Text className="text-primary font-bold text-lg mt-1">
                    {item.item_count} items
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}