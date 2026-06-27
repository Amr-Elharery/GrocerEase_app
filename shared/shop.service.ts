import { MOCK_STORES, MOCK_PRODUCTS } from '@/lib/mock-data';
import type { ShopDisplay, ProductDisplay, Category } from '@/lib/types';
import { httpService } from './httpService';

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeShop(raw: any): ShopDisplay {
  return {
    id: toNumber(raw?.id),
    user_id: toNumber(raw?.user_id),
    shop_name: String(raw?.shop_name ?? ''),
    created_at: String(raw?.created_at ?? new Date().toISOString()),
    updated_at: String(raw?.updated_at ?? new Date().toISOString()),
    images: Array.isArray(raw?.images)
      ? raw.images.map((img: any) => ({
          id: toNumber(img?.id),
          shop_id: toNumber(img?.shop_id),
          image_url: img?.image_url,
          created_at: String(img?.created_at ?? ''),
          updated_at: String(img?.updated_at ?? ''),
        }))
      : [],
    location: raw?.location
      ? {
          id: toNumber(raw.location?.id),
          shop_id: toNumber(raw.location?.shop_id),
          area_id: toNumber(raw.location?.area_id),
          city: String(raw.location?.city ?? ''),
          building_name: String(raw.location?.building_name ?? ''),
          street_name: String(raw.location?.street_name ?? ''),
          street_number: toNumber(raw.location?.street_number),
          longitude: toNumber(raw.location?.longitude),
          latitude: toNumber(raw.location?.latitude),
          created_at: String(raw.location?.created_at ?? ''),
          updated_at: String(raw.location?.updated_at ?? ''),
        }
      : undefined,
    averageRating: toNumber(raw?.average_rating ?? raw?.averageRating),
    reviewCount: toNumber(raw?.review_count ?? raw?.reviewCount),
    deliveryTime: raw?.delivery_time ? String(raw.delivery_time) : undefined,
  };
}

function normalizeProduct(raw: any): ProductDisplay {
  // Handle both nested product structure and flat structure
  const productData = raw?.product ?? raw;
  
  return {
    id: toNumber(raw?.id ?? productData?.id),
    category_id: toNumber(productData?.category_id),
    product_name: String(productData?.product_name ?? ''),
    description: String(productData?.description ?? ''),
    price: toNumber(raw?.price ?? productData?.price),
    created_at: String(productData?.created_at ?? ''),
    updated_at: String(productData?.updated_at ?? ''),
    shop_id: toNumber(raw?.shop_id ?? 0),
    shop_name: String(raw?.shop?.shop_name ?? ''),
    shop_price: toNumber(raw?.price ?? productData?.price),
    stock: toNumber(raw?.available_stock ?? raw?.stock),
    images: Array.isArray(raw?.product?.product_images)
      ? raw.product.product_images.map((img: any) => ({
          id: toNumber(img?.id),
          product_id: toNumber(img?.product_id),
          image_url: img?.image_url,
          is_primary: Boolean(img?.is_primary),
          created_at: String(img?.created_at ?? ''),
          updated_at: String(img?.updated_at ?? ''),
        }))
      : [],
    primaryImage: productData?.product_images?.find((img: any) => img?.is_primary)?.image_url ?? undefined,
    category: raw?.product?.category
      ? {
          id: toNumber(raw.product.category?.id),
          category_name: String(raw.product.category?.category_name ?? ''),
        }
      : undefined,
  };
}

function groupProductsByCategory(products: ProductDisplay[]): { category_name: string; products: ProductDisplay[] }[] {
  const groups: { category_name: string; products: ProductDisplay[] }[] = [];
  const seen = new Set<string>();

  for (const product of products) {
    const catName = product.category?.category_name || 'Uncategorized';
    if (!seen.has(catName)) {
      seen.add(catName);
      groups.push({ category_name: catName, products: [] });
    }
    const group = groups.find((g) => g.category_name === catName);
    if (group) {
      group.products.push(product);
    }
  }

  return groups;
}

export const shopService = {
  async getShops(areaId?: number): Promise<ShopDisplay[]> {
    try {
      const response = await httpService.get('/shops', {
        params: { area_id: areaId },
      });
      console.log(response)
      const payload = response.data ?? [];
      const shops = Array.isArray(payload) ? payload.map(normalizeShop) : [];
      return shops.length ? shops : MOCK_STORES;
    } catch {
      return MOCK_STORES;
    }
  },

async getShopProducts(shopId: number): Promise<{
   products: ProductDisplay[];
   categories: { category_name: string; products: ProductDisplay[] }[];
 }> {
   try {
     const response = await httpService.get(`/shop-products`, {
       params: { shop_id: shopId },
     });

     const payload = response.data?.data ?? response.data ?? {};

     const products = Array.isArray(payload)
       ? payload.map(normalizeProduct)
       : [];

     return {
       products,
       categories: products.length
         ? groupProductsByCategory(products)
         : [],
     };

   } catch (error) {
     console.log(error);

     const products = MOCK_PRODUCTS.filter(
       (p) => p.shop_id === shopId
     );

     return {
       products,
       categories: products.length
         ? groupProductsByCategory(products)
         : [],
     };
   }
 }
};