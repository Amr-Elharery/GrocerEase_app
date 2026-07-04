import { ProtectedScreen } from "@/components/domain/ProtectedScreen";
import { StoreCard } from "@/components/domain/store-card";
import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import { useAddress } from "@/lib/context/addressContext";
import type { ShopDisplay } from "@/lib/types";
import { shopService } from "@/shared/shop.service";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 20;

export default function ShopListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { addresses, selectedAddressId } = useAddress();
  const areaId = addresses.find((a) => a.id === selectedAddressId)?.area_id;

  const [stores, setStores] = useState<ShopDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadShops = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await shopService.getShops(areaId, PAGE_SIZE, 0);
      setStores(data);
      setOffset(data.length);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [areaId]);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;
    setIsLoadingMore(true);
    try {
      const data = await shopService.getShops(areaId, PAGE_SIZE, offset);
      setStores((prev) => [...prev, ...data]);
      setOffset((prev) => prev + data.length);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, isLoading, offset, areaId]);

  const handleStorePress = (store: ShopDisplay) => {
    router.push({
      pathname: "/shop/[id]",
      params: { id: String(store.id) },
    });
  };

  return (
  
      <SafeAreaView
        className="flex-1 bg-background"
        edges={["top"]}
        style={{ backgroundColor: tokens.background }}
      >
        <View className="flex-1 px-4 pt-4">
          <View className="mb-6">
            <Text className="text-foreground text-3xl font-bold">Shops</Text>
            <Text className="text-muted-foreground mt-1">
              Browse shops in your area
            </Text>
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={tokens.primary} />
            </View>
          ) : (
            <FlatList
              data={stores}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <View className="mb-4">
                  <StoreCard store={item} onPress={handleStorePress} />
                </View>
              )}
              onEndReached={loadMore}
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                isLoadingMore ? (
                  <ActivityIndicator
                    style={{ marginVertical: 12 }}
                    color={tokens.primary}
                  />
                ) : null
              }
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center py-20">
                  <Text className="text-muted-foreground">No shops found</Text>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
  
  );
}