export interface OrderItem {
  id: string | number;
  shop_product_id?: string | number;
  product_name?: string;
  image_url?: string;
  quantity?: number;
  price?: number;
  subtotal?: number;
}

export interface OrderAddress {
  id?: string | number;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  full_address?: string;
}

export interface OrderSummary {
  id: string | number;
  status: string;
  total: number;
  sub_total?: number;
  delivery_fee?: number;
  eta?: string;
  address?: OrderAddress;
  customer_address_id?: number;
  order_group_id?: string | number;
  shop_name?: string;
  items?: OrderItem[];
  order_number?: string;
  created_at?: string;
  updated_at?: string;
}
