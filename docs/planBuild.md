Layer 0 — Foundation
[x] Julian Day Number (JDN)
[x] Delta T
[x] Timezone + Lat/Lng
[x] Custom Ayanamsa (กำหนดค่าเอง)

Layer 1A — Planet Positions
[x] นพเคราะห์ 9 ดวง (Swiss Ephemeris grade)
[x] ลองจิจูด Sidereal
[x] ราศีที่อยู่ (1-12)
[x] องศาในราศี
[x] Direct / Retrograde
[x] Angular Velocity


Layer 1B — Chart Structure
[x] ลัคนา (Thai standard Oblique Ascension)
[x] ราศีจักร Sidereal 12 ราศี
[x] เรือน 12 (Whole Sign House)
[x] Map ดาว → เรือน


Layer 1C — Planet Status (สภาพดาว)
[x] Dignity        อุจจ์/มูลตรีโกณ/เกษตร/มิตร/กลาง/ศัตรู/นิจ
[x] Combust        ดาวถูกเผา (ใกล้อาทิตย์เกินไป)
[x] Retrograde     เดินถอยหลัง
[x] Planetary War  ดาว 2 ดวงอยู่ใกล้กันมาก (<1°) แพ้/ชนะ
[x] Speed/Motion   เร็ว/ช้า/หยุด เทียบกับความเร็วเฉลี่ย


Layer 1D — Planet Relationships (ปฏิสัมพันธ์ดาว)

  Western Aspects:
  [x] Conjunction  0°
  [x] Sextile      60°
  [x] Square       90°
  [x] Trine        120°
  [x] Opposition   180°

  Vedic:
  [x] Graha Drishti  การเล็งของดาว (Special Aspects อังคาร/พฤหัส/เสาร์)
  [ ] Rashi Drishti  การเล็งระหว่างราศี (ถ้าจะลึก)
  [ ] Argala         อิทธิพลแทรกแซง (เก็บไว้อนาคต)


Layer 1E — Divisional Charts
[x] D1 Rasi
[x] D3 Drekkana (10° ต่อส่วน)
[x] D9 Navamsa (3°20' ต่อส่วน)

Layer 1F — Lunar / Nakshatra
[x] นักษัตร 27 ครบทุกดวง
[x] นักษัตรลัคนา
[x] นักษัตรจันทร์ (สำคัญสุด)

Layer 1G — Dasha System
[x] Vimshottari 120 ปี
[x] Mahadasha
[x] Antardasha
[x] Pratyantardasha
[x] Timeline วันเริ่ม-สิ้นสุดแต่ละทศา
[x] ดาวครองอยู่ตอนนี้ (ปัจจุบัน)

API Layer
[x] POST /calculate/chart
[x] POST /calculate/compare (ดวงคู่ Synastry)
[x] GET /calculate/transit
[ ] GET /sky/realtime (WebSocket)


Frontend
[x] Birth Input Form
[x] Zodiac Wheel SVG (ดาวเคลื่อนจริง)
[x] เส้น Aspects บนวงล้อ
[x] Planet Table (องศา/ราศี/เรือน/สถานะ/นักษัตร)
[x] D1/D3/D9 Tabs
[x] Dasha Timeline (visual + ไฮไลต์ปัจจุบัน)
[x] Synastry View (ดวงสมพงษ์แยกวงใน-นอก)
[x] Transit View (แถบปรับอายุ / ดาวจรปัจจุบัน)
[x] Settings (Ayanamsa / House System)

───────────────────────────────────────────────
Architecture Rules
───────────────────────────────────────────────

Rule 1 — Core Engine = Pure Computation Only
  - core/ และ planets/ chart/ lunar/ dasha/ ต้องทำหน้าที่แค่คำนวณ
  - ห้ามมี interpretation logic ใน core
    (เช่น "ดาวนี้ดี/ร้าย", "ช่วงนี้จะ...") อยู่ใน layer เหล่านี้
  - Interpretation ต้องอยู่ใน Plan 2+ เท่านั้น
  - Unit test ทดสอบ computation เท่านั้น ไม่ test meaning

Rule 2 — Immutability of Natal Chart
  - natal chart = immutable snapshot ณ วันเกิด
  - ห้าม mutate หลัง save
  - divisional charts (D3, D9, ...) ถูก precompute ตอน save ไม่ใช่ตอน request

───────────────────────────────────────────────
Caching Layer
───────────────────────────────────────────────

Cache Key:
  birth_date + birth_time + location (lat, lon) + ayanamsa_mode

Strategy:
  □ Natal chart → cache ถาวร (immutable, ไม่มี expire)
  □ Divisional charts (D3/D9) → precompute ตอน save natal chart
  □ Transit / Realtime → ไม่ cache (คำนวณใหม่ทุกครั้ง)

Implementation (ทำทีหลัง ตอน API Layer):
  □ Cache backend: Redis หรือ in-memory dict (สำหรับ dev)
  □ Cache key hashing: SHA256(birth_date|birth_time|lat|lon|ayanamsa)
  □ Cache miss → compute → store
  □ Cache hit → return immediately

───────────────────────────────────────────────
Plan 2 — Interpretation & Analysis (Next Steps)
───────────────────────────────────────────────

Computation & Logic:
  [ ] Shadbala (กำลังดาว 6 ประการ) - คำนวณค่าตัวเลขจริง
  [ ] Special Yogas (เกณฑ์พิเศษ) - ระบบ Rule Engine ตรวจสอบเกณฑ์ต่างๆ
  [ ] Rashi Drishti (การเล็งระหว่างราศี)
  [ ] Ashtakavarga (คะแนนความเข้มแข็งรายราศี)

Persistence & System:
  [ ] History Persistence (SQLite/PostgreSQL) - เก็บข้อมูลลง DB ถาวร
  [ ] User Session / Multi-user support
  [ ] PDF Export (ออกใบพยากรณ์)