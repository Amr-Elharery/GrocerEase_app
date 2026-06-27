export interface SearchCategory {
  id: number;
  category_name: string;
  parent_id: number | null;
  subcategories?: SearchCategory[];
}

export interface SearchStore {
  id: number;
  shop_name: string;
}

export interface ProductSearchSuggestionResponse {
  products: string[];
  sub_categories: SearchCategory[];
}

export interface ProductSearchFilters {
  q?: string;
  category_id?: number;
  sub_category_id?: number;
  min_price?: number;
  max_price?: number;
  store_ids?: number[];
  in_stock?: boolean;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating_desc';
  page?: number;
  limit?: number;
}

export interface ProductSearchItem {
  id: number;
  product_name: string;
  brand?: string;
  sub_category_name: string;
  category_id: number;
  sub_category_id: number;
  cheapest_price: number;
  rating?: number;
  thumbnail?: string | null;
}

export interface ProductSearchResponse {
  items: ProductSearchItem[];
  page: number;
  limit: number;
  total: number;
  has_next_page: boolean;
}

export interface SearchFilterOptionsResponse {
  categories: SearchCategory[];
  stores: SearchStore[];
  min_price: number;
  max_price: number;
}
