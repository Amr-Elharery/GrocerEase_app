/**
 * Product Card Component
 * Displays product in grid with image, name, price, and category
 */

import { THEME } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";
import type { ProductSearchItem } from "@/lib/types";
import { ClipboardList } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";

interface ProductCardProps {
  product: ProductSearchItem;
  onPress: (product: ProductSearchItem) => void;
  onAddToList?: (product: ProductSearchItem) => void;
}

export function ProductCard({
  product,
  onPress,
  onAddToList,
}: ProductCardProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];

  return (
    <Pressable
      onPress={() => onPress(product)}
      style={{
        flex: 1,
        margin: 4,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: tokens.card,
      }}
    >
      {/* Image */}
      <View style={{ width: "100%", height: 160, backgroundColor: "#e5e5e5", position: "relative" }}>
        {product.thumbnail ? (
          <Image
            source={{ uri: product.thumbnail }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: tokens.muted,
            }}
          >
            <Text style={{ color: tokens.mutedForeground }}>No Image</Text>
          </View>
        )}

        {/* Add to Shopping List Button */}
        <Pressable
          onPress={() => onAddToList?.(product)}
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            padding: 8,
            borderRadius: 999,
            backgroundColor: tokens.primary,
          }}
        >
          <ClipboardList size={16} color="white" />
        </Pressable>
      </View>

      {/* Info */}
      <View style={{ padding: 8 }}>
        {/* Category */}
        <Text
          style={{ color: tokens.mutedForeground, fontSize: 12, marginBottom: 4 }}
          numberOfLines={1}
        >
          {product.sub_category_name || " "}
        </Text>

        {/* Product Name */}
        <Text
          style={{
            color: tokens.foreground,
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 8,
          }}
          numberOfLines={2}
        >
          {product.product_name || "Unnamed product"}
        </Text>

        {/* Price */}
        {product.cheapest_price > 0 && (
          <Text style={{ color: tokens.primary, fontSize: 18, fontWeight: "bold" }}>
            EGP {product.cheapest_price.toFixed(2)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
