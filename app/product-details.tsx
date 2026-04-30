import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@/components/ui/button';
import { watchlistService } from '@/shared/watchlist.service';
import { productDetailsService, type ProductImageItem, type ProductStoreOffer } from '@/shared/product-details.service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bell, BellRing, ChevronLeft, TriangleAlert } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const fallbackProductImage = require('../assets/images/icon.png');
const CART_KEY = 'cart_items_by_store';

function getPlaceholderByCategory(categoryName: string) {
  const normalized = categoryName.toLowerCase();
  if (normalized.includes('dairy')) return require('../assets/images/milk.jpg');
  if (normalized.includes('fruit')) return require('../assets/images/banana.jpg');
  if (normalized.includes('bakery') || normalized.includes('bread')) return require('../assets/images/bread.jpg');
  if (normalized.includes('vegetable')) return require('../assets/images/tomatoes.jpg');
  return fallbackProductImage;
}

function getStockLabel(availableStock: number, lowStockThreshold: number) {
  if (availableStock <= 0) return 'Out of Stock';
  if (availableStock <= lowStockThreshold) return 'Low Stock';
  return 'In Stock';
}

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id, product_id, select_cheapest } = useLocalSearchParams<{
    id?: string;
    product_id?: string;
    select_cheapest?: string;
  }>();
  const productId = Number(id ?? product_id ?? 0);
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<ProductImageItem[]>([]);
  const [offers, setOffers] = useState<ProductStoreOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [storePickerOpen, setStorePickerOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [watchModalOpen, setWatchModalOpen] = useState(false);
  const [watchTargetInput, setWatchTargetInput] = useState('');
  const [watchEntryId, setWatchEntryId] = useState<number | null>(null);

  const sortedOffers = useMemo(
    () =>
      [...offers]
        .filter((item) => item.is_active)
        .sort((a, b) => a.price + a.delivery_cost - (b.price + b.delivery_cost)),
    [offers]
  );

  const previewImages = useMemo(() => {
    if (images.length) return images;
    return [
      {
        id: -1,
        detail_url: '',
        thumbnail_url: '',
      },
    ];
  }, [images]);

  const cheapestOffer = sortedOffers[0];
  const suggestedTarget = useMemo(() => {
    const base = cheapestOffer?.price ?? 0;
    if (!base) return 0;
    return Number((base * 0.9).toFixed(2));
  }, [cheapestOffer?.price]);

  const loadDetails = async () => {
    if (!productId) {
      setErrorMessage('Invalid product id');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [productResponse, imageResponse, storeResponse] = await Promise.all([
        productDetailsService.getProduct(productId),
        productDetailsService.getProductImages(productId),
        productDetailsService.getStoreOffers(productId),
      ]);
      setProduct(productResponse);
      setImages(imageResponse);
      setOffers(storeResponse.filter((item) => item.is_active));
      const watches = await watchlistService.getWatchlist();
      const existing = watches.find((item) => item.product_id === productId);
      setWatchEntryId(existing?.id ?? null);
      setActiveImageIndex(0);
    } catch (error: any) {
      setErrorMessage(error?.message ?? 'Failed to load product details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetails().catch(() => undefined);
  }, [productId]);

  useEffect(() => {
    if (select_cheapest === '1' && cheapestOffer?.id) {
      setSelectedOfferId(cheapestOffer.id);
    }
  }, [cheapestOffer?.id, select_cheapest]);

  const breadcrumbCategory = product?.category_name ?? 'Category';
  const breadcrumbSubCategory = product?.sub_category_name ?? 'Sub-category';

  const activeImage = previewImages[activeImageIndex];
  const activeImageSource =
    activeImage?.detail_url
      ? { uri: activeImage.detail_url }
      : getPlaceholderByCategory(breadcrumbSubCategory || breadcrumbCategory);

  const onOpenWatchModal = () => {
    const initial = suggestedTarget || cheapestOffer?.price || 0;
    setWatchTargetInput(initial ? String(initial) : '');
    setWatchModalOpen(true);
  };

  const onConfirmWatch = async () => {
    const targetPrice = Number(watchTargetInput);
    if (!Number.isFinite(targetPrice) || targetPrice <= 0) {
      setStatusMessage('Enter a valid target price');
      return;
    }
    const entry = await watchlistService.create({
      product_id: productId,
      target_price: targetPrice,
    });
    setWatchEntryId(entry.id);
    setWatchModalOpen(false);
    setStatusMessage('Price watch enabled');
  };

  const onSelectStoreForCart = async (offer: ProductStoreOffer) => {
    const stored = await AsyncStorage.getItem(CART_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    const storeItems = Array.isArray(parsed[offer.shop_id]) ? parsed[offer.shop_id] : [];
    const existing = storeItems.find((item: any) => item.product_id === productId);
    const updated = existing
      ? storeItems.map((item: any) =>
          item.product_id === productId ? { ...item, quantity: Number(item.quantity ?? 1) + 1 } : item
        )
      : [
          ...storeItems,
          {
            product_id: productId,
            product_name: product?.product_name,
            quantity: 1,
            price: offer.price,
            delivery_cost: offer.delivery_cost,
          },
        ];
    const next = { ...parsed, [offer.shop_id]: updated };
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
    setStorePickerOpen(false);
    setStatusMessage(`Added to cart (${offer.store_name})`);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-6">
        <View className="flex-row items-center gap-3 py-4">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-muted"
          >
            <ChevronLeft size={22} className="text-foreground" />
          </Pressable>
          <View className="flex-1">
            <View className="flex-row items-center flex-wrap">
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/search',
                    params: { category_id: String(product?.category_id ?? '') },
                  })
                }
              >
                <Text className="text-primary font-semibold">{breadcrumbCategory}</Text>
              </Pressable>
              <Text className="text-muted-foreground mx-2">/</Text>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/search',
                    params: {
                      category_id: String(product?.category_id ?? ''),
                      sub_category_id: String(product?.sub_category_id ?? ''),
                    },
                  })
                }
              >
                <Text className="text-primary font-semibold">{breadcrumbSubCategory}</Text>
              </Pressable>
            </View>
            <Text className="text-foreground text-xl font-bold mt-1">{product?.product_name ?? 'Product'}</Text>
            <Text className="text-muted-foreground text-sm">
              {product?.brand ?? 'Unknown brand'} | {product?.unit ?? '1 unit'}
            </Text>
          </View>
          <Pressable
            onPress={onOpenWatchModal}
            className={`h-11 w-11 rounded-full border items-center justify-center ${
              watchEntryId ? 'bg-primary border-primary' : 'bg-card border-border'
            }`}
          >
            {watchEntryId ? (
              <BellRing size={20} className="text-primary-foreground" />
            ) : (
              <Bell size={20} className="text-foreground" />
            )}
          </Pressable>
        </View>

        {errorMessage ? (
          <View className="flex-1 items-center justify-center px-5 py-16">
            <TriangleAlert size={34} className="text-destructive mb-3" />
            <Text className="text-foreground font-semibold text-base mb-2">Failed to load product details</Text>
            <Text className="text-muted-foreground text-center mb-4">{errorMessage}</Text>
            <Button onPress={loadDetails}>
              <Text>Retry</Text>
            </Button>
          </View>
        ) : isLoading ? (
          <View className="bg-card border border-border rounded-2xl p-4 mb-6">
            <View className="w-full h-52 rounded-xl mb-4 bg-muted" />
            <View className="h-4 rounded bg-muted mb-2" />
            <View className="h-4 rounded bg-muted w-2/3" />
          </View>
        ) : (
          <View className="bg-card border border-border rounded-2xl p-4 mb-6">
            <Pressable onPress={() => setLightboxOpen(true)}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const width = event.nativeEvent.layoutMeasurement.width;
                  if (!width) return;
                  const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                  setActiveImageIndex(Math.max(0, Math.min(nextIndex, previewImages.length - 1)));
                }}
                className="mb-3"
              >
                {previewImages.map((image) => (
                  <Image
                    key={image.id}
                    source={
                      image.detail_url
                        ? { uri: image.detail_url }
                        : getPlaceholderByCategory(breadcrumbSubCategory || breadcrumbCategory)
                    }
                    className="w-[320px] h-52 rounded-xl mr-2"
                    resizeMode="contain"
                  />
                ))}
              </ScrollView>
            </Pressable>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {previewImages.map((image, index) => (
                  <Pressable
                    key={`thumb-${image.id}`}
                    className={`rounded-lg border ${activeImageIndex === index ? 'border-primary' : 'border-border'}`}
                    onPress={() => setActiveImageIndex(index)}
                  >
                    <Image
                      source={
                        image.thumbnail_url
                          ? { uri: image.thumbnail_url }
                          : getPlaceholderByCategory(breadcrumbSubCategory || breadcrumbCategory)
                      }
                      className="w-16 h-16 rounded-lg"
                      resizeMode="cover"
                    />
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text className="text-foreground text-base font-semibold mb-3">Price per store</Text>
            <View className="border border-border rounded-xl overflow-hidden mb-4">
              <View className="flex-row bg-muted px-3 py-2">
                <Text className="text-foreground font-semibold flex-1">Store</Text>
                <Text className="text-foreground font-semibold w-20 text-right">Price</Text>
                <Text className="text-foreground font-semibold w-24 text-right">Stock</Text>
                <Text className="text-foreground font-semibold w-20 text-right">Delivery</Text>
              </View>
              {sortedOffers.map((offer, index) => (
                <Pressable
                  key={offer.id}
                  onPress={() => setSelectedOfferId(offer.id)}
                  className={`flex-row items-center px-3 py-2 border-t border-border ${
                    selectedOfferId === offer.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-foreground text-sm font-medium">{offer.store_name}</Text>
                    {selectedOfferId === offer.id ? (
                      <View className="self-start mt-1 rounded-full bg-primary/20 px-2 py-0.5">
                        <Text className="text-primary text-[10px] font-semibold">Selected</Text>
                      </View>
                    ) : index === 0 ? (
                      <View className="self-start mt-1 rounded-full bg-emerald-500/20 px-2 py-0.5">
                        <Text className="text-emerald-600 text-[10px] font-semibold">Best value</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text className="text-foreground text-sm w-20 text-right">{offer.price.toFixed(2)}</Text>
                  <Text className="text-foreground text-xs w-24 text-right">
                    {getStockLabel(offer.available_stock, offer.low_stock_threshold)}
                  </Text>
                  <Text className="text-foreground text-sm w-20 text-right">{offer.delivery_cost.toFixed(2)}</Text>
                </Pressable>
              ))}
            </View>

            <View className="flex-row gap-2">
              <Button className="flex-1" variant="outline" onPress={onOpenWatchModal}>
                <Text>{watchEntryId ? 'Update Watch' : 'Watch Price'}</Text>
              </Button>
              <Button className="flex-1" onPress={() => setStorePickerOpen(true)}>
                <Text>Add to Cart</Text>
              </Button>
            </View>
            {statusMessage && <Text className="text-muted-foreground text-xs mt-3">{statusMessage}</Text>}
          </View>
        )}
      </ScrollView>

      <Modal visible={lightboxOpen} transparent animationType="fade" onRequestClose={() => setLightboxOpen(false)}>
        <Pressable className="flex-1 bg-black/90 items-center justify-center px-4" onPress={() => setLightboxOpen(false)}>
          <Image source={activeImageSource} className="w-full h-[70%]" resizeMode="contain" />
        </Pressable>
      </Modal>

      <Modal visible={storePickerOpen} transparent animationType="slide" onRequestClose={() => setStorePickerOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setStorePickerOpen(false)}>
          <Pressable className="mt-auto bg-background rounded-t-3xl p-4" onPress={() => undefined}>
            <View className="w-12 h-1.5 bg-border rounded-full self-center mb-4" />
            <Text className="text-foreground text-lg font-semibold mb-3">Choose store</Text>
            {sortedOffers.map((offer) => (
              <Pressable
                key={`picker-${offer.id}`}
                className="border border-border rounded-lg p-3 mb-2 bg-card"
                onPress={() => onSelectStoreForCart(offer)}
              >
                <Text className="text-foreground font-semibold">{offer.store_name}</Text>
                <Text className="text-muted-foreground text-xs mt-1">
                  {offer.price.toFixed(2)} + delivery {offer.delivery_cost.toFixed(2)}
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={watchModalOpen} transparent animationType="slide" onRequestClose={() => setWatchModalOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setWatchModalOpen(false)}>
          <Pressable className="mt-auto bg-background rounded-t-3xl p-4" onPress={() => undefined}>
            <View className="w-12 h-1.5 bg-border rounded-full self-center mb-4" />
            <Text className="text-foreground text-lg font-semibold mb-3">Watch this product</Text>
            <View className="bg-card border border-border rounded-xl p-3 mb-3">
              <Text className="text-muted-foreground text-xs">Current lowest price</Text>
              <Text className="text-foreground font-semibold text-base mt-1">
                {(cheapestOffer?.price ?? 0).toFixed(2)} EGP
              </Text>
              <Text className="text-muted-foreground text-xs mt-2">
                Suggested target (10% below): {suggestedTarget.toFixed(2)} EGP
              </Text>
            </View>
            <Text className="text-foreground font-semibold mb-2">Target price</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={watchTargetInput}
              onChangeText={setWatchTargetInput}
              placeholder="Enter target price"
              placeholderTextColor="rgb(115 115 115)"
              className="border border-border rounded-lg px-3 py-2 text-foreground mb-3"
            />
            <View className="flex-row gap-2">
              <Pressable
                className="flex-1 rounded-lg border border-border bg-card py-3 items-center"
                onPress={() => setWatchModalOpen(false)}
              >
                <Text className="text-foreground">Cancel</Text>
              </Pressable>
              <Pressable
                className="flex-1 rounded-lg border border-primary bg-primary py-3 items-center"
                onPress={onConfirmWatch}
              >
                <Text className="text-primary-foreground font-semibold">Confirm</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
