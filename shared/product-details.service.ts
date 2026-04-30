import { MOCK_PRODUCTS, MOCK_STORES } from '@/lib/mock-data';
import { httpService } from './httpService';

export interface ProductDetailsData {
  id: number;
  product_name: string;
  brand: string;
  unit: string;
  category_id: number;
  sub_category_id: number;
  category_name: string;
  sub_category_name: string;
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

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeProduct(raw: any): ProductDetailsData {
  const item = raw?.data ?? raw ?? {};
  return {
    id: toNumber(item.id),
    product_name: String(item.product_name ?? item.name ?? ''),
    brand: String(item.brand ?? 'Unknown brand'),
    unit: String(item.unit ?? item.measurement_unit ?? '1 unit'),
    category_id: toNumber(item.category_id),
    sub_category_id: toNumber(item.sub_category_id),
    category_name: String(item.category_name ?? item.category?.category_name ?? 'Category'),
    sub_category_name: String(
      item.sub_category_name ?? item.sub_category?.category_name ?? 'Sub-category'
    ),
  };
}

function normalizeImages(raw: any): ProductImageItem[] {
  const payload = raw?.data ?? raw ?? [];
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload.items) ? payload.items : [];
  return rows.map((item: any) => ({
    id: toNumber(item.id),
    detail_url: String(item.detail_url ?? item.variants?.detail ?? item.image_url ?? ''),
    thumbnail_url: String(item.thumbnail_url ?? item.variants?.thumbnail ?? item.image_url ?? ''),
  }));
}

function normalizeStoreOffers(raw: any): ProductStoreOffer[] {
  const payload = raw?.data ?? raw ?? [];
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.shop_products)
        ? payload.shop_products
        : [];

  return rows.map((item: any) => ({
    id: toNumber(item.id),
    shop_id: toNumber(item.shop_id),
    store_name: String(item.store_name ?? item.shop_name ?? item.shop?.shop_name ?? 'Store'),
    price: toNumber(item.price),
    delivery_cost: toNumber(item.delivery_cost),
    available_stock: toNumber(item.available_stock ?? item.stock),
    low_stock_threshold: toNumber(item.low_stock_threshold, 5),
    is_active: Boolean(item.is_active),
  }));
}

function mockProductById(productId: number): ProductDetailsData {
  const product = MOCK_PRODUCTS.find((item) => item.id === productId) ?? MOCK_PRODUCTS[0];
  return {
    id: product.id,
    product_name: product.product_name,
    brand: 'GrocerEase',
    unit: '1 pack',
    category_id: product.category_id,
    sub_category_id: product.category_id + 100,
    category_name: 'Groceries',
    sub_category_name: product.category?.category_name ?? 'General',
  };
}

function mockImagesById(productId: number): ProductImageItem[] {
  const product = MOCK_PRODUCTS.find((item) => item.id === productId);
  if (!product?.primaryImage || typeof product.primaryImage !== 'number') return [];
  return [
    {
      id: productId,
      detail_url: '',
      thumbnail_url: '',
    },
  ];
}

function mockStoreOffersById(productId: number): ProductStoreOffer[] {
  const candidates = MOCK_PRODUCTS.filter((item) => item.id === productId);
  if (!candidates.length) {
    return MOCK_STORES.slice(0, 3).map((store, index) => ({
      id: index + 1,
      shop_id: store.id,
      store_name: store.shop_name,
      price: 20 + index * 3,
      delivery_cost: 8 + index,
      available_stock: 5 + index * 4,
      low_stock_threshold: 4,
      is_active: true,
    }));
  }

  return candidates.map((item, index) => ({
    id: index + 1,
    shop_id: item.shop_id,
    store_name: item.shop_name,
    price: item.shop_price,
    delivery_cost: 8 + index,
    available_stock: item.stock,
    low_stock_threshold: 5,
    is_active: true,
  }));
}

export const productDetailsService = {
  async getProduct(productId: number): Promise<ProductDetailsData> {
    try {
      const response = await httpService.get(`/products/${productId}`);
      return normalizeProduct(response.data);
    } catch {
      return mockProductById(productId);
    }
  },

  async getProductImages(productId: number): Promise<ProductImageItem[]> {
    try {
      const response = await httpService.get(`/products/${productId}/images`);
      return normalizeImages(response.data);
    } catch {
      return mockImagesById(productId);
    }
  },

  async getStoreOffers(productId: number): Promise<ProductStoreOffer[]> {
    const endpoints = [`/products/${productId}/shop-products`, `/shop-products`];

    for (const endpoint of endpoints) {
      try {
        const response = await httpService.get(endpoint, {
          params: endpoint === '/shop-products' ? { product_id: productId, is_active: true } : undefined,
        });
        const offers = normalizeStoreOffers(response.data).filter(
          (item) => item.is_active && item.shop_id > 0
        );
        if (offers.length) return offers;
      } catch {
        // fallback to next endpoint
      }
    }

    return mockStoreOffersById(productId);
  },
};
