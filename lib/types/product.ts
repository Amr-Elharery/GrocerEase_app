import type { ImageSourcePropType } from 'react-native';

export interface Product {
  id: number;
  category_id: number;
  product_name: string;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
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
  image_url: ImageSourcePropType;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  category_name: string;
}

// Aggregated type for displaying products
export interface ProductDisplay extends Product {
  shop_id: number;
  shop_name: string;
  shop_price: number;
  stock: number;
  images: ProductImage[];
  primaryImage?: ImageSourcePropType;
  category?: Category;
}
