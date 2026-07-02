import type { Address, AddressPayload } from "@/lib/types/address";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { httpService } from "./httpService";

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

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    try {
      const config = await getAuthConfig();
      const response = await httpService.get("/addresses", config);
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.log("Fetch addresses error:", error);
      return [];
    }
  },

  async getAddress(id: number): Promise<Address> {
    const config = await getAuthConfig();
    const response = await httpService.get(`/addresses/${id}`, config);
    return response.data;
  },

  async createAddress(payload: AddressPayload): Promise<Address> {
    const config = await getAuthConfig();
    const response = await httpService.post("/addresses", payload, config);
    return response.data;
  },

  async updateAddress(id: number, payload: AddressPayload): Promise<Address> {
    const config = await getAuthConfig();
    const response = await httpService.put(`/addresses/${id}`, payload, config);
    return response.data;
  },

  async deleteAddress(id: number): Promise<void> {
    const config = await getAuthConfig();
    await httpService.delete(`/addresses/${id}`, config);
  },

  async getAreas(): Promise<
    { id: number; area_name: string; city_id: number }[]
  > {
    try {
      const config = await getAuthConfig();
      const response = await httpService.get("/areas", config);
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.log("Fetch areas error:", error);
      return [];
    }
  },
};
