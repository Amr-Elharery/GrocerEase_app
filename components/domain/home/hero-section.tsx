import { Text, View } from 'react-native';

export function HeroSection() {
  return (
    <View className="bg-background px-4 py-6">
      <Text className="text-foreground text-2xl font-bold mb-2">
        You choose the products. We find the best stores.
      </Text>
      <Text className="text-muted-foreground text-sm leading-5">
        Save more by shopping across stores with the lowest prices, or go local
        and get everything from the nearest store for ultra-fast delivery.
      </Text>
    </View>
  );
}
