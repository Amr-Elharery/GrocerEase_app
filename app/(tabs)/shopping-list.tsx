import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const fallbackProductImage = require('../../assets/images/icon.png');

const shoppingItems = [
  { id: 'item-1', product: MOCK_PRODUCTS[0], quantity: 2 },
  { id: 'item-2', product: MOCK_PRODUCTS[1], quantity: 1 },
  { id: 'item-3', product: MOCK_PRODUCTS[2], quantity: 6 },
  { id: 'item-4', product: MOCK_PRODUCTS[3], quantity: 3 },
];

export default function ShoppingListScreen() {
  const router = useRouter();
  const [items, setItems] = useState(shoppingItems);

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const nextQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: nextQuantity };
      }),
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 py-4 border-b border-border">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-muted"
          >
            <ChevronLeft size={22} className="text-foreground" />
          </Pressable>
          <Text className="text-foreground text-2xl font-bold">
            Shopping List
          </Text>
        </View>

        {/* Content */}
        <ScrollView className="flex-1" contentContainerClassName="px-4 py-6">
          {items.map((item) => {
            const imageSource =
              item.product?.primaryImage ?? fallbackProductImage;

            return (
              <View
                key={item.id}
                className="flex-row gap-3 bg-card border border-border rounded-xl p-3 mb-3"
              >
                <Image
                  source={imageSource}
                  className="h-16 w-16 rounded-lg"
                  resizeMode="cover"
                />

                <View className="flex-1">
                  <Text
                    className="text-foreground font-semibold text-base"
                    numberOfLines={1}
                  >
                    {item.product?.product_name}
                  </Text>
                  <Text
                    className="text-muted-foreground text-xs mt-1"
                    numberOfLines={2}
                  >
                    {item.product?.description}
                  </Text>

                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-muted-foreground text-xs">
                      Quantity
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Pressable
                        onPress={() => updateQuantity(item.id, -1)}
                        className="h-8 w-8 items-center justify-center rounded-full bg-muted"
                      >
                        <Text className="text-foreground text-base font-semibold">
                          -
                        </Text>
                      </Pressable>
                      <View className="bg-muted px-3 py-1 rounded-full">
                        <Text className="text-foreground text-xs font-semibold">
                          {item.quantity}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => updateQuantity(item.id, 1)}
                        className="h-8 w-8 items-center justify-center rounded-full bg-muted"
                      >
                        <Text className="text-foreground text-base font-semibold">
                          +
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View className="px-4 pb-6">
          <Pressable
            onPress={() => router.push('/optimization')}
            className="bg-primary rounded-full py-3 items-center"
          >
            <Text className="text-primary-foreground text-base font-semibold">
              Optimize
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
