import { Plus } from "lucide-react-native";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useRTL } from "@/lib/i18n/RTLContext";
import { THEME, useTheme } from "@/lib/theme";
import type {
  FBTRecommendation,
  ReplenishmentRecommendation,
} from "@/features/recommendations/types";

type RecommendationItem = FBTRecommendation | ReplenishmentRecommendation;

const fallbackImage = require("../../../assets/images/icon.png");

interface RecommendationSectionProps {
  title: string;
  items: RecommendationItem[];
  isLoading?: boolean;
  currency?: string;
  onItemPress?: (item: RecommendationItem) => void;
  onAddPress?: (item: FBTRecommendation) => void;
}

export function RecommendationSection({
  title,
  items,
  isLoading,
  currency = "EGP",
  onItemPress,
  onAddPress,
}: RecommendationSectionProps) {
  const { theme } = useTheme();
  const tokens = THEME[theme];
  const { isRTL } = useRTL();

  if (!isLoading && items.length === 0) return null;

  return (
    <View className="mb-4">
      <Text
        className="text-base font-semibold mb-3"
        style={{ color: tokens.foreground }}
      >
        {title}
      </Text>

      {isLoading ? (
        <View className="py-6 items-center">
          <ActivityIndicator color={tokens.primary} />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: isRTL ? "row-reverse" : "row",
          }}
        >
          {items.map((item, index) => {
            const hasShopProduct =
              "shop_product_id" in item && item.shop_product_id;
            const price = "price" in item ? item.price : null;

            return (
              <Pressable
                key={`${item.product_id}-${index}`}
                onPress={() => onItemPress?.(item)}
                style={{
                  width: 128,
                  marginRight: isRTL ? 0 : 12,
                  marginLeft: isRTL ? 12 : 0,
                }}
              >
                <View
                  style={{
                    width: 128,
                    height: 96,
                    borderRadius: 12,
                    overflow: "hidden",
                    backgroundColor: tokens.muted,
                  }}
                >
                  <Image
                    source={item.image_url ? { uri: item.image_url } : fallbackImage}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />

                  {hasShopProduct && onAddPress && (
                    <Pressable
                      onPress={() => onAddPress(item as FBTRecommendation)}
                      style={{
                        position: "absolute",
                        bottom: 6,
                        right: 6,
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: tokens.primary,
                      }}
                    >
                      <Plus size={16} color="white" />
                    </Pressable>
                  )}
                </View>

                <Text
                  numberOfLines={2}
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    marginTop: 6,
                    color: tokens.foreground,
                  }}
                >
                  {item.name}
                </Text>

                {price ? (
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "bold",
                      marginTop: 2,
                      color: tokens.primary,
                    }}
                  >
                    {currency} {price.toFixed(2)}
                  </Text>
                ) : item.brand ? (
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 12,
                      marginTop: 2,
                      color: tokens.mutedForeground,
                    }}
                  >
                    {item.brand}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
