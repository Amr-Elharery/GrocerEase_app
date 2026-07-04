import { Header } from '@/components/domain/home/header';
import { HeroSection } from '@/components/domain/home/hero-section';
import { TopProducts } from '@/components/domain/home/top-products';
import { TopStores } from '@/components/domain/home/top-stores';
import { useAddress } from '@/lib/context/addressContext';
import type { ProductDisplay, ShopDisplay } from '@/lib/types';
import { shopService } from '@/shared/shop.service';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { addresses, selectedAddressId } = useAddress();
  const areaId = addresses.find((a) => a.id === selectedAddressId)?.area_id;

  const [stores, setStores] = useState<ShopDisplay[]>([]);
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHomeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const shopResults = await shopService.getShops(areaId, 6, 0);
      setStores(shopResults);

      const productBatches = await Promise.all(
        shopResults
          .slice(0, 3)
          .map((shop) => shopService.getShopProducts(shop.id, 4, 0)),
      );
      const flattened = productBatches.flatMap((batch) => batch.products);
      setProducts(flattened.slice(0, 8));
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [areaId]);

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [loadHomeData]),
  );

  const handleSearch = (_query: string, mode: 'product' | 'store') => {
    router.push(mode === 'store' ? '/(tabs)/shops' : '/(tabs)/search');
  };

  const handleStorePress = (store: ShopDisplay) => {
    router.push({
      pathname: "/shop/[id]",
      params: { id: String(store.id) },
    });
  };

  const handleProductPress = (product: ProductDisplay) => {
    router.push(`/product-details?id=${product.product_id ?? product.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1">
        <Header onSearch={handleSearch} />

        <HeroSection />

        {isLoading ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" />
          </View>
        ) : stores.length === 0 ? (
          <View className="items-center justify-center px-4 py-16">
            <Text className="text-muted-foreground text-center">
              No shops found in your area yet.
            </Text>
          </View>
        ) : (
          <>
            <TopStores stores={stores} onStorePress={handleStorePress} />
            <TopProducts
              products={products}
              onProductPress={handleProductPress}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
