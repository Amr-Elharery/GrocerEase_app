import { ProtectedScreen } from "@/components/domain/ProtectedScreen";
import { watchlistService } from "@/shared/watchlist.service";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ChevronRight,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const fallbackProductImage = require("../../assets/images/bread.jpg");

type RowItem = Awaited<
  ReturnType<typeof watchlistService.getWatchlist>
>[number];

function TrendIndicator({
  current,
  previous,
  target,
}: {
  current: number;
  previous?: number;
  target: number;
}) {
  const reference =
    typeof previous === "number" && previous > 0 ? previous : target;

  const isDrop = current <= reference;

  return (
    <View className="flex-row items-center gap-1">
      {isDrop ? (
        <TrendingDown size={14} className="text-emerald-600" />
      ) : (
        <TrendingUp size={14} className="text-red-500" />
      )}
      <Text
        className={`text-xs font-semibold ${
          isDrop ? "text-emerald-600" : "text-red-500"
        }`}
      >
        {isDrop ? "Down" : "Up"}
      </Text>
    </View>
  );
}

export default function WishlistScreen() {
  const router = useRouter();
  const [items, setItems] = useState<RowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadWatchlist = useCallback(async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const rows = await watchlistService.getWatchlist();
      setItems(rows);
    } catch (error: any) {
      setErrorMessage(error?.message ?? "Failed to load wishlist.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWatchlist().catch(() => undefined);
    }, [loadWatchlist]),
  );

  const onDelete = async (item: RowItem) => {
    await watchlistService.remove(item.id);
    setItems((prev) => prev.filter((row) => row.id !== item.id));
  };

  return (
    <ProtectedScreen screenName="Wishlist">
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ paddingVertical: 16 }}>
            <Text className="text-foreground text-2xl font-bold">Wishlist</Text>
            <Text className="text-muted-foreground text-sm mt-1">
              Track target prices and react to price drops.
            </Text>
          </View>

          {/* حالات العرض */}
          {errorMessage ? (
            <View className="bg-card border border-red-500 rounded-xl p-4 mb-3">
              <View className="flex-row items-center gap-2 mb-1">
                <TriangleAlert size={18} className="text-red-500" />
                <Text className="text-foreground font-semibold">
                  Cannot load wishlist
                </Text>
              </View>
              <Text className="text-muted-foreground text-sm">
                {errorMessage}
              </Text>
            </View>
          ) : isLoading ? (
            <View className="bg-card border border-border rounded-xl p-4 mb-3">
              <Text className="text-muted-foreground">Loading wishlist...</Text>
            </View>
          ) : items.length === 0 ? (
            <View className="bg-card border border-border rounded-xl p-4 mb-3">
              <Text className="text-foreground font-semibold mb-1">
                No watched products yet
              </Text>
              <Text className="text-muted-foreground text-sm">
                Use the bell on product details to watch price and set a target.
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <Swipeable
                key={item.id}
                overshootRight={false}
                rightThreshold={40}
                onSwipeableOpen={() => onDelete(item)}
                renderRightActions={() => (
                  <View className="w-20 bg-red-500 rounded-xl items-center justify-center mx-1 my-1">
                    <Text className="text-white font-semibold">Delete</Text>
                  </View>
                )}
              >
                <Pressable
                  className="flex-row items-center bg-card border border-border rounded-2xl p-4 mb-3 w-full"
                  style={{ elevation: 2 }}
                  onPress={() =>
                    router.push({
                      pathname: "/product-details",
                      params: { id: String(item.product_id) },
                    })
                  }
                >
                  {/* Image */}
                  <Image
                    source={
                      item.product_image
                        ? { uri: item.product_image }
                        : fallbackProductImage
                    }
                    className="w-14 h-14 rounded-xl"
                    resizeMode="cover"
                  />

                  {/* Info */}
                  <View className="flex-1 ml-3">
                    <Text
                      className="text-foreground font-semibold text-base"
                      numberOfLines={1}
                    >
                      {item.product_name ?? `Product #${item.product_id}`}
                    </Text>

                    <View className="flex-row items-center justify-between mt-2">
                      <Text
                        className="text-muted-foreground text-xs flex-shrink"
                        numberOfLines={1}
                      >
                        Target: {item.target_price.toFixed(2)} EGP
                      </Text>

                      <TrendIndicator
                        current={item.current_price}
                        previous={item.previous_price}
                        target={item.target_price}
                      />
                    </View>

                    <Text
                      className="text-primary font-bold text-base mt-1 flex-shrink"
                      numberOfLines={1}
                    >
                      Current: {item.current_price.toFixed(2)} EGP
                    </Text>
                  </View>

                  <ChevronRight
                    size={20}
                    className="text-muted-foreground ml-2"
                  />
                </Pressable>
              </Swipeable>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ProtectedScreen>
  );
}
