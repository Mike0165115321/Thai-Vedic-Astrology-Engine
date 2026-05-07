export type District = {
    name_th: string;
    name_en: string;
    lat: number;
    lon: number;
};

export const THAI_DISTRICTS: Record<string, District[]> = {
    "น่าน": [
        { name_th: "เมืองน่าน", name_en: "Mueang Nan", lat: 18.783, lon: 100.771 },
        { name_th: "แม่จริม", name_en: "Mae Charim", lat: 18.705, lon: 101.011 },
        { name_th: "บ้านหลวง", name_en: "Ban Luang", lat: 18.847, lon: 100.435 },
        { name_th: "นาน้อย", name_en: "Na Noi", lat: 18.328, lon: 100.615 },
        { name_th: "ปัว", name_en: "Pua", lat: 19.176, lon: 100.916 },
        { name_th: "ท่าวังผา", name_en: "Tha Wang Pha", lat: 19.115, lon: 100.801 },
        { name_th: "เวียงสา", name_en: "Wiang Sa", lat: 18.571, lon: 100.742 },
        { name_th: "ทุ่งช้าง", name_en: "Thung Chang", lat: 19.395, lon: 100.887 },
        { name_th: "เชียงกลาง", name_en: "Chiang Klang", lat: 19.292, lon: 100.861 },
        { name_th: "นาหมื่น", name_en: "Na Muen", lat: 18.188, lon: 100.671 },
        { name_th: "สันติสุข", name_en: "Santi Suk", lat: 18.905, lon: 100.942 },
        { name_th: "บ่อเกลือ", name_en: "Bo Kluea", lat: 19.148, lon: 101.155 },
        { name_th: "สองแคว", name_en: "Song Khwae", lat: 19.356, lon: 100.697 },
        { name_th: "ภูเพียง", name_en: "Phu Phiang", lat: 18.784, lon: 100.799 },
        { name_th: "เฉลิมพระเกียรติ", name_en: "Chaloem Phra Kiat", lat: 19.581, lon: 101.082 }
    ],
    "กรุงเทพมหานคร": [
        { name_th: "พระนคร", name_en: "Phra Nakhon", lat: 13.758, lon: 100.497 },
        { name_th: "ปทุมวัน", name_en: "Pathum Wan", lat: 13.744, lon: 100.529 },
        { name_th: "บางรัก", name_en: "Bang Rak", lat: 13.728, lon: 100.524 },
        { name_th: "สุขุมวิท", name_en: "Sukhumvit", lat: 13.74, lon: 100.55 },
    ],
    "อุบลราชธานี": [
      { name_th: "เมืองอุบลราชธานี", name_en: "Mueang Ubon Ratchathani", lat: 15.297, lon: 104.831 },
      { name_th: "ศรีเมืองใหม่", name_en: "Si Mueang Mai", lat: 15.367, lon: 105.067 },
      { name_th: "โขงเจียม", name_en: "Khong Chiam", lat: 15.319, lon: 105.496 },
      { name_th: "เขื่องใน", name_en: "Khueng Ngiu", lat: 15.583, lon: 105.267 },
      { name_th: "เขมราฐ", name_en: "Khemarat", lat: 15.417, lon: 105.167 },
      { name_th: "เดชอุดม", name_en: "Det Udom", lat: 14.967, lon: 105.217 },
      { name_th: "นาจะหลวย", name_en: "Na Yia", lat: 14.567, lon: 105.133 },
      { name_th: "น้ำยืน", name_en: "Nam Yuen", lat: 15.233, lon: 105.600 },
      { name_th: "บุณฑริก", name_en: "Buntharik", lat: 14.917, lon: 105.417 },
      { name_th: "ตระการพืชผล", name_en: "Trakan Phuet Phloi", lat: 15.617, lon: 105.183 },
      { name_th: "กุดข้าวปุ้น", name_en: "Kut Khao Pun", lat: 15.650, lon: 104.883 },
      { name_th: "ม่วงสามสิบ", name_en: "Muang Sam Sip", lat: 15.767, lon: 105.133 },
      { name_th: "วารินชำราบ", name_en: "Warin Chamrap", lat: 15.193, lon: 104.863 },
      { name_th: "พิบูลมังสาหาร", name_en: "Phibun Mangsahan", lat: 15.233, lon: 105.183 },
      { name_th: "ตาลสุม", name_en: "Tan Sum", lat: 15.117, lon: 105.483 },
      { name_th: "โพธิ์ไทร", name_en: "Pho Sai", lat: 15.150, lon: 105.133 },
      { name_th: "สำโรง", name_en: "Samrong", lat: 15.117, lon: 105.233 },
      { name_th: "ดอนมดแดง", name_en: "Don Mot Daeng", lat: 15.283, lon: 104.967 },
      { name_th: "สิรินธร", name_en: "Sirindhorn", lat: 15.167, lon: 105.383 },
      { name_th: "ทุ่งศรีอุดม", name_en: "Thung Si Udom", lat: 15.300, lon: 105.317 },
      { name_th: "นาเยีย", name_en: "Na Yia", lat: 14.950, lon: 105.350 },
      { name_th: "นาตาล", name_en: "Na Tan", lat: 15.000, lon: 105.450 },
      { name_th: "เหล่าเสือโก้ก", name_en: "Lao Suea Kok", lat: 15.083, lon: 105.117 },
      { name_th: "สว่างวีระวงศ์", name_en: "Sawang Wirawong", lat: 15.233, lon: 105.000 },
      { name_th: "น้ำขุ่น", name_en: "Nam Khun", lat: 15.883, lon: 105.083 }
    ],
    // We can add more provinces later or fetch from a JSON
};
