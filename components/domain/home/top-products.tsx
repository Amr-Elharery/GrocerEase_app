import type { ProductDisplay } from '@/lib/types';
import { Text, View } from 'react-native';
import { ProductCard } from '../product-card';

interface TopProductsProps {
  products: ProductDisplay[];
  onProductPress?: (product: ProductDisplay) => void;
}

export function TopProducts({ products, onProductPress }: TopProductsProps) {
  return (
    <View className="bg-background px-4 py-4">
      <Text className="text-foreground text-xl font-bold mb-3">
        Top Products
      </Text>
      <View>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={onProductPress}
          />
        ))}
      </View>
    </View>
  );
}
