import type { ShopDisplay } from '@/lib/types';
import { Text, View } from 'react-native';
import { StoreCard } from '../store-card';

interface TopStoresProps {
  stores: ShopDisplay[];
  onStorePress?: (store: ShopDisplay) => void;
}

export function TopStores({ stores, onStorePress }: TopStoresProps) {

  const topStores = [...stores]
    .sort((a, b) => {
      if ((b.averageRating ?? 0) !== (a.averageRating ?? 0)) {
        return (b.averageRating ?? 0) - (a.averageRating ?? 0);
      }
      return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
    })
    .slice(0, 4);

  return (
    <View className="bg-background py-4">

      <Text className="text-foreground text-xl font-bold px-4 mb-3">
        Top Stores
      </Text>

      <View className="flex-row flex-wrap px-4 gap-3">

        {topStores.map((store) => (
          <View 
            key={store.id}
            className="w-[48%]"
          >
            <StoreCard
              store={store}
              onPress={onStorePress}
            />
          </View>
        ))}

      </View>

    </View>
  );
}