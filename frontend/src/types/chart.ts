export interface Planet {
  longitude: number;
  latitude: number;
  speed: number;
  is_retrograde: boolean;
  thai_name?: string;
  symbol?: string;
}

export interface Lagna {
  longitude: number;
  sign_index: number;
  cusps: number[];
}

export interface ChartData {
  julian_date: number;
  planets: { [key: string]: Planet };
  lagna: Lagna;
}

export interface BirthFormData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  lat: number;
  lon: number;
}
