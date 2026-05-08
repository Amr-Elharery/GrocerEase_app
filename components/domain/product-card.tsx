import type { ProductDisplay } from '@/lib/types';
import { Store } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';
import { AddToListButton } from './add-to-list-button';

interface ProductCardProps {
  product: ProductDisplay;
  onPress?: (product: ProductDisplay) => void;
}

const fallbackProductImage = require('../../assets/images/icon.png');

export function ProductCard({ product, onPress }: ProductCardProps) {
  const imageSource = product.primaryImage ?? fallbackProductImage;

  return (
    <Pressable
      onPress={() => onPress?.(product)}
      className="bg-card border border-border rounded-lg p-3 mb-3"
    >
      <Image
        source={imageSource}
        className="w-full h-32 rounded-md mb-2"
        resizeMode="cover"
      />

      <Text
        className="text-card-foreground font-semibold text-base mb-1"
        numberOfLines={2}
      >
        {product.product_name}
      </Text>

      <Text className="text-muted-foreground text-xs mb-2" numberOfLines={1}>
        {product.description}
      </Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-primary font-bold text-lg">
          {product.shop_price.toFixed(2)} EGP
        </Text>

        <View className="flex-row items-center bg-muted px-2 py-1 rounded">
          <Store size={12} className="text-muted-foreground mr-1" />
          <Text className="text-muted-foreground text-xs" numberOfLines={1}>
            {product.shop_name}
          </Text>
        </View>
      </View>

      {product.stock < 10 && product.stock > 0 && (
        <Text className="text-warning text-xs mt-1">
          Only {product.stock} left!
        </Text>
      )}

      {product.stock === 0 && (
        <Text className="text-destructive text-xs mt-1">Out of stock</Text>
      )}
    </Pressable>
  );
}
