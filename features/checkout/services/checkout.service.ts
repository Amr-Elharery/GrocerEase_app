import httpService from "@/shared/httpService";

const API_URL = "/orders";

export interface PlaceOrderPayload {
  shop_id: number | null;
  customer_address_id: number | string | undefined;
  payment_method: string;
  items: { shop_product_id: number; quantity: number }[];
}

export async function placeOrder(payload: PlaceOrderPayload) {
  const response = await httpService.post(API_URL, payload);
  return response;
}
