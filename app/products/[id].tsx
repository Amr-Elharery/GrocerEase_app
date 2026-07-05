import { Button } from '@/components/ui/button';
import { addToShoppingList } from '@/features/shopping-list/services/shopping-list.service';
import { productDetailsService, type ProductImageItem, type ProductStoreOffer } from '@/features/products/services/product-details.service';
import { recommendationsService } from '@/features/recommendations/services/recommendations.service';
import { RecommendationSection } from '@/features/recommendations/components/RecommendationSection';
import type { FBTRecommendation } from '@/features/recommendations/types';
import { useAuth } from '@/features/auth/hooks/auth-context';
import { useRTL } from '@/lib/i18n/RTLContext';
import { useToast } from '@/lib/toast/useToast';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TriangleAlert, LogIn } from 'lucide-react-native';
import { BackIcon } from '@/components/ui/back-icon';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const fallbackProductImage = require('../../assets/images/icon.png');

function getPlaceholderByCategory(categoryName: string) {
  const normalized = categoryName.toLowerCase();
  if (normalized.includes('dairy')) return require('../../assets/images/milk.jpg');
  if (normalized.includes('fruit')) return require('../../assets/images/banana.jpg');
  if (normalized.includes('bakery') || normalized.includes('bread')) return require('../../assets/images/bread.jpg');
  if (normalized.includes('vegetable')) return require('../../assets/images/tomatoes.jpg');
  return fallbackProductImage;
}

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id, product_id, select_cheapest } = useLocalSearchParams<{
    id?: string;
    product_id?: string;
    select_cheapest?: string;
  }>();
  const { isLoggedIn } = useAuth();
  const { isRTL } = useRTL();
  const { t } = useTranslation();
  const toast = useToast();

  const getStockLabel = (availableStock: number, lowStockThreshold: number) => {
    if (availableStock <= 0) return t('products.detail.outOfStock');
    if (availableStock <= lowStockThreshold) return t('products.detail.lowStock');
    return t('products.detail.inStock');
  };
  const productId = Number(id ?? product_id ?? 0);
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<ProductImageItem[]>([]);
  const [offers, setOffers] = useState<ProductStoreOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<FBTRecommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  const sortedOffers = useMemo(
    () =>
      [...offers]
        .sort((a, b) => (a.price + a.delivery_cost) - (b.price + b.delivery_cost)),
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

  const loadDetails = useCallback(async () => {
    if (!productId) {
      setErrorMessage(t('products.detail.invalidId'));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const productResponse = await productDetailsService.getProduct(productId);
      setProduct(productResponse);

      if (productResponse) {
        setImages(productDetailsService.getProductImages(productResponse));
        setOffers(productDetailsService.getStoreOffers(productResponse));
      }

      setActiveImageIndex(0);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('products.detail.loadFailed');
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [productId, t]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  useEffect(() => {
    if (!productId) return;
    let isActive = true;
    setRecommendationsLoading(true);
    recommendationsService
      .getGlobalFrequentlyBoughtTogether(productId)
      .then((data) => {
        if (isActive) setRecommendations(data);
      })
      .finally(() => {
        if (isActive) setRecommendationsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [productId]);

  const handleRecommendationPress = useCallback(
    (item: FBTRecommendation) => {
      router.push({
        pathname: '/products/[id]',
        params: { id: String(item.product_id) },
      });
    },
    [router],
  );

  useEffect(() => {
    if (select_cheapest === '1' && cheapestOffer?.id) {
      setSelectedOfferId(cheapestOffer.id);
    }
  }, [cheapestOffer?.id, select_cheapest]);

  const breadcrumbCategory = product?.category?.category_name ?? t('products.detail.category');
  const breadcrumbSubCategory = product?.sub_category?.category_name ?? t('products.detail.subCategory');

  const activeImage = previewImages[activeImageIndex];
  const activeImageSource =
    activeImage?.detail_url
      ? { uri: activeImage.detail_url }
      : getPlaceholderByCategory(breadcrumbSubCategory || breadcrumbCategory);

  const onAddToShoppingList = async () => {
    if (!isLoggedIn) {
      Alert.alert(t('products.detail.loginRequiredTitle'), t('products.detail.loginRequiredMessage'));
      router.push('/auth/login');
      return;
    }

    try {
      // Use the first (cheapest) offer by default
      await addToShoppingList({
        product_id: productId,
        product_name: product?.product_name ?? '',
        brand: product?.brand,
        image_url: images[0]?.thumbnail_url || undefined,
        qty: 1,
      });
      toast(t('shoppingList.addedToList', { name: product?.product_name ?? t('driver.job.item') }), 'success');
    } catch {
      toast(t('shoppingList.addToListFailed'), 'error');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {!isLoggedIn && (
        <View className="bg-primary/10 px-4 py-2 flex-row items-center justify-center gap-2">
          <LogIn size={16} className="text-primary" />
          <Pressable onPress={() => router.push('/auth/login')}>
            <Text className="text-primary font-semibold">{t('products.detail.loginToAdd')}</Text>
          </Pressable>
        </View>
      )}

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-6">
        <View className={isRTL ? "flex-row-reverse items-center gap-3 py-4" : "flex-row items-center gap-3 py-4"}>
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-muted"
          >
            <BackIcon variant="chevron" size={22} className="text-foreground" />
          </Pressable>
          <View className="flex-1">
            <View className="flex-row items-center flex-wrap">
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/search',
                    params: { category_id: String(product?.category?.id ?? '') },
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
                      category_id: String(product?.category?.id ?? ''),
                      sub_category_id: String(product?.sub_category?.id ?? ''),
                    },
                  })
                }
              >
                <Text className="text-primary font-semibold">{breadcrumbSubCategory}</Text>
              </Pressable>
            </View>
            <Text className="text-foreground text-xl font-bold mt-1">{product?.product_name ?? t('products.detail.product')}</Text>
            <Text className="text-muted-foreground text-sm">
              {product?.brand ?? t('products.detail.unknownBrand')} | {product?.unit ?? t('products.detail.oneUnit')}
            </Text>
          </View>
        </View>

        {errorMessage ? (
          <View className="flex-1 items-center justify-center px-5 py-16">
            <TriangleAlert size={34} className="text-destructive mb-3" />
            <Text className="text-foreground font-semibold text-base mb-2">{t('products.detail.loadFailed')}</Text>
            <Text className="text-muted-foreground text-center mb-4">{errorMessage}</Text>
            <Button onPress={loadDetails}>
              <Text>{t('common.retry')}</Text>
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

            <Text className="text-foreground text-base font-semibold mb-3">{t('products.detail.availableInStores')}</Text>
            <View className="border border-border rounded-xl overflow-hidden mb-4">
              <View className={isRTL ? "flex-row-reverse bg-muted px-3 py-2" : "flex-row bg-muted px-3 py-2"}>
                <Text className="text-foreground font-semibold flex-1">{t('products.detail.store')}</Text>
                <Text className="text-foreground font-semibold w-20 text-right">{t('products.detail.price')}</Text>
                <Text className="text-foreground font-semibold w-24 text-right">{t('products.detail.stock')}</Text>
              </View>
              {sortedOffers.map((offer, index) => (
                <Pressable
                  key={`${offer.shop_id ?? offer.id ?? "offer"}-${index}`}
                  onPress={() => setSelectedOfferId(offer.id)}
                  className={`${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center px-3 py-2 border-t border-border ${
                    selectedOfferId === offer.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-foreground text-sm font-medium">{offer.store_name}</Text>
                    {selectedOfferId === offer.id ? (
                      <View className="self-start mt-1 rounded-full bg-primary/20 px-2 py-0.5">
                        <Text className="text-primary text-[10px] font-semibold">{t('products.detail.selected')}</Text>
                      </View>
                    ) : index === 0 ? (
                      <View className="self-start mt-1 rounded-full bg-emerald-500/20 px-2 py-0.5">
                        <Text className="text-emerald-600 text-[10px] font-semibold">{t('products.detail.bestValue')}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text className="text-foreground text-sm w-20 text-right">{offer.price.toFixed(2)}</Text>
                  <Text className="text-foreground text-xs w-24 text-right">
                    {getStockLabel(offer.available_stock, offer.low_stock_threshold)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Button onPress={onAddToShoppingList}>
              <Text className="text-primary-foreground font-semibold">
                {isLoggedIn ? t('products.detail.addToShoppingList') : t('products.detail.loginToAddShort')}
              </Text>
            </Button>

            <View className="mt-6">
              <RecommendationSection
                title={t('products.detail.frequentlyBoughtTogether')}
                items={recommendations}
                isLoading={recommendationsLoading}
                onItemPress={(item) =>
                  handleRecommendationPress(item as FBTRecommendation)
                }
              />
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={lightboxOpen} transparent animationType="fade" onRequestClose={() => setLightboxOpen(false)}>
        <Pressable className="flex-1 bg-black/90 items-center justify-center px-4" onPress={() => setLightboxOpen(false)}>
          <Image source={activeImageSource} className="w-full h-[70%]" resizeMode="contain" />
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}