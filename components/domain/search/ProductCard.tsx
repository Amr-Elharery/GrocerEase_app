/**
 * Product Card Component
 * Displays product in grid with image, name, price, and category
 */

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import type { ProductSearchItem } from "@/lib/types";
import { ShoppingCart } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";

interface ProductCardProps {
  product: ProductSearchItem;
  onPress: (product: ProductSearchItem) => void;
  onAddToCart?: (product: ProductSearchItem) => void;
}

export function ProductCard({
  product,
  onPress,
  onAddToCart,
}: ProductCardProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];

  return (
    <Pressable
      onPress={() => onPress(product)}
      className="flex-1 m-1 rounded-lg overflow-hidden"
      style={{ backgroundColor: tokens.card }}
    >
      {/* Image */}
      <View className="w-full h-40 bg-gray-200 relative">
        {product.thumbnail ? (
          <Image
            source={{ uri: product.thumbnail }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View
            className="w-full h-full items-center justify-center"
            style={{ backgroundColor: tokens.muted }}
          >
            <Text style={{ color: tokens.mutedForeground }}>No Image</Text>
          </View>
        )}

        {/* Add to Cart Button */}
        <Pressable
          onPress={() => onAddToCart?.(product)}
          className="absolute bottom-2 right-2 p-2 rounded-full"
          style={{ backgroundColor: tokens.primary }}
        >
          <ShoppingCart size={16} color="white" />
        </Pressable>
      </View>

      {/* Info */}
      <View className="p-2 flex-1">
        {/* Category */}
        <Text
          className="text-xs mb-1"
          style={{ color: tokens.mutedForeground }}
          numberOfLines={1}
        >
          {product.sub_category_name}
        </Text>

        {/* Product Name */}
        <Text
          className="text-sm font-semibold mb-2"
          style={{ color: tokens.foreground }}
          numberOfLines={2}
        >
          {product.product_name}
        </Text>

        {/* Price */}
        <Text className="text-lg font-bold" style={{ color: tokens.primary }}>
          ${product.cheapest_price.toFixed(2)}
        </Text>
      </View>
    </Pressable>
  );
}
