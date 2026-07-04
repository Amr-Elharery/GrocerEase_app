import type { ImageSourcePropType } from 'react-native';

export interface Product {
  id: number;
  category_id: number;
  product_name: string;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
  brand?: string;
  unit?: string;
  // The real catalog product id. On ProductDisplay, `id` is actually the
  // shop_product join row id (needed for cart/checkout), so this field is
  // the one to use when navigating to /product-details?id=.
  product_id?: number;
}

export interface ShopProduct {
  id: number;
  shop_id: number;
  product_id: number;
  stock: number;
  price: number;
  is_active: boolean;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: ImageSourcePropType | string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  category_name: string;
}

export interface SubCategory {
  id: number;
  category_name: string;
}

export interface ProductShop {
  id: number;
  shop_id: number;
  available_stock: number;
  price: number;
  is_active: boolean;
  is_available: boolean;
  shop: {
    id: number;
    shop_name: string;
    logo_url: string | null;
  };
}

export interface ProductDetail {
  id: number;
  product_name: string;
  description: string;
  brand: string;
  unit: string;
  category: Category;
  sub_category: SubCategory | null;
  product_images: ProductImage[];
  shops: ProductShop[];
}

// Aggregated type for displaying products
export interface ProductDisplay extends Product {
  shop_id: number;
  shop_name: string;
  shop_price: number;
  stock: number;
  images: ProductImage[];
  primaryImage?: string;
  category?: Category;
}
