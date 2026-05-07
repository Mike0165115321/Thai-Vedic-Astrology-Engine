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
    ]
    // We can add more provinces later or fetch from a JSON
};
