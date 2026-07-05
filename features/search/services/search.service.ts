import type {
  ProductSearchFilters,
  ProductSearchResponse,
  ProductSearchSuggestionResponse,
  ProductSearchItem,
  SearchCategory,
  SearchFilterOptionsResponse,
  SearchStore,
} from '@/features/search/types';
import httpService from '@/shared/httpService';

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeStore(raw: any): SearchStore {
  return {
    id: toNumber(raw?.id),
    shop_name: String(raw?.shop_name ?? raw?.name ?? ''),
  };
}

// The real GET /categories/ returns a tree: {id, category_name,
// subcategories[]}. Flatten it into the parent_id-based shape the
// filter UI expects.
function flattenCategoryTree(rows: any[]): SearchCategory[] {
  const flat: SearchCategory[] = [];
  for (const row of rows) {
    flat.push({
      id: toNumber(row?.id),
      category_name: String(row?.category_name ?? ''),
      parent_id: null,
    });
    for (const sub of toArray<any>(row?.subcategories)) {
      flat.push({
        id: toNumber(sub?.id),
        category_name: String(sub?.category_name ?? ''),
        parent_id: toNumber(row?.id),
      });
    }
  }
  return flat;
}

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

// The real backend's GET /products/ returns a plain array (no pagination
// metadata, no price - price only exists per-shop), so "has more" is
// inferred from whether a full page was returned.
function normalizeProductListItem(raw: any): ProductSearchItem {
  const image =
    toArray<any>(raw?.product_images).find((img: any) => img?.is_primary) ||
    toArray<any>(raw?.product_images)[0];
  return {
    id: toNumber(raw?.id),
    product_name: String(raw?.product_name ?? ''),
    brand: raw?.brand ? String(raw.brand) : undefined,
    sub_category_name: String(
      raw?.sub_category?.category_name ?? raw?.category?.category_name ?? '',
    ),
    category_id: toNumber(raw?.category?.id),
    sub_category_id: toNumber(raw?.sub_category?.id),
    cheapest_price: 0,
    thumbnail: image?.image_url ? String(image.image_url) : null,
  };
}

function normalizeProductListResponse(
  raw: any,
  page: number,
  limit: number,
): ProductSearchResponse {
  const rows = toArray<any>(raw?.data ?? raw ?? []);
  const items = rows.map(normalizeProductListItem);

  return {
    items,
    page,
    limit,
    total: (page - 1) * limit + items.length,
    has_next_page: items.length === limit,
  };
}

// GET /products/ only understands limit, offset, search - category/price/
// store/in-stock filters have no backend support yet, so they're applied
// client-side over whatever page of results comes back.
function buildProductListParams(
  filters: ProductSearchFilters,
): Record<string, string> {
  const limit = filters.limit ?? 20;
  const page = filters.page ?? 1;
  const offset = (page - 1) * limit;

  const params: Record<string, string> = {
    limit: String(limit),
    offset: String(offset),
  };
  if (filters.q) params.search = filters.q;
  return params;
}

function applyClientFilters(
  items: ProductSearchItem[],
  filters: ProductSearchFilters,
): ProductSearchItem[] {
  return items.filter((item) => {
    if (filters.category_id && item.category_id !== filters.category_id) {
      return false;
    }
    if (
      filters.sub_category_id &&
      item.sub_category_id !== filters.sub_category_id
    ) {
      return false;
    }
    return true;
  });
}

export const searchService = {
  async getSuggestions(query: string): Promise<ProductSearchSuggestionResponse> {
    if (!query.trim()) return { products: [], sub_categories: [] };
    try {
      const response = await httpService.get('/products/', {
        params: { search: query, limit: 8, offset: 0 },
      });
      const rows = toArray<any>(response.data?.data ?? response.data ?? []);
      return {
        products: rows.map((row) => String(row?.product_name ?? '')),
        sub_categories: [],
      };
    } catch {
      return { products: [], sub_categories: [] };
    }
  },

  async searchProducts(filters: ProductSearchFilters): Promise<ProductSearchResponse> {
    const limit = filters.limit ?? 20;
    const page = filters.page ?? 1;
    const response = await httpService.get('/products/', {
      params: buildProductListParams(filters),
    });
    const result = normalizeProductListResponse(response.data, page, limit);
    return {
      ...result,
      items: applyClientFilters(result.items, filters),
    };
  },

  async findMatchingCategory(query: string): Promise<SearchCategory | null> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return null;
    try {
      const response = await httpService.get('/categories/');
      const rows = toArray<any>(response.data?.data ?? response.data ?? []);
      const flat = flattenCategoryTree(rows);
      return (
        flat.find((cat) => cat.category_name.toLowerCase().includes(normalized)) ??
        null
      );
    } catch {
      return null;
    }
  },

  async getFilterOptions(): Promise<SearchFilterOptionsResponse> {
    try {
      const [categoriesResponse, shopsResponse] = await Promise.all([
        httpService.get('/categories/'),
        httpService.get('/shops/'),
      ]);
      const categoryRows = toArray<any>(
        categoriesResponse.data?.data ?? categoriesResponse.data ?? [],
      );
      const shopRows = toArray<any>(
        shopsResponse.data?.data ?? shopsResponse.data ?? [],
      );
      return {
        categories: flattenCategoryTree(categoryRows),
        stores: shopRows.map(normalizeStore),
        min_price: 0,
        max_price: 0,
      };
    } catch {
      return { categories: [], stores: [], min_price: 0, max_price: 0 };
    }
  },
};
