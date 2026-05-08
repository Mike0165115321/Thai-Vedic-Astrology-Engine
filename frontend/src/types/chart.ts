export interface Planet {
  longitude: number;
  latitude: number;
  speed: number;
  is_retrograde: boolean;
  sign?: number;           // 1-12
  degree_in_sign?: number;
  house?: number;
  dignity?: string;
  dignity_list?: string[];
  speed_status?: string;
  is_combust?: boolean;
  planetary_war?: boolean;
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
  d3: { [key: string]: { sign: number; longitude: number } };
  d9: { [key: string]: { sign: number; longitude: number } };
  d3_lagna?: Lagna;
  d9_lagna?: Lagna;
  lunar_data: {
    moon_nakshatra: NakshatraInfo;
    lagna_nakshatra: NakshatraInfo;
    planet_nakshatras: { [key: string]: NakshatraInfo };
  };
  dasha_timeline: DashaPeriod[];
}

export interface BirthFormData {
  name?: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  lat: number;
  lon: number;
  timezone: string;
  ayanamsa_mode?: string;
  custom_ayanamsa_offset?: number;
  node_type?: "MEAN" | "TRUE";
  house_system?: string;
  aspect_orb?: number;
}
