import { Header } from '@/components/domain/home/header';
import { HeroSection } from '@/components/domain/home/hero-section';
import { TopProducts } from '@/components/domain/home/top-products';
import { TopStores } from '@/components/domain/home/top-stores';
import { MOCK_PRODUCTS, MOCK_STORES } from '@/lib/mock-data';
import type { ProductDisplay, ShopDisplay } from '@/lib/types';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const handleZonePress = () => {
    console.log('Zone selector pressed');
    // TODO: Open zone/area selector modal
  };

  const handleSearch = (query: string, mode: 'product' | 'store') => {
    console.log('Search:', query, 'Mode:', mode);
    // TODO: Implement search functionality
  };

  const handleStorePress = (store: ShopDisplay) => {
    console.log('Store pressed:', store.shop_name);
    // TODO: Navigate to store details
  };

  const handleProductPress = (product: ProductDisplay) => {
    console.log('Product pressed:', product.product_name);
    // TODO: Navigate to product details
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1">
        <Header
          zone="Cairo"
          onZonePress={handleZonePress}
          onSearch={handleSearch}
        />

        <HeroSection />

        <TopStores stores={MOCK_STORES} onStorePress={handleStorePress} />

        <TopProducts
          products={MOCK_PRODUCTS}
          onProductPress={handleProductPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
