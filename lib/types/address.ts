export interface Address {
  id?: number;
  area_id: number;
  street: string;
  building: string;
  floor: string;
  apt_number: string;
  latitude: number;
  longitude: number;
  label: string;
  additional_directions: string;
}

export interface AddressPayload {
  area_id: number;
  street: string;
  building: string;
  floor: string;
  apt_number: string;
  latitude: number;
  longitude: number;
  label: string;
  additional_directions: string;
}
