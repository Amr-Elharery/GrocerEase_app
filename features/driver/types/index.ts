export type VehicleType = "bike" | "motorcycle" | "car" | "truck";

export type DeliveryStatus = "out_for_delivery" | "on_the_way" | "delivered";

export interface DeliveryProfile {
  id?: number;
  full_name: string;
  phone_number: string;
  vehicle_type: VehicleType;
  vehicle_plate_number: string;
  national_id: string;
  city: string;
  address: string;
  area_id: number;
  is_available?: boolean;
  rating?: number;
  total_deliveries?: number;
}

export interface DeliveryProfilePayload {
  full_name: string;
  phone_number: string;
  vehicle_type: VehicleType;
  vehicle_plate_number: string;
  national_id: string;
  city: string;
  address: string;
  area_id: number;
}

export interface DeliveryOrderItem {
  id: string | number;
  shop_product_id?: string | number;
  product_name?: string;
  quantity?: number;
  price?: number;
  subtotal?: number;
}

export interface DeliveryOrder {
  id: string | number;
  shop_id?: string | number;
  shop_name?: string;
  shop_address?: string;
  customer_address?: string;
  status?: DeliveryStatus | string;
  items?: DeliveryOrderItem[];
  item_count?: number;
  subtotal?: number;
  delivery_fee?: number;
  total?: number;
}

export interface SingleAvailableJob {
  type: "single";
  order: DeliveryOrder;
}

export interface GroupAvailableJob {
  type: "group";
  order_group_id: string | number;
  orders: DeliveryOrder[];
}

export type AvailableJob = SingleAvailableJob | GroupAvailableJob;

export interface SingleAssignment {
  type: "single";
  order: DeliveryOrder;
}

export interface GroupAssignment {
  type: "group";
  order_group_id: string | number;
  orders: DeliveryOrder[];
}

export type Assignment = SingleAssignment | GroupAssignment;
