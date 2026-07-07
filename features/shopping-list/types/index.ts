export interface ShoppingListItem {
  product_id: number;
  product_name: string;
  brand?: string;
  image_url?: string;
  qty: number;
}

export interface OptimizeItemAssignment {
  store: string;
  shop_id: number;
  shop_product_id: number;
  price: number;
}

export interface OptimizationPlan {
  stores_to_visit: string[];
  item_assignment: Record<string, OptimizeItemAssignment>;
  item_cost: number;
  delivery_cost: number;
  total_cost: number;
  route: any[];
}

export interface OrderGroupOrderPayload {
  shop_id: number;
  customer_address_id: number;
  payment_method: string;
  items: { shop_product_id: number; quantity: number }[];
}

export interface OrderOptimizationPayload {
  customer_address_id: number;
  payment_method: string;
  orders: OrderGroupOrderPayload[];
}
