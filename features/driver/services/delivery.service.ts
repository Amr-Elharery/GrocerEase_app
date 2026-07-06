import AsyncStorage from "@react-native-async-storage/async-storage";
import httpService from "@/shared/httpService";
import { formatAddress } from "@/features/addresses/services/address.service";
import {
  AvailableJob,
  Assignment,
  DeliveryOrder,
  DeliveryProfile,
  DeliveryProfilePayload,
  DeliveryStatus,
} from "@/features/driver/types";

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

const normalizeOrderItem = (payload: any) => ({
  id: payload?.id ?? payload?.shop_product_id,
  shop_product_id: payload?.shop_product_id,
  product_name: payload?.product_name ?? payload?.name,
  quantity: payload?.quantity,
  price: payload?.price,
  subtotal: payload?.subtotal ?? payload?.total,
});

const normalizeDeliveryOrder = (payload: any): DeliveryOrder => {
  const rawItems = payload?.order_items ?? payload?.items;
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeOrderItem) : [];
  const subtotal = Number(payload?.subtotal ?? payload?.sub_total ?? 0);
  const deliveryFee = Number(payload?.delivery_fee ?? payload?.deliveryFee ?? 0);
  const rawTotal = payload?.total ?? payload?.amount;

  return {
    id: payload?.id ?? payload?.order_id,
    shop_id: payload?.shop_id,
    shop_name: payload?.shop_name ?? payload?.shop?.name ?? payload?.shop?.shop_name,
    shop_address: formatAddress(payload?.shop_address ?? payload?.shop?.address),
    customer_address: formatAddress(
      payload?.customer_address ??
        payload?.delivery_address ??
        payload?.address,
    ),
    status: payload?.status ?? payload?.order_status,
    items,
    item_count: payload?.item_count ?? items.length,
    subtotal,
    delivery_fee: deliveryFee,
    total: rawTotal != null ? Number(rawTotal) : subtotal + deliveryFee,
  };
};

const normalizeDeliveryProfile = (payload: any): DeliveryProfile => ({
  id: payload?.id,
  full_name: payload?.full_name,
  phone_number: payload?.phone_number,
  vehicle_type: payload?.vehicle_type,
  vehicle_plate_number: payload?.vehicle_plate_number,
  national_id: payload?.national_id,
  city: payload?.city,
  address: payload?.address,
  area_id: payload?.area_id,
  is_available: payload?.is_available ?? false,
  rating: payload?.rating,
  total_deliveries: payload?.total_deliveries,
});

const normalizeAvailableJob = (payload: any): AvailableJob => {
  if (payload?.type === "group") {
    return {
      type: "group",
      order_group_id: payload?.order_group_id,
      orders: Array.isArray(payload?.orders)
        ? payload.orders.map(normalizeDeliveryOrder)
        : [],
    };
  }
  return {
    type: "single",
    order: normalizeDeliveryOrder(payload?.order ?? payload),
  };
};

const normalizeAvailableJobList = (payload: any): AvailableJob[] => {
  const list = Array.isArray(payload)
    ? payload
    : (payload?.data ?? payload?.results ?? payload?.items ?? []);
  return Array.isArray(list) ? list.map(normalizeAvailableJob) : [];
};

const normalizeAssignment = (payload: any): Assignment => {
  if (payload?.type === "group") {
    return {
      type: "group",
      order_group_id: payload?.order_group_id,
      orders: Array.isArray(payload?.orders)
        ? payload.orders.map(normalizeDeliveryOrder)
        : [],
    };
  }
  return {
    type: "single",
    order: normalizeDeliveryOrder(payload?.order ?? payload),
  };
};

const normalizeAssignmentList = (payload: any): Assignment[] => {
  const list = Array.isArray(payload)
    ? payload
    : (payload?.data ?? payload?.results ?? payload?.items ?? []);
  return Array.isArray(list) ? list.map(normalizeAssignment) : [];
};

export async function createDeliveryProfile(
  payload: DeliveryProfilePayload,
): Promise<DeliveryProfile> {
  const config = await getAuthConfig();
  const response = await httpService.post("/deliveries/profile", payload, config);
  return normalizeDeliveryProfile(response?.data ?? response);
}

export async function fetchMyDeliveryProfile(): Promise<DeliveryProfile> {
  const config = await getAuthConfig();
  const response = await httpService.get("/deliveries/profile/me", config);
  return normalizeDeliveryProfile(response?.data ?? response);
}

export async function updateAvailability(
  isAvailable: boolean,
): Promise<DeliveryProfile> {
  const config = await getAuthConfig();
  const response = await httpService.patch(
    "/deliveries/profile/availability",
    { is_available: isAvailable },
    config,
  );
  return normalizeDeliveryProfile(response?.data ?? response);
}

export async function updateDriverLocation(
  latitude: number,
  longitude: number,
): Promise<any> {
  const config = await getAuthConfig();
  const response = await httpService.patch(
    "/deliveries/profile/location",
    { latitude, longitude },
    config,
  );
  return response?.data ?? response;
}

export async function fetchAvailableJobs(
  limit = 10,
  offset = 0,
): Promise<AvailableJob[]> {
  const config = await getAuthConfig();
  const response = await httpService.get(
    `/deliveries/available?limit=${limit}&offset=${offset}`,
    config,
  );
  return normalizeAvailableJobList(response?.data ?? response);
}

export async function acceptOrder(orderId: string | number): Promise<any> {
  const config = await getAuthConfig();
  const response = await httpService.post(
    `/deliveries/accept/${orderId}`,
    null,
    config,
  );
  return response?.data ?? response;
}

export async function acceptGroupOrder(
  orderGroupId: string | number,
): Promise<any> {
  const config = await getAuthConfig();
  const response = await httpService.post(
    `/deliveries/accept-group/${orderGroupId}`,
    null,
    config,
  );
  return response?.data ?? response;
}

export async function fetchMyAssignments(): Promise<Assignment[]> {
  const config = await getAuthConfig();
  const response = await httpService.get("/deliveries/my-assignments", config);
  return normalizeAssignmentList(response?.data ?? response);
}

export async function updateOrderDeliveryStatus(
  orderId: string | number,
  newStatus: DeliveryStatus,
): Promise<any> {
  const config = await getAuthConfig();
  const response = await httpService.patch(
    `/deliveries/orders/${orderId}/status`,
    { new_status: newStatus },
    config,
  );
  return response?.data ?? response;
}

export async function updateGroupDeliveryStatus(
  orderGroupId: string | number,
  newStatus: DeliveryStatus,
): Promise<any> {
  const config = await getAuthConfig();
  const response = await httpService.patch(
    `/deliveries/groups/${orderGroupId}/status`,
    { new_status: newStatus },
    config,
  );
  return response?.data ?? response;
}
