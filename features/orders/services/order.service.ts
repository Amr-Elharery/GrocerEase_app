import AsyncStorage from "@react-native-async-storage/async-storage";
import httpService from "@/shared/httpService";
import { addressService, formatAddress } from "@/features/addresses/services/address.service";
import { shopService } from "@/features/stores/services/shop.service";
import type { OrderSummary } from "@/features/orders/types";

export type { OrderAddress, OrderItem, OrderSummary } from "@/features/orders/types";

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

// The backend's order_items only carry {id, shop_product_id, quantity, total} -
// no product name/image - so those have to be resolved separately per item.
// Likewise, orders only carry customer_address_id, never an embedded address.
export async function hydrateOrderDetails(
  order: OrderSummary,
): Promise<OrderSummary> {
  const hydrated = { ...order };

  if (!hydrated.address?.full_address && hydrated.customer_address_id) {
    try {
      const fullAddress = await addressService.getAddress(
        hydrated.customer_address_id,
      );
      hydrated.address = { full_address: formatAddress(fullAddress) };
    } catch {}
  }

  if (Array.isArray(hydrated.items) && hydrated.items.length > 0) {
    hydrated.items = await Promise.all(
      hydrated.items.map(async (item) => {
        if (item.product_name || !item.shop_product_id) return item;
        try {
          const product = await shopService.getShopProduct(
            item.shop_product_id,
          );
          if (!product) return item;
          return {
            ...item,
            product_name: product.product_name,
            image_url: product.primaryImage,
          };
        } catch {
          return item;
        }
      }),
    );
  }

  return hydrated;
}

export async function fetchOrderById(
  orderId: string | number,
): Promise<OrderSummary> {
  const config = await getAuthConfig();
  const response = await httpService.get(`/orders/${orderId}`, config);
  const order = normalizeOrder(response?.data ?? response);
  return hydrateOrderDetails(order);
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
