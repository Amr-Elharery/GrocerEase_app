import AsyncStorage from "@react-native-async-storage/async-storage";
import httpService from "./httpService";
import { addressService, formatAddress } from "./address.service";

const AUTH_TOKEN_KEYS = ["auth_token", "token", "access_token"] as const;

async function getAuthConfig() {
  let token: string | null = null;
  for (const key of AUTH_TOKEN_KEYS) {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (stored && stored !== "undefined" && stored !== "null") {
        token = stored;
        break;
      }
    } catch {}
  }

  if (!token) {
    return undefined;
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  } as const;
}

export interface OrderItem {
  id: string | number;
  product_name?: string;
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

const normalizeOrder = (payload: any): OrderSummary => {
  const rawAddress =
    payload?.address ??
    payload?.delivery_address ??
    payload?.shipping_address ??
    payload?.customer_address;

  const subTotal =
    payload?.sub_total ?? payload?.subtotal ?? payload?.subTotal ?? 0;
  const deliveryFee =
    payload?.delivery_fee ??
    payload?.deliveryFee ??
    payload?.delivery_cost ??
    0;
  const rawTotal = payload?.total ?? payload?.amount;

  return {
    id: payload?.id ?? payload?.order_id ?? payload?._id ?? payload?.orderId,
    status: payload?.status || payload?.order_status || "Pending",
    total: rawTotal || Number(subTotal) + Number(deliveryFee),
    sub_total: subTotal,
    delivery_fee: deliveryFee,
    eta: payload?.eta || payload?.estimated_time || payload?.delivery_eta || "",
    address: {
      full_address: formatAddress(rawAddress),
    },
    customer_address_id: payload?.customer_address_id,
    order_group_id: payload?.order_group_id,
    shop_name: payload?.shop_name ?? payload?.shop?.shop_name,
    items: Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.order_items)
        ? payload.order_items.map((item: any) => ({
            id: item.id,
            shop_product_id: item.shop_product_id,
            quantity: item.quantity,
            subtotal: item.total ?? item.subtotal ?? item.price,
          }))
        : [],
    order_number: payload?.order_number || payload?.invoice_number || "",
    created_at: payload?.created_at || payload?.createdAt || "",
    updated_at: payload?.updated_at || payload?.updatedAt || "",
  };
};

const normalizeOrderList = (payload: any): OrderSummary[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload.map(normalizeOrder);
  }

  const normalizedPayload = payload?.data ?? payload;
  if (Array.isArray(normalizedPayload)) {
    return normalizedPayload.map(normalizeOrder);
  }

  const candidates = [
    normalizedPayload.orders,
    normalizedPayload.results,
    normalizedPayload.items,
    payload.orders,
    payload.results,
    payload.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map(normalizeOrder);
    }
  }

  return [];
};

export async function fetchOrders(): Promise<OrderSummary[]> {
  const config = await getAuthConfig();
  const response = await httpService.get("/orders", config);
  return normalizeOrderList(response?.data ?? response);
}

export async function fetchOrderById(
  orderId: string | number,
): Promise<OrderSummary> {
  const config = await getAuthConfig();
  const response = await httpService.get(`/orders/${orderId}`, config);
  const order = normalizeOrder(response?.data ?? response);

  if (!order.address?.full_address && order.customer_address_id) {
    try {
      const fullAddress = await addressService.getAddress(
        order.customer_address_id,
      );
      order.address = { full_address: formatAddress(fullAddress) };
    } catch {}
  }

  return order;
}

export async function cancelOrder(orderId: string | number): Promise<any> {
  const config = await getAuthConfig();
  const response = await httpService.patch(
    `/orders/${orderId}/cancel`,
    null,
    config,
  );
  return response?.data ?? response;
}

export async function updateOrderStatus(
  orderId: string | number,
  status: string,
): Promise<any> {
  const response = await httpService.patch(`/orders/${orderId}/status`, {
    status,
  });
  return response?.data ?? response;
}
