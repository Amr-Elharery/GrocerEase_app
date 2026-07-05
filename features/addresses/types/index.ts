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
  is_default?: boolean;
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

export interface City {
  id: number;
  city_name: string;
}

export interface Area {
  id: number;
  city_id: number;
  area_name: string;
}

export interface AreaWithCity extends Area {
  city?: City;
}
