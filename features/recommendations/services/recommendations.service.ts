import httpService from "@/shared/httpService";
import type {
  FBTRecommendation,
  ReplenishmentRecommendation,
} from "@/features/recommendations/types";

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeFBT(raw: any): FBTRecommendation {
  return {
    product_id: Number(raw?.product_id),
    name: String(raw?.name ?? ""),
    brand: raw?.brand ?? null,
    category: raw?.category ?? null,
    image_url: raw?.image_url ?? null,
    price: toNumberOrNull(raw?.price),
    shop_product_id:
      raw?.shop_product_id === null || raw?.shop_product_id === undefined
        ? null
        : Number(raw.shop_product_id),
    available_stock: toNumberOrNull(raw?.available_stock),
    score: raw?.score,
    pair_count: raw?.pair_count,
    lift: raw?.lift,
  };
}

function normalizeReplenishment(raw: any): ReplenishmentRecommendation {
  return {
    product_id: Number(raw?.product_id),
    name: String(raw?.name ?? ""),
    brand: raw?.brand ?? null,
    category: raw?.category ?? null,
    image_url: raw?.image_url ?? null,
    rebuy_probability: raw?.rebuy_probability,
    rank: raw?.rank,
    prediction_date: raw?.prediction_date,
    model_version: raw?.model_version,
  };
}

export const recommendationsService = {
  /** Catalog product page - no shop context yet, no price/stock. */
  async getGlobalFrequentlyBoughtTogether(
    productId: number,
    limit = 10,
  ): Promise<FBTRecommendation[]> {
    try {
      const response = await httpService.get(
        `/recommendations/products/${productId}/frequently-bought-together`,
        { params: { limit } },
      );
      return toArray<any>(response.data?.data ?? response.data).map(normalizeFBT);
    } catch (error) {
      console.log("FBT global error:", error);
      return [];
    }
  },

  /** Shop product detail page - scoped to what the shop carries, with real price/stock. */
  async getShopFrequentlyBoughtTogether(
    shopId: number,
    productId: number,
    limit = 10,
  ): Promise<FBTRecommendation[]> {
    try {
      const response = await httpService.get(
        `/recommendations/shops/${shopId}/products/${productId}/frequently-bought-together`,
        { params: { limit } },
      );
      return toArray<any>(response.data?.data ?? response.data).map(normalizeFBT);
    } catch (error) {
      console.log("FBT shop error:", error);
      return [];
    }
  },

  /** Cart/checkout inside a shop - "you might also need". */
  async getCartCompletion(
    shopId: number,
    productIds: number[],
    limit = 10,
  ): Promise<FBTRecommendation[]> {
    try {
      const response = await httpService.post(
        `/recommendations/shops/${shopId}/cart/completion`,
        { product_ids: productIds, limit },
      );
      return toArray<any>(response.data?.data ?? response.data).map(normalizeFBT);
    } catch (error) {
      console.log("Cart completion error:", error);
      return [];
    }
  },

  /** Home page - cross-shop rebuy predictions, no price/shop context. */
  async getReplenishment(limit = 10): Promise<ReplenishmentRecommendation[]> {
    try {
      const response = await httpService.get("/recommendations/replenishment", {
        params: { limit },
      });
      return toArray<any>(response.data?.data ?? response.data).map(
        normalizeReplenishment,
      );
    } catch (error) {
      console.log("Replenishment error:", error);
      return [];
    }
  },
};
