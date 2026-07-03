import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CreateWatchlistPayload, WatchlistEntry } from '@/lib/types';
import { productDetailsService } from './product-details.service';
import httpService from './httpService';

const WATCHLIST_STORAGE_KEY = 'watchlist_entries_v1';

type StoredWatchlistEntry = {
  id: number;
  product_id: number;
  target_price: number;
  current_price?: number;
  created_at?: string;
};

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function extractProductImage(item: any): string | null {
  const raw =
    item.product?.primary_image?.thumbnail ??
    item.product?.primary_image?.detail ??
    item.product?.primary_image_url ??
    item.product?.image_url ??
    item.product_image?.thumbnail ??
    item.product_image?.detail ??
    item.product_image?.url ??
    item.product_image ??
    item.product?.images?.[0]?.thumbnail_url ??
    item.product?.images?.[0]?.detail_url ??
    item.product?.images?.[0]?.image_url ??
    null;

  return typeof raw === 'string' ? raw : null;
}

function normalizeEntry(raw: any): WatchlistEntry {
  const item = raw?.data ?? raw ?? {};
  return {
    id: toNumber(item.id),
    product_id: toNumber(item.product_id),
    target_price: toNumber(item.target_price),
    current_price: toNumber(item.current_price ?? item.lowest_price ?? item.price),
    previous_price: item.previous_price === undefined ? undefined : toNumber(item.previous_price),
    created_at: item.created_at ? String(item.created_at) : undefined,
    product_name: item.product?.product_name ?? item.product_name,
    product_image: extractProductImage(item),
  };
}

async function getStoredEntries(): Promise<StoredWatchlistEntry[]> {
  const raw = await AsyncStorage.getItem(WATCHLIST_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as StoredWatchlistEntry[]) : [];
}

async function setStoredEntries(items: StoredWatchlistEntry[]) {
  await AsyncStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
}

export const watchlistService = {
  async getWatchlist(): Promise<WatchlistEntry[]> {
    try {
      const response = await httpService.get('/watchlist');
      const payload = response.data?.data ?? response.data ?? [];
      const rows = Array.isArray(payload) ? payload : payload.items ?? [];
      const normalized = rows.map(normalizeEntry);

      // Use the same image source flow as product details screen.
      const withDetailsImages = await Promise.all(
        normalized.map(async (item) => {
          if (item.product_image) return item;
          try {
            const images = await productDetailsService.getProductImages(item.product_id);
            const firstImage = images[0];
            return {
              ...item,
              product_image: firstImage?.thumbnail_url ?? firstImage?.detail_url ?? null,
            };
          } catch {
            return item;
          }
        }),
      );

      return withDetailsImages;
    } catch {
      const stored = await getStoredEntries();
      const enriched = await Promise.all(
        stored.map(async (item) => {
          const [product, offers, images] = await Promise.all([
            productDetailsService.getProduct(item.product_id),
            productDetailsService.getStoreOffers(item.product_id),
            productDetailsService.getProductImages(item.product_id),
          ]);
          const cheapest = offers
            .filter((offer) => offer.is_active)
            .sort((a, b) => a.price - b.price)[0];
          const firstImage = images[0];
          return {
            id: item.id,
            product_id: item.product_id,
            target_price: item.target_price,
            previous_price: item.current_price,
            current_price: cheapest?.price ?? item.current_price ?? 0,
            created_at: item.created_at,
            product_name: product.product_name,
            product_image: firstImage?.thumbnail_url ?? firstImage?.detail_url ?? null,
          } as WatchlistEntry;
        }),
      );

      await setStoredEntries(
        enriched.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          target_price: item.target_price,
          current_price: item.current_price,
          created_at: item.created_at,
        })),
      );

      return enriched;
    }
  },

  async create(payload: CreateWatchlistPayload): Promise<WatchlistEntry> {
    try {
      const response = await httpService.post('/watchlist', payload);
      return normalizeEntry(response.data);
    } catch {
      const stored = await getStoredEntries();
      const existing = stored.find((item) => item.product_id === payload.product_id);
      const next: StoredWatchlistEntry = existing ?? {
        id: Date.now(),
        product_id: payload.product_id,
        target_price: payload.target_price,
        created_at: new Date().toISOString(),
      };
      next.target_price = payload.target_price;
      const merged = existing
        ? stored.map((item) => (item.product_id === payload.product_id ? next : item))
        : [next, ...stored];
      await setStoredEntries(merged);
      return {
        id: next.id,
        product_id: next.product_id,
        target_price: next.target_price,
        current_price: next.current_price ?? 0,
        created_at: next.created_at,
      };
    }
  },

  async remove(entryId: number): Promise<void> {
    try {
      await httpService.delete(`/watchlist/${entryId}`);
    } catch {
      const stored = await getStoredEntries();
      await setStoredEntries(stored.filter((item) => item.id !== entryId));
    }
  },
};
