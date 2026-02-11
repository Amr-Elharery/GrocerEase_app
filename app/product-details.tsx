import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const fallbackProductImage = require('../assets/images/icon.png');

const storePrices = [
  { id: 'store-1', name: 'Kazyon', price: '70 EGP' },
  { id: 'store-2', name: 'Spinneys', price: '75 EGP' },
  { id: 'store-3', name: 'Al Othaim', price: '72 EGP' },
];

export default function ProductDetailsScreen() {
  const router = useRouter();
  const product = MOCK_PRODUCTS[0];
  const imageSource = product?.primaryImage ?? fallbackProductImage;

  const handleAddToCart = () => {
    console.log('Added to cart:', product?.id);
  };

  const handleQuickAdd = (id: number) => {
    console.log('Quick add:', id);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-6">
        {/* HEADER */}
        <View className="flex-row items-center gap-3 py-4">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-muted"
          >
            <ChevronLeft size={22} className="text-foreground" />
          </Pressable>
          <Text className="text-foreground text-2xl font-bold">
            Product Details
          </Text>
        </View>

        {/* PRODUCT CARD */}
        <View className="bg-card border border-border rounded-2xl p-4 mb-6">
          <Image
            source={imageSource}
            className="w-full h-48 rounded-xl mb-4"
            resizeMode="cover"
          />

          <Text className="text-foreground text-xl font-semibold mb-2">
            {product?.product_name}
          </Text>

          <Text className="text-muted-foreground text-sm mb-4">
            {product?.description}
          </Text>

          {/* ADD TO CART BUTTON */}
          <Pressable
            onPress={handleAddToCart}
            className="flex-row items-center justify-center gap-2 bg-primary py-3 rounded-xl mb-4"
          >
            <Plus size={18} className="text-primary-foreground" />
            <Text className="text-primary-foreground font-semibold">
              Add to Shopping Liist
            </Text>
          </Pressable>

          {/* STORE PRICES */}
          <Text className="text-foreground text-base font-semibold mb-3">
            Available at
          </Text>

          <View className="gap-2">
            {storePrices.map((store) => (
              <View
                key={store.id}
                className="flex-row items-center justify-between bg-muted rounded-lg px-3 py-2"
              >
                <Text className="text-foreground text-sm font-medium">
                  {store.name}
                </Text>
                <Text className="text-foreground text-sm font-semibold">
                  {store.price}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* SIMILAR PRODUCTS */}
        <Text className="text-foreground text-lg font-semibold mb-3">
          Similar Products
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {MOCK_PRODUCTS.slice(1, 6).map((item) => (
              <View
                key={item.id}
                className="w-40 bg-card border border-border rounded-xl p-3"
              >
                <Image
                  source={item.primaryImage ?? fallbackProductImage}
                  className="w-full h-24 rounded-lg mb-3"
                  resizeMode="cover"
                />

                <Text
                  className="text-foreground text-sm font-semibold"
                  numberOfLines={2}
                >
                  {item.product_name}
                </Text>

                <Text className="text-muted-foreground text-xs mt-1">
                  {item.shop_price.toFixed(2)} EGP
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
