import type { ProductDisplay } from '@/features/products/types';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { ProductCard } from '@/features/products/components/ProductCard';

interface TopProductsProps {
  products: ProductDisplay[];
  onProductPress?: (product: ProductDisplay) => void;
}

export function TopProducts({ products, onProductPress }: TopProductsProps) {
  const { t } = useTranslation();

  return (
    <View className="bg-background px-4 py-4">
      <Text className="text-foreground text-xl font-bold mb-3">
        {t('home.topProducts')}
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
