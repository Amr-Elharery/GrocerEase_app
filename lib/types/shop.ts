import type { ImageSourcePropType } from 'react-native';

export interface Shop {
  id: number;
  user_id: number;
  shop_name: string;
  created_at: string;
  updated_at: string;
}

export interface ShopLocation {
  id: number;
  shop_id: number;
  area_id: number;
  city: string;
  building_name: string;
  street_name: string;
  street_number: number;
  longitude: number;
  latitude: number;
  created_at: string;
  updated_at: string;
}

export interface ShopReview {
  id: number;
  shop_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ShopImage {
  id: number;
  shop_id: number;
  image_url: ImageSourcePropType;
  created_at: string;
  updated_at: string;
}

// Aggregated type for displaying shops
export interface ShopDisplay extends Shop {
  location?: ShopLocation;
  images: ShopImage[];
  averageRating: number;
  reviewCount: number;
  deliveryTime?: string;
}
