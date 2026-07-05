export interface FBTRecommendation {
  product_id: number;
  name: string;
  brand?: string | null;
  category?: string | null;
  image_url?: string | null;
  price?: number | null;
  shop_product_id?: number | null;
  available_stock?: number | null;
  score?: number;
  pair_count?: number;
  lift?: number;
}

export interface ReplenishmentRecommendation {
  product_id: number;
  name: string;
  brand?: string | null;
  category?: string | null;
  image_url?: string | null;
  rebuy_probability?: number;
  rank?: number;
  prediction_date?: string;
  model_version?: string;
}
