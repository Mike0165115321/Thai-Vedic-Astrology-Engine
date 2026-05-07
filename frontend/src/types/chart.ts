export interface Planet {
  longitude: number;
  latitude: number;
  speed: number;
  is_retrograde: boolean;
  house?: number;
  dignity?: string;
  thai_name?: string;
  symbol?: string;
}

export interface Lagna {
  longitude: number;
  sign: number;
  cusps: number[];
}

export interface NakshatraInfo {
  index: number;
  name: string;
  pada: number;
}

export interface DashaPeriod {
  planet: string;
  start: string;
  end: string;
  is_current: boolean;
}

export interface ChartData {
  julian_date: number;
  ayanamsa_name: string;
  ayanamsa_value: number;
  lagna: Lagna;
  planets: { [key: string]: Planet };
  houses: { [key: string]: number };
  western_aspects: any[];
  vedic_aspects: any[];
  d3: { [key: string]: Planet };
  d9: { [key: string]: Planet };
  lunar_data: {
    moon_nakshatra: NakshatraInfo;
    lagna_nakshatra: NakshatraInfo;
    planet_nakshatras: { [key: string]: NakshatraInfo };
  };
  dasha_timeline: DashaPeriod[];
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
