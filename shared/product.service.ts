import { MOCK_PRODUCTS } from '@/lib/mock-data';
import type { ProductSearchFilters, ProductSearchItem, SearchCategory } from '@/lib/types';
import { httpService } from './httpService';

const DEFAULT_LIMIT = 20;

const MOCK_CATEGORY_TREE: SearchCategory[] = [
  {
    id: 1,
    category_name: 'Fresh Food',
    parent_id: null,
    subcategories: [
      { id: 11, category_name: 'Vegetables', parent_id: 1 },
      { id: 12, category_name: 'Fruits', parent_id: 1 },
      { id: 13, category_name: 'Dairy', parent_id: 1 },
    ],
  },
  {
    id: 2,
    category_name: 'Bakery',
    parent_id: null,
    subcategories: [{ id: 21, category_name: 'Bread', parent_id: 2 }],
  },
];

const LEGACY_TO_SUBCATEGORY_ID: Record<number, number> = {
  1: 11,
  2: 13,
  3: 12,
  4: 21,
};

const LEGACY_TO_PARENT_CATEGORY_ID: Record<number, number> = {
  1: 1,
  2: 1,
  3: 1,
  4: 2,
};

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function flattenSubcategories(categories: SearchCategory[]): SearchCategory[] {
  return categories.flatMap((category) => category.subcategories ?? []);
}

function getSubcategoryName(subCategoryId: number): string {
  return (
    flattenSubcategories(MOCK_CATEGORY_TREE).find((item) => item.id === subCategoryId)
      ?.category_name ?? 'Uncategorized'
  );
}

function buildMockProducts(): ProductSearchItem[] {
  const byId = new Map<number, ProductSearchItem>();

  for (const product of MOCK_PRODUCTS) {
    const subCategoryId = LEGACY_TO_SUBCATEGORY_ID[product.category_id] ?? 11;
    const categoryId = LEGACY_TO_PARENT_CATEGORY_ID[product.category_id] ?? 1;
    const previous = byId.get(product.id);
    const cheapest = previous
      ? Math.min(previous.cheapest_price, product.shop_price)
      : product.shop_price;

    byId.set(product.id, {
      id: product.id,
      product_name: product.product_name,
      brand: 'GrocerEase',
      sub_category_name: getSubcategoryName(subCategoryId),
      category_id: categoryId,
      sub_category_id: subCategoryId,
      cheapest_price: cheapest,
      rating: 3.8 + (product.id % 3) * 0.4,
      thumbnail: null,
    });
  }

  return Array.from(byId.values());
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

function filterMockProducts(filters: ProductSearchFilters): ProductSearchItem[] {
  const q = filters.q?.trim().toLowerCase() ?? '';
  const filtered = buildMockProducts().filter((item) => {
    if (q) {
      const matches =
        item.product_name.toLowerCase().includes(q) ||
        item.sub_category_name.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (filters.category_id && item.category_id !== filters.category_id) return false;
    if (filters.sub_category_id && item.sub_category_id !== filters.sub_category_id) return false;
    return true;
  });

  return sortItems(filtered, filters.sort);
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
      return categories.length ? categories : MOCK_CATEGORY_TREE;
    } catch {
      return MOCK_CATEGORY_TREE;
    }
  },

  async getProducts(
    filters: ProductSearchFilters
  ): Promise<{ items: ProductSearchItem[]; hasNextPage: boolean }> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.max(1, filters.limit ?? DEFAULT_LIMIT);

    try {
      const response = await httpService.get('/products', {
        params: {
          q: filters.q,
          category_id: filters.category_id,
          sub_category_id: filters.sub_category_id,
          sort: filters.sort,
          page,
          limit,
        },
      });

      const payload = response.data?.data ?? response.data ?? {};
      const items = normalizeProducts(payload);
      const total = toNumber(payload?.total, items.length);
      const hasNextPage = items.length === limit && page * limit < total;
      return { items, hasNextPage };
    } catch {
      const filtered = filterMockProducts(filters);
      const start = (page - 1) * limit;
      const items = filtered.slice(start, start + limit);
      return { items, hasNextPage: items.length === limit };
    }
  },
};
