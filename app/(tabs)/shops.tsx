import { ProtectedScreen } from "@/components/domain/ProtectedScreen";
import { StoreCard } from "@/components/domain/store-card";
import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import type { ShopDisplay } from "@/lib/types";
import { shopService } from "@/shared/shop.service";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ShopListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = THEME[theme];

  const [stores, setStores] = useState<ShopDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadShops = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await shopService.getShops();
      setStores(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

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