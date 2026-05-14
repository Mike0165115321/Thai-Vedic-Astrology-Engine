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
[x] GET /history (SQLite history system)
[ ] GET /sky/realtime (WebSocket)


Frontend
[x] Birth Input Form & Vault (History) system
[x] Zodiac Wheel SVG (Smooth animations with Framer Motion)
[x] Aspect Lines on Zodiac Wheel
[x] Planet Table (Dignity / Nakshatra / Coordinates)
[x] D1/D3/D9 Tabs (Divisional calculation integration)
[x] Dasha Timeline (Single & Dual mode for Synastry)
[x] Synastry View (Side-by-side comparison + Aspect Matrix)
[x] Transit View (Age Scrubber 0-120 with birth-anchor calculation)
[x] Settings (Ayanamsa / House System / Node Type)

───────────────────────────────────────────────
Architecture Rules: The 3-Layer Framework
───────────────────────────────────────────────

Layer 1 — Astronomy Engine (Physics)
  - หน้าที่: คำนวณค่าพิกัดดาราศาสตร์แม่นยำสูง
  - ฐาน: Swiss Ephemeris + Sidereal Zodiac
  - Output: Longitude, Speed, Navamsa, Nakshatras

Layer 2 — Logic Engine (Mechanics)
  - หน้าที่: ประมวลผลกฎเกณฑ์ทางโหราศาสตร์
  - ระบบ: Rule-based IF-THEN Logic
  - งาน: House Lord mapping, Yoga detection, Dasha activation, Aspect calculation
  - Output: ข้อมูลดิบที่ผ่านการตีความเชิงตรรกะ (Machine-readable)

Layer 3 — Narrative Engine (Semantics)
  - หน้าที่: แปลงข้อมูลเป็นภาษามนุษย์และการมองเห็น (Visualization)
  - ระบบ: Semantic Mapping & Scoring Engine
  - งาน: แปลรหัส "มหาจักร/ราชาโชค", ระบบ Astro Score Dashboard, Life Timeline Visualization
  - Output: คำทำนายและแนวโน้มชีวิต (Human-readable Dashboard)

───────────────────────────────────────────────
Methodology: Thai-Vedic Hybrid (Astro OS Vision)
───────────────────────────────────────────────

"สร้างระบบจัดระเบียบความซับซ้อน ไม่ใช่แค่แอปดูดวง"

1. Vedic for Calculation & Timeline:
   - ใช้ความแม่นยำของอินเดียในการหา "เมื่อไหร่" (Vimshottari Dasha)
   - ใช้ระบบกำลังดาว (Shadbala) เป็นตัวเลขวัดความเข้มแข็งเชิงคณิตศาสตร์

2. Thai for Semantic & Quality:
   - ใช้ความลุ่มลึกของไทยในการหา "อย่างไร/คุณภาพแค่ไหน" (มหาจักร, ราชาโชค)
   - ใช้รหัสวิชาไทยในการบีบอัดข้อมูลที่ซับซ้อนให้เป็น Symbolic ที่ทรงพลัง

3. Event Probability Layer:
   - เปลี่ยนจากคำทำนายแบบข้อความนิ่งๆ เป็นระบบตรวจจับแนวโน้ม (Life Trend Detection)

───────────────────────────────────────────────
Plan 2 — Interpretation & Analysis (Building Layer 2 & 3)
───────────────────────────────────────────────

Phase 2.1: The Logic Core
  [ ] House Lord Mapping - ระบบผูกดาวเจ้าเรือน 12 ภพ (พื้นฐาน Layer 2)
  [ ] Yoga Rule Engine - ระบบตรวจจับเกณฑ์และโยคต่างๆ (เริ่มต้น)
  [ ] Rahu/Ketu Dignity Update - เพิ่มมาตรฐานไทยของราหู-เกตุลง Backend

Phase 2.2: The Narrative Dashboard
  [ ] Astro Score Engine - ระบบคำนวณคะแนนแยกตามด้านชีวิต (Wealth, Career, Love)
  [ ] RightPanel Redesign - รวมกำลังดาวและเกณฑ์พิเศษเข้าด้วยกัน
  [ ] Proportional Dasha Bar - แถบทศาแสดงตามสัดส่วนเวลาจริง

Phase 2.3: System & Persistence
  [ ] History Persistence (SQLite/PostgreSQL) - เก็บข้อมูลลง DB ถาวร
  [ ] Export System (Current Focus)
    - [ ] PDF Report Export - ระบบออกใบพยากรณ์สวยงาม
    - [ ] JSON Data Export - สำหรับนำข้อมูลไปประมวลผลต่อ

───────────────────────────────────────────────
Layer 4 — Royal Court Advanced (โหรราชสำนัก)
───────────────────────────────────────────────

"ยกระดับจากแอปดูดวงสู่ห้องแล็บโหราศาสตร์ไทยขั้นสูง"

[ ] 4.1: อินทภาส-บาทจันทร์ (Inthaphas-Batchan)
  - ระบบคำนวณจุดอิทธิพลจากองศาลัคนาและบาทจันทร์ (Moon's Quarter)
  - วิเคราะห์ดาวที่ส่งอิทธิพลสูงสุดต่อเจ้าชะตา (ดาวอินทภาส/ดาวบาทจันทร์)
  - Scoring: ใช้เป็นตัวคูณ (Multiplier) เพิ่มความแม่นยำในการพยากรณ์โชคลาภและวาสนา

[ ] 4.2: ดวงพิชัยสงคราม (Duang Phichai Songkram)
  - ระบบคำนวณ "สัมโยค" และ "สัมปยุต" ขององศาดาวลิปดาต่อลิปดา
  - สร้างกราฟิก "ยันต์ดวงพิชัยสงคราม" (Digital Yantra) ตามมาตรฐานโหรหลวง
  - Export: ระบบพิมพ์ใบดวงพิชัยสงครามสำหรับใส่กรอบหรือพกติดตัว
