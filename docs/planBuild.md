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
□ Dignity        อุจจ์/มูลตรีโกณ/เกษตร/มิตร/กลาง/ศัตรู/นิจ
□ Combust        ดาวถูกเผา (ใกล้อาทิตย์เกินไป)
□ Retrograde     เดินถอยหลัง
□ Planetary War  ดาว 2 ดวงอยู่ใกล้กันมาก (<1°) แพ้/ชนะ
□ Speed/Motion   เร็ว/ช้า/หยุด เทียบกับความเร็วเฉลี่ย

Layer 1D — Planet Relationships (ปฏิสัมพันธ์ดาว)

  Western Aspects:
  □ Conjunction  0°
  □ Sextile      60°
  □ Square       90°
  □ Trine        120°
  □ Opposition   180°

  Vedic:
  □ Graha Drishti  การเล็งของดาว (Special Aspects อังคาร/พฤหัส/เสาร์)
  □ Rashi Drishti  การเล็งระหว่างราศี (ถ้าจะลึก)
  □ Argala         อิทธิพลแทรกแซง (เก็บไว้อนาคต)

Layer 1E — Divisional Charts
□ D1 Rasi
□ D3 Drekkana (10° ต่อส่วน)
□ D9 Navamsa (3°20' ต่อส่วน)

Layer 1F — Lunar / Nakshatra
□ นักษัตร 27 ครบทุกดวง
□ นักษัตรลัคนา
□ นักษัตรจันทร์ (สำคัญสุด)

Layer 1G — Dasha System
□ Vimshottari 120 ปี
□ Mahadasha
□ Antardasha
□ Pratyantardasha
□ Timeline วันเริ่ม-สิ้นสุดแต่ละทศา
□ ดาวครองอยู่ตอนนี้ (ปัจจุบัน)

API Layer
□ POST /calculate/chart
□ POST /calculate/compare (ดวงคู่ Synastry)
□ GET /calculate/transit
□ GET /sky/realtime (WebSocket)

Frontend
□ Birth Input Form
□ Zodiac Wheel SVG (ดาวเคลื่อนจริง)
□ เส้น Aspects บนวงล้อ
□ Planet Table (องศา/ราศี/เรือน/สถานะ/นักษัตร)
□ D1/D3/D9 Tabs
□ Dasha Timeline (visual + ไฮไลต์ปัจจุบัน)
□ Synastry View
□ Transit View
□ Settings (Ayanamsa / House System)

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