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
