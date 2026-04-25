export interface WatchlistEntry {
  id: number;
  product_id: number;
  target_price: number;
  current_price: number;
  previous_price?: number;
  created_at?: string;
  product_name?: string;
  product_image?: string | null;
}

export interface CreateWatchlistPayload {
  product_id: number;
  target_price: number;
}
