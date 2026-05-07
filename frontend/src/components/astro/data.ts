export const SIGNS = [
  { name: "Aries", name_th: "เมษ", symbol: "♈", element: "fire" },
  { name: "Taurus", name_th: "พฤษภ", symbol: "♉", element: "earth" },
  { name: "Gemini", name_th: "เมถุน", symbol: "♊", element: "air" },
  { name: "Cancer", name_th: "กรกฎ", symbol: "♋", element: "water" },
  { name: "Leo", name_th: "สิงห์", symbol: "♌", element: "fire" },
  { name: "Virgo", name_th: "กันย์", symbol: "♍", element: "earth" },
  { name: "Libra", name_th: "ตุลย์", symbol: "♎", element: "air" },
  { name: "Scorpio", name_th: "พิจิก", symbol: "♏", element: "water" },
  { name: "Sagittarius", name_th: "ธนู", symbol: "♐", element: "fire" },
  { name: "Capricorn", name_th: "มังกร", symbol: "♑", element: "earth" },
  { name: "Aquarius", name_th: "กุมภ์", symbol: "♒", element: "air" },
  { name: "Pisces", name_th: "มีน", symbol: "♓", element: "water" },
];

export type Planet = {
  name: string;
  symbol: string;
  lon: number; // 0-360
  speed: number;
  retro?: boolean;
  house: number;
  dignity: string;
  nakshatra: string;
  color: string;
};

export const PLANETS: Planet[] = [
  { name: "Sun", symbol: "☉", lon: 12.43, speed: 0.98, house: 1, dignity: "Exalted", nakshatra: "Ashwini", color: "var(--warning)" },
  { name: "Moon", symbol: "☽", lon: 142.18, speed: 13.2, house: 5, dignity: "Friend", nakshatra: "Magha", color: "#cfd6e4" },
  { name: "Mercury", symbol: "☿", lon: 28.65, speed: 1.4, house: 1, dignity: "Own", nakshatra: "Bharani", color: "var(--info)" },
  { name: "Venus", symbol: "♀", lon: 58.91, speed: 1.1, house: 2, dignity: "Neutral", nakshatra: "Mrigashira", color: "#f5b8e0" },
  { name: "Mars", symbol: "♂", lon: 211.07, speed: 0.5, house: 7, dignity: "Debilitated", nakshatra: "Vishakha", color: "var(--destructive)" },
  { name: "Jupiter", symbol: "♃", lon: 95.22, speed: 0.08, retro: true, house: 4, dignity: "Friend", nakshatra: "Punarvasu", color: "var(--primary)" },
  { name: "Saturn", symbol: "♄", lon: 332.74, speed: -0.04, retro: true, house: 11, dignity: "Own", nakshatra: "Purva Bhadra", color: "#94a3b8" },
  { name: "Rahu", symbol: "☊", lon: 178.55, speed: -0.05, retro: true, house: 6, dignity: "—", nakshatra: "Chitra", color: "var(--accent)" },
  { name: "Ketu", symbol: "☋", lon: 358.55, speed: -0.05, retro: true, house: 12, dignity: "—", nakshatra: "Revati", color: "#a78bfa" },
];

export const ASPECTS = [
  { type: "Conjunction", angle: 0, color: "var(--primary)" },
  { type: "Opposition", angle: 180, color: "var(--destructive)" },
  { type: "Trine", angle: 120, color: "var(--success)" },
  { type: "Square", angle: 90, color: "var(--warning)" },
  { type: "Sextile", angle: 60, color: "var(--info)" },
];

export const DASHA = [
  { lord: "Ketu", start: 1988, end: 1995, color: "#a78bfa" },
  { lord: "Venus", start: 1995, end: 2015, color: "#f5b8e0" },
  { lord: "Sun", start: 2015, end: 2021, color: "var(--warning)" },
  { lord: "Moon", start: 2021, end: 2031, color: "#cfd6e4" },
  { lord: "Mars", start: 2031, end: 2038, color: "var(--destructive)" },
  { lord: "Rahu", start: 2038, end: 2056, color: "var(--accent)" },
];

export const RECENT_CHARTS = [
  { name: "Aria Volkov", date: "1992-04-17", loc: "Reykjavik, IS" },
  { name: "Kenji Tanaka", date: "1985-11-02", loc: "Kyoto, JP" },
  { name: "Maya Okafor", date: "2001-07-29", loc: "Lagos, NG" },
  { name: "Lucien Marais", date: "1978-03-09", loc: "Marseille, FR" },
];