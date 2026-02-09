import type { ShopDisplay } from '@/lib/types';
import { Clock, Star } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';

interface StoreCardProps {
  store: ShopDisplay;
  onPress?: (store: ShopDisplay) => void;
}

export function StoreCard({ store, onPress }: StoreCardProps) {
  const imageSource =
    store.images[0]?.image_url ?? require('../../assets/images/icon.png');

  return (
    <Pressable
      onPress={() => onPress?.(store)}
      className="bg-card border border-border rounded-lg p-3 mr-3 w-40"
    >
      <Image
        source={imageSource}
        className="w-full h-24 rounded-md mb-2"
        resizeMode="cover"
      />
      <Text
        className="text-card-foreground font-semibold text-sm mb-1"
        numberOfLines={1}
      >
        {store.shop_name}
      </Text>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Star size={14} className="text-warning mr-1" fill="rgb(234 179 8)" />
          <Text className="text-muted-foreground text-xs">
            {store.averageRating.toFixed(1)} ({store.reviewCount})
          </Text>
        </View>
      </View>

      {store.deliveryTime && (
        <View className="flex-row items-center mt-1">
          <Clock size={12} className="text-muted-foreground mr-1" />
          <Text className="text-muted-foreground text-xs">
            {store.deliveryTime}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
