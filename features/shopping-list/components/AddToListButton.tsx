import { useShoppingList } from "@/features/shopping-list/hooks/useShoppingList";
import type { ProductDisplay } from "@/features/products/types";
import { Bookmark } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, Text } from "react-native";

interface AddToListButtonProps {
  product: ProductDisplay;
  variant?: "icon" | "full";
  size?: "sm" | "md" | "lg";
}

export function AddToListButton({
  product,
  variant = "icon",
  size = "md",
}: AddToListButtonProps) {
  const { addItem } = useShoppingList();
  const { t } = useTranslation();

  const handlePress = async () => {
    await addItem({
      product_id: product.id,
      product_name: product.product_name,
      brand: product.category?.category_name,
      image_url: product.primaryImage,
    });
  };

  if (variant === "icon") {
    const sizeMap = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
    };

    const iconSizeMap = {
      sm: 16,
      md: 20,
      lg: 24,
    };

    return (
      <Pressable
        onPress={handlePress}
        className={`${sizeMap[size]} items-center justify-center rounded-full bg-primary/10`}
      >
        <Bookmark
          size={iconSizeMap[size]}
          className="text-primary"
          fill="currentColor"
        />
      </Pressable>
    );
  }

  // Full button variant
  return (
    <Pressable
      onPress={handlePress}
      className="bg-primary rounded-full py-3 flex-row items-center justify-center gap-2"
    >
      <Bookmark
        size={20}
        className="text-primary-foreground"
        fill="currentColor"
      />
      <Text className="text-primary-foreground font-semibold">{t("shoppingList.addToList")}</Text>
    </Pressable>
  );
}
