import { httpService } from './httpService';
import type { Address, AddressPayload } from '@/lib/types/address';

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    try {
      const response = await httpService.get('/addresses');
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.log('Fetch addresses error:', error);
      return [];
    }
  },

  async getAddress(id: number): Promise<Address> {
    const response = await httpService.get(`/addresses/${id}`);
    return response.data;
  },

  async createAddress(payload: AddressPayload): Promise<Address> {
    const response = await httpService.post('/addresses', payload);
    return response.data;
  },

  async updateAddress(id: number, payload: AddressPayload): Promise<Address> {
    const response = await httpService.put(`/addresses/${id}`, payload);
    return response.data;
  },

  async deleteAddress(id: number): Promise<void> {
    await httpService.delete(`/addresses/${id}`);
  },

  async getAreas(): Promise<{ id: number; area_name: string; city_id: number }[]> {
    try {
      const response = await httpService.get('/areas');
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.log('Fetch areas error:', error);
      return [];
    }
  },
};
