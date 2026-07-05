import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { View } from "react-native";

export function StoreCardSkeleton() {
  return (
    <View style={{ width: "100%" }}>
      <SkeletonPlaceholder>
        <SkeletonPlaceholder.Item
          borderRadius={16}
          width="100%"
          height={220}
        />
      </SkeletonPlaceholder>
    </View>
  );
}