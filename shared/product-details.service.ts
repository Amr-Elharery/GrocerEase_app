import type { ProductDetail } from '@/lib/types';
import httpService from './httpService';

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

function normalizeProductImages(raw: any): ProductImageItem[] {
  const payload = raw?.data ?? raw ?? [];
  const rows = Array.isArray(payload) ? payload : payload.images ?? [];
  return rows.map((img: any) => ({
    id: toNumber(img?.id),
    detail_url: String(img?.detail_url ?? img?.image_url ?? ''),
    thumbnail_url: String(img?.thumbnail_url ?? img?.image_url ?? ''),
  }));
}

function normalizeProductShops(raw: any): ProductStoreOffer[] {
  const payload = raw?.shops ?? raw ?? [];
  const rows = Array.isArray(payload) ? payload : [];
  return rows.map((shop: any) => ({
    id: toNumber(shop?.id),
    shop_id: toNumber(shop?.shop_id ?? shop?.shop?.id),
    store_name: String(shop?.shop?.shop_name ?? shop?.shop_name ?? ''),
    price: toNumber(shop?.price),
    delivery_cost: toNumber(shop?.delivery_cost ?? shop?.deliveryPrice ?? 0),
    available_stock: toNumber(shop?.available_stock ?? shop?.stock ?? 0),
    low_stock_threshold: toNumber(shop?.low_stock_threshold ?? 5),
    is_active: Boolean(shop?.is_active),
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

  async getProductImages(productId: number): Promise<ProductImageItem[]> {
    try {
      const response = await httpService.get(`/products/${productId}/images`);
      return normalizeProductImages(response.data);
    } catch (error) {
      console.error('Failed to fetch product images:', error);
      return [];
    }
  },

  async getStoreOffers(productId: number): Promise<ProductStoreOffer[]> {
    try {
      const response = await httpService.get(`/products/${productId}/shops`);
      return normalizeProductShops(response.data);
    } catch (error) {
      console.error('Failed to fetch store offers:', error);
      return [];
    }
  },
};