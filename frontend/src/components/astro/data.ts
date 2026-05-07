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

export const ASPECTS = [
  { type: "ร่วมองศา", angle: 0, color: "var(--primary)" },       // Conjunction
  { type: "เล็ง", angle: 180, color: "var(--destructive)" },     // Opposition
  { type: "ตรีโกณ", angle: 120, color: "var(--success)" },       // Trine
  { type: "ฉาก", angle: 90, color: "var(--warning)" },           // Square
  { type: "โยค 60", angle: 60, color: "var(--info)" },           // Sextile
];

export const RECENT_CHARTS: any[] = [];