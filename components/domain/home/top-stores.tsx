import type { ShopDisplay } from '@/lib/types';
import { ScrollView, Text, View } from 'react-native';
import { StoreCard } from '../store-card';

interface TopStoresProps {
  stores: ShopDisplay[];
  onStorePress?: (store: ShopDisplay) => void;
}

export function TopStores({ stores, onStorePress }: TopStoresProps) {
  return (
    <View className="bg-background py-4">
      <Text className="text-foreground text-xl font-bold px-4 mb-3">
        Top Stores
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} onPress={onStorePress} />
        ))}
      </ScrollView>
    </View>
  );
}
