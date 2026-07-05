import type { ProductDetail } from '@/features/products/types';
import httpService from '@/shared/httpService';

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export interface ProductImageItem {
  id: number;
  detail_url: string;
  thumbnail_url: string;
}

export interface ProductStoreOffer {
  id: number;
  shop_id: number;
  store_name: string;
  price: number;
  delivery_cost: number;
  available_stock: number;
  low_stock_threshold: number;
  is_active: boolean;
}

function normalizeProductDetail(raw: any): ProductDetail {
  return {
    id: toNumber(raw?.id),
    product_name: String(raw?.product_name ?? ''),
    description: String(raw?.description ?? ''),
    brand: String(raw?.brand ?? ''),
    unit: String(raw?.unit ?? ''),
    category: raw?.category
      ? {
          id: toNumber(raw.category?.id),
          category_name: String(raw.category?.category_name ?? ''),
        }
      : { id: 0, category_name: '' },
    sub_category: raw?.sub_category
      ? {
          id: toNumber(raw.sub_category?.id),
          category_name: String(raw.sub_category?.category_name ?? ''),
        }
      : null,
    product_images: Array.isArray(raw?.product_images)
      ? raw.product_images.map((img: any) => ({
          id: toNumber(img?.id),
          product_id: toNumber(img?.product_id),
          image_url: img?.image_url ?? null,
          is_primary: Boolean(img?.is_primary),
          created_at: String(img?.created_at ?? ''),
          updated_at: String(img?.updated_at ?? ''),
        }))
      : [],
    shops: Array.isArray(raw?.shops)
      ? raw.shops.map((shop: any) => ({
          id: toNumber(shop?.id),
          shop_id: toNumber(shop?.shop_id),
          available_stock: toNumber(shop?.available_stock),
          price: toNumber(shop?.price),
          is_active: Boolean(shop?.is_active),
          is_available: Boolean(shop?.is_available),
          shop: {
            id: toNumber(shop?.shop?.id),
            shop_name: String(shop?.shop?.shop_name ?? ''),
            logo_url: shop?.shop?.logo_url ?? null,
          },
        }))
      : [],
  };
}

// GET /products/{id} embeds both product_images[] and shops[] directly -
// there is no separate /images or /shops sub-endpoint on the real backend.
function productImagesFromDetail(product: ProductDetail): ProductImageItem[] {
  return product.product_images.map((img) => ({
    id: img.id,
    detail_url: String(img.image_url ?? ''),
    thumbnail_url: String(img.image_url ?? ''),
  }));
}

function storeOffersFromDetail(product: ProductDetail): ProductStoreOffer[] {
  return product.shops.map((shop) => ({
    id: shop.id,
    shop_id: shop.shop_id,
    store_name: shop.shop?.shop_name ?? '',
    price: shop.price,
    delivery_cost: 0,
    available_stock: shop.available_stock,
    low_stock_threshold: 5,
    is_active: shop.is_active,
  }));
}

export const productDetailsService = {
  async getProduct(productId: number): Promise<ProductDetail | null> {
    try {
      const response = await httpService.get(`/products/${productId}`);
      const payload = response.data?.data ?? response.data ?? {};
      return normalizeProductDetail(payload);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return null;
    }
  },

  getProductImages(product: ProductDetail): ProductImageItem[] {
    return productImagesFromDetail(product);
  },

  getStoreOffers(product: ProductDetail): ProductStoreOffer[] {
    return storeOffersFromDetail(product);
  },
};
