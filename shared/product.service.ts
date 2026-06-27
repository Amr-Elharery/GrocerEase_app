import { MOCK_PRODUCTS } from '@/lib/mock-data';
import type { ProductSearchFilters, ProductSearchItem, SearchCategory } from '@/lib/types';
import { httpService } from './httpService';

const DEFAULT_LIMIT = 20;
 

 
 

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function flattenSubcategories(categories: SearchCategory[]): SearchCategory[] {
  return categories.flatMap((category) => category.subcategories ?? []);
}

 
 

function sortItems(
  items: ProductSearchItem[],
  sort: ProductSearchFilters['sort']
): ProductSearchItem[] {
  const sorted = [...items];
  if (sort === 'price_asc') {
    sorted.sort((a, b) => a.cheapest_price - b.cheapest_price);
  } else if (sort === 'price_desc') {
    sorted.sort((a, b) => b.cheapest_price - a.cheapest_price);
  } else if (sort === 'rating_desc') {
    sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }
  return sorted;
}
 

function normalizeCategories(raw: any): SearchCategory[] {
  const payload = raw?.data ?? raw ?? [];
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.categories)
      ? payload.categories
      : [];

  const normalized: SearchCategory[] = rows.map((item: any) => ({
    id: toNumber(item?.id),
    category_name: String(item?.category_name ?? item?.name ?? ''),
    parent_id:
      item?.parent_id === null || item?.parent_id === undefined
        ? null
        : toNumber(item.parent_id),
    subcategories: Array.isArray(item?.subcategories)
      ? item.subcategories.map((sub: any) => ({
          id: toNumber(sub?.id),
          category_name: String(sub?.category_name ?? sub?.name ?? ''),
          parent_id: toNumber(sub?.parent_id ?? item?.id),
        }))
      : undefined,
  }));

  const topLevel = normalized.filter((item) => item.parent_id === null);
  if (topLevel.length && topLevel.every((item) => item.subcategories)) {
    return topLevel;
  }

  return topLevel.map((parent) => ({
    ...parent,
    subcategories: normalized.filter((item) => item.parent_id === parent.id),
  }));
}

function normalizeProducts(raw: any): ProductSearchItem[] {
  const payload = raw?.data ?? raw ?? {};
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.products)
        ? payload.products
        : [];

  return rows.map((item: any) => ({
    id: toNumber(item?.id),
    product_name: String(item?.product_name ?? ''),
    brand: String(item?.brand ?? ''),
    sub_category_name: String(item?.sub_category_name ?? item?.subcategory_name ?? ''),
    category_id: toNumber(item?.category_id),
    sub_category_id: toNumber(item?.sub_category_id),
    cheapest_price: toNumber(item?.cheapest_price ?? item?.price),
    rating: toNumber(item?.rating),
    thumbnail:
      item?.primary_image?.card ??
      item?.product_image?.card ??
      item?.thumbnail ??
      item?.image_url ??
      null,
  }));
}

export const productService = {
  async getCategories(): Promise<SearchCategory[]> {
    try {
      const response = await httpService.get('/categories');
      const categories = normalizeCategories(response.data);
      return  categories  ;
    }
    finally{

    }
  },

  async getProducts(
    filters: ProductSearchFilters
  ): Promise<{ items: ProductSearchItem[]; hasNextPage: boolean }> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.max(1, filters.limit ?? DEFAULT_LIMIT);

    try {
      const response = await httpService.get('/products', {
        
      });

      const payload = response.data?.data ?? response.data ?? {};
      const items = normalizeProducts(payload);
      const total = toNumber(payload?.total, items.length);
      const hasNextPage = items.length === limit && page * limit < total;
      return { items, hasNextPage };
    } catch {
       
    }
  },
};
