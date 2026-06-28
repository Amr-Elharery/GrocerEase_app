import type { ShopDisplay } from "@/lib/types";
import { Image, Pressable, Text, View } from "react-native";

interface StoreCardProps {
  store: ShopDisplay;
  onPress?: (store: ShopDisplay) => void;
}

export function StoreCard({ store, onPress }: StoreCardProps) {

  const imageSource = store.logo_url
    ? { uri: store.logo_url }
    : require("../../assets/images/icon.png");
console.log("logo:", store);
   
  return (
    <Pressable
      onPress={() => onPress?.(store)}
      className="bg-card border border-border rounded-xl p-3 mr-3 w-full"
    >

      {/* logo */}
      <View className="w-full h-24 rounded-lg overflow-hidden mb-3">
        <Image
          source={imageSource}
          className="w-full h-full "
          resizeMode="cover"
        />
      </View>


      {/* name */}
      <Text
        className="text-card-foreground font-bold text-base"
        numberOfLines={1}
      >
        {store.shop_name}
      </Text>


      {/* description */}
      <Text
        className="text-muted-foreground text-xs mt-1"
        numberOfLines={2}
      >
        {store.description || "No description"}
      </Text>


      {/* active status */}
      <View className="mt-2 flex-row items-center">

        <View
          className={`w-2 h-2 rounded-full mr-2 ${
            store.is_active ? "bg-green-500" : "bg-red-500"
          }`}
        />

        <Text className="text-xs text-muted-foreground">
          {store.is_active ? "Active" : "Inactive"}
        </Text>

      </View>

    </Pressable>
  );
}