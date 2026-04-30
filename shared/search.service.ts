import type {
  ProductSearchFilters,
  ProductSearchResponse,
  ProductSearchSuggestionResponse,
  ProductSearchItem,
  SearchCategory,
  SearchFilterOptionsResponse,
  SearchStore,
} from '@/lib/types';
import { MOCK_PRODUCTS, MOCK_STORES } from '@/lib/mock-data';
import { httpService } from './httpService';

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCategory(raw: any): SearchCategory {
  return {
    id: toNumber(raw?.id),
    category_name: String(raw?.category_name ?? raw?.name ?? ''),
    parent_id:
      raw?.parent_id === null || raw?.parent_id === undefined
        ? null
        : toNumber(raw.parent_id),
  };
}

function normalizeStore(raw: any): SearchStore {
  return {
    id: toNumber(raw?.id),
    shop_name: String(raw?.shop_name ?? raw?.name ?? ''),
  };
}

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeSearchResponse(raw: any): ProductSearchResponse {
  const payload = raw?.data ?? raw ?? {};
  const itemsRaw = toArray<any>(payload.items ?? payload.results ?? payload.products);
  const items = itemsRaw.map((item) => ({
    id: toNumber(item?.id),
    product_name: String(item?.product_name ?? ''),
    sub_category_name: String(item?.sub_category_name ?? ''),
    category_id: toNumber(item?.category_id),
    sub_category_id: toNumber(item?.sub_category_id),
    cheapest_price: toNumber(item?.cheapest_price ?? item?.price),
    thumbnail: item?.thumbnail ?? item?.product_image ?? null,
  }));

  const page = toNumber(payload.page, 1);
  const limit = toNumber(payload.limit, 20);
  const total = toNumber(payload.total, items.length);

  return {
    items,
    page,
    limit,
    total,
    has_next_page:
      typeof payload.has_next_page === 'boolean'
        ? payload.has_next_page
        : page * limit < total,
  };
}

function normalizeSuggestions(raw: any): ProductSearchSuggestionResponse {
  const payload = raw?.data ?? raw ?? {};
  const products = toArray<string>(
    payload.products ??
      payload.product_names ??
      payload.suggestions?.products ??
      []
  ).map((item) => String(item));

  const rawCategories =
    payload.sub_categories ?? payload.categories ?? payload.suggestions?.categories ?? [];

  const sub_categories = toArray<any>(rawCategories)
    .map(normalizeCategory)
    .filter((item) => item.parent_id !== null);

  return { products, sub_categories };
}

function normalizeFilterOptions(raw: any): SearchFilterOptionsResponse {
  const payload = raw?.data ?? raw ?? {};
  return {
    categories: toArray<any>(payload.categories).map(normalizeCategory),
    stores: toArray<any>(payload.stores ?? payload.shops).map(normalizeStore),
    min_price: toNumber(payload.min_price, 0),
    max_price: toNumber(payload.max_price, 0),
  };
}

function buildSearchParams(filters: ProductSearchFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.q) params.q = filters.q;
  if (filters.category_id) params.category_id = String(filters.category_id);
  if (filters.sub_category_id) params.sub_category_id = String(filters.sub_category_id);
  if (typeof filters.min_price === 'number') params.min_price = String(filters.min_price);
  if (typeof filters.max_price === 'number') params.max_price = String(filters.max_price);
  if (typeof filters.in_stock === 'boolean') params.in_stock = String(filters.in_stock);
  if (typeof filters.page === 'number') params.page = String(filters.page);
  if (typeof filters.limit === 'number') params.limit = String(filters.limit);
  if (filters.store_ids?.length) params.store_ids = filters.store_ids.join(',');
  return params;
}

const MOCK_CATEGORIES: SearchCategory[] = [
  { id: 1, category_name: 'Fresh Food', parent_id: null },
  { id: 2, category_name: 'Bakery', parent_id: null },
  { id: 11, category_name: 'Vegetables', parent_id: 1 },
  { id: 12, category_name: 'Fruits', parent_id: 1 },
  { id: 13, category_name: 'Dairy', parent_id: 1 },
  { id: 21, category_name: 'Bread', parent_id: 2 },
];

const CATEGORY_TO_SUBCATEGORY_ID: Record<number, number> = {
  1: 11,
  2: 13,
  3: 12,
  4: 21,
};

const CATEGORY_TO_PARENT_ID: Record<number, number> = {
  1: 1,
  2: 1,
  3: 1,
  4: 2,
};

function getSubCategoryName(subCategoryId: number): string {
  return (
    MOCK_CATEGORIES.find((item) => item.id === subCategoryId)?.category_name ??
    'Uncategorized'
  );
}

function buildMockSearchItems(): ProductSearchItem[] {
  const grouped = new Map<number, ProductSearchItem>();

  for (const product of MOCK_PRODUCTS) {
    const subCategoryId = CATEGORY_TO_SUBCATEGORY_ID[product.category_id] ?? 11;
    const parentCategoryId = CATEGORY_TO_PARENT_ID[product.category_id] ?? 1;
    const existing = grouped.get(product.id);
    const cheapest = existing
      ? Math.min(existing.cheapest_price, product.shop_price)
      : product.shop_price;

    grouped.set(product.id, {
      id: product.id,
      product_name: product.product_name,
      sub_category_name: getSubCategoryName(subCategoryId),
      category_id: parentCategoryId,
      sub_category_id: subCategoryId,
      cheapest_price: cheapest,
      thumbnail: null,
    });
  }

  return Array.from(grouped.values());
}

function filterMockItems(filters: ProductSearchFilters): ProductSearchItem[] {
  const q = filters.q?.trim().toLowerCase() ?? '';
  const allowedProductIdsByStore =
    filters.store_ids?.length
      ? new Set(
          MOCK_PRODUCTS.filter((item) => filters.store_ids?.includes(item.shop_id)).map(
            (item) => item.id
          )
        )
      : null;

  const inStockProductIds = filters.in_stock
    ? new Set(MOCK_PRODUCTS.filter((item) => item.stock > 0).map((item) => item.id))
    : null;

  return buildMockSearchItems().filter((item) => {
    if (q) {
      const matched =
        item.product_name.toLowerCase().includes(q) ||
        item.sub_category_name.toLowerCase().includes(q);
      if (!matched) return false;
    }

    if (filters.category_id && item.category_id !== filters.category_id) return false;
    if (filters.sub_category_id && item.sub_category_id !== filters.sub_category_id) {
      return false;
    }
    if (typeof filters.min_price === 'number' && item.cheapest_price < filters.min_price) {
      return false;
    }
    if (typeof filters.max_price === 'number' && item.cheapest_price > filters.max_price) {
      return false;
    }
    if (allowedProductIdsByStore && !allowedProductIdsByStore.has(item.id)) return false;
    if (inStockProductIds && !inStockProductIds.has(item.id)) return false;

    return true;
  });
}

function getMockSuggestions(query: string): ProductSearchSuggestionResponse {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return { products: [], sub_categories: [] };
  }

  const products = Array.from(
    new Set(
      buildMockSearchItems()
        .map((item) => item.product_name)
        .filter((name) => name.toLowerCase().includes(normalizedQuery))
    )
  ).slice(0, 8);

  const sub_categories = MOCK_CATEGORIES.filter(
    (item) =>
      item.parent_id !== null &&
      item.category_name.toLowerCase().includes(normalizedQuery)
  ).slice(0, 8);

  return { products, sub_categories };
}

function getMockSearchResults(filters: ProductSearchFilters): ProductSearchResponse {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 20);
  const filtered = filterMockItems(filters);
  const start = (page - 1) * limit;
  const end = start + limit;
  const items = filtered.slice(start, end);

  return {
    items,
    page,
    limit,
    total: filtered.length,
    has_next_page: end < filtered.length,
  };
}

function getMockFilterOptions(): SearchFilterOptionsResponse {
  const prices = buildMockSearchItems().map((item) => item.cheapest_price);
  const min_price = prices.length ? Math.min(...prices) : 0;
  const max_price = prices.length ? Math.max(...prices) : 0;

  return {
    categories: MOCK_CATEGORIES,
    stores: MOCK_STORES.map((store) => ({
      id: store.id,
      shop_name: store.shop_name,
    })),
    min_price,
    max_price,
  };
}

export const searchService = {
  async getSuggestions(query: string): Promise<ProductSearchSuggestionResponse> {
    const response = await httpService.get('/products/search/suggestions', {
      params: { q: query },
    });
    return normalizeSuggestions(response.data);
  },

  async searchProducts(filters: ProductSearchFilters): Promise<ProductSearchResponse> {
    const response = await httpService.get('/products/search', {
      params: buildSearchParams(filters),
    });
    return normalizeSearchResponse(response.data);
  },

  async getFilterOptions(): Promise<SearchFilterOptionsResponse> {
    const candidateEndpoints = [
      '/products/search/filter-options',
      '/products/search/filters',
      '/categories/tree',
    ];

    for (const endpoint of candidateEndpoints) {
      try {
        const response = await httpService.get(endpoint);
        const normalized = normalizeFilterOptions(response.data);
        if (normalized.categories.length || normalized.stores.length) {
          return normalized;
        }
      } catch {
        // Keep trying fallback endpoints.
      }
    }

    return getMockFilterOptions();
  },
};
