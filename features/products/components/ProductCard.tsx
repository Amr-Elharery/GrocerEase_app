import type { ProductDisplay } from '@/features/products/types';
import { useRTL } from '@/lib/i18n/RTLContext';
import { ShoppingCart, Store } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, Text, View } from 'react-native';

interface ProductCardProps {
  product: ProductDisplay;
  onPress?: (product: ProductDisplay) => void;
  onAddToCart?: (product: ProductDisplay) => void;
}

const fallbackProductImage = require('../../../assets/images/icon.png');

export function ProductCard({ product, onPress, onAddToCart }: ProductCardProps) {
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const imageSource = product.primaryImage
    ? { uri: product.primaryImage }
    : fallbackProductImage;
  const outOfStock = product.stock === 0;

  return (
    <Pressable
      onPress={() => onPress?.(product)}
      className="flex-1 bg-card border border-border rounded-lg p-3 m-1"
    >
      <View className="relative">
        <Image
          source={imageSource}
          className="w-full h-32 rounded-md mb-2"
          resizeMode="cover"
        />

        {onAddToCart && (
          <Pressable
            onPress={() => !outOfStock && onAddToCart(product)}
            disabled={outOfStock}
            className={isRTL ? "absolute bottom-4 left-2 p-2 rounded-full bg-primary" : "absolute bottom-4 right-2 p-2 rounded-full bg-primary"}
            style={{ opacity: outOfStock ? 0.5 : 1 }}
          >
            <ShoppingCart size={16} color="white" />
          </Pressable>
        )}
      </View>

      <Text
        className="text-card-foreground font-semibold text-sm mb-1"
        numberOfLines={2}
      >
        {product.product_name}
      </Text>

      <View className={isRTL ? "flex-row-reverse items-center justify-between" : "flex-row items-center justify-between"}>
        {product.shop_price > 0 && (
          <Text className="text-primary font-bold text-base">
            {product.shop_price.toFixed(2)} {t('common.egp')}
          </Text>
        )}

        <View className={isRTL ? "flex-row-reverse items-center bg-muted px-2 py-1 rounded" : "flex-row items-center bg-muted px-2 py-1 rounded"}>
          <Store size={12} className={isRTL ? "text-muted-foreground ml-1" : "text-muted-foreground mr-1"} />
          <Text className="text-muted-foreground text-xs" numberOfLines={1}>
            {product.shop_name}
          </Text>
        </View>
      </View>

      {product.stock < 10 && product.stock > 0 && (
        <Text className="text-warning text-xs mt-1">
          {t('products.detail.onlyLeft', { count: product.stock })}
        </Text>
      )}

      {outOfStock && (
        <Text className="text-destructive text-xs mt-1">{t('products.detail.outOfStock')}</Text>
      )}
    </Pressable>
  );
}
