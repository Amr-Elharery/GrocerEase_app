import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  CircleDollarSign,
  ShoppingBag,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const optimizationOptions = [
  {
    id: 'cheapest',
    title: 'Cheapest Total',
    accent: 'Save 32 EGP',
    detail: 'Split between: Kazyon, Spinneys, Al Othaim',
    eta: 'Estimated Delivery: 1 hours',
    icon: CircleDollarSign,
  },
  {
    id: 'minimum-stores',
    title: 'Minimum Stores',
    accent: 'All from Spinneys',
    detail: 'Save time with a single delivery',
    eta: 'Estimated Delivery: 30 mins',
    icon: ShoppingBag,
  },
];

const storeGroups = [
  {
    id: 'group-1',
    title: 'Store Group 1: Kazyon (3 items)',
    items: ['2 x Milk 1L: 70 EGP (Save 10 EGP)', 'Eggs: 150 EGP (Save 10 EGP)'],
    savings: '-20 EGP',
  },
  {
    id: 'group-2',
    title: 'Store Group 2: Spinneys (5 items)',
    items: [
      '4 x Juhayna Plain Yogurt: 35 EGP (Save 5 EGP)',
      'Raw Sea Salt Potatoes: 15 EGP (Save 2 EGP)',
    ],
    savings: '-7 EGP',
  },
  {
    id: 'group-3',
    title: 'Store Group 3: Al Othaim (2 items)',
    items: ['2 x Corona Dark Chocolate: 25 EGP (Save 5 EGP)'],
    savings: '-5 EGP',
  },
];

export default function OptimizationScreen() {
  const router = useRouter();

  const [selectedOptionId, setSelectedOptionId] = useState('cheapest');

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-6">
          <View className="flex-row items-center gap-3 py-4">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-muted"
            >
              <ChevronLeft size={22} className="text-foreground" />
            </Pressable>
            <View>
              <Text className="text-foreground text-2xl font-bold">
                Optimization Results
              </Text>
              <Text className="text-muted-foreground text-sm mt-1">
                We found 2 ways to fulfill your 10-item list
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3 mb-5">
            {optimizationOptions.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const Icon = option.icon;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    setSelectedOptionId('minimum-stores');
                  }}
                  className={`flex-1 rounded-2xl border p-4 bg-card ${
                    isSelected ? 'border-primary shadow' : 'border-border'
                  }`}
                >
                  <View className="h-12 w-12 rounded-full items-center justify-center bg-muted mb-3">
                    <Icon
                      size={24}
                      className={
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      }
                    />
                  </View>
                  <Text className="text-foreground text-sm font-semibold">
                    {option.title}
                  </Text>
                  <Text
                    className={`text-xs font-semibold mt-1 ${
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {option.accent}
                  </Text>
                  <Text className="text-muted-foreground text-xs mt-2">
                    {option.detail}
                  </Text>
                  <Text className="text-muted-foreground text-xs mt-4">
                    {option.eta}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="gap-3">
            {storeGroups.map((group) => (
              <View
                key={group.id}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground text-sm font-semibold">
                    {group.title}
                  </Text>
                  <Text className="text-primary text-sm font-semibold">
                    {group.savings}
                  </Text>
                </View>
                <View className="mt-2 gap-1">
                  {group.items.map((item) => (
                    <Text key={item} className="text-muted-foreground text-xs">
                      {item}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View className="px-4 pb-6">
          <Pressable className="bg-primary rounded-full py-3 items-center">
            <Text className="text-primary-foreground text-base font-semibold">
              Move to Cart
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
