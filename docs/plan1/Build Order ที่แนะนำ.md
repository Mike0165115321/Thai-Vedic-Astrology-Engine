## Plan 1 — Core Engine

Week 1-2  → Layer 0 + 1A
            Julian Date · Delta T · Custom Ayanamsa
            ตำแหน่งดาว 9 ดวง (Swiss Ephemeris grade)
            ✅ เป้าหมาย: ดาวออกมาถูกต้อง เทียบ reference ได้

Week 3    → Layer 1B + 1C
            ลัคนา · ราศีจักร · เรือน 12 (Whole Sign)
            Dignity · Aspects · Special Vedic Aspects · Conjunction

Week 4    → Layer 1D + 1E
            D3 Drekkana · D9 Navamsa
            นักษัตร 27

Week 5    → Layer 1F
            Vimshottari Dasha (Mahadasha / Antardasha / Pratyantardasha)
            Dasha Timeline ตั้งแต่เกิดถึง 120 ปี

Week 6    → API Layer (FastAPI)
            POST /chart · POST /compare (ดวงคู่)
            GET /transit · GET /realtime (WebSocket)

Week 7-9  → Frontend (React / Next.js)
            Zodiac Wheel (ดาวเคลื่อนจริง) · Planet Table
            D1/D3/D9 Tabs · Dasha Timeline · Synastry View

---

## Plan 2 — Data Output

Week 10   → Context Builder (2A)
            แปลง raw data → structured text พร้อมส่ง AI

Week 11   → Export Engine (2B)
            JSON · PDF · Markdown · Prompt Ready · MCP Server

---

## Plan 3 — AI Integration

Week 12+  → Chat UI + Model Selector
            Local Ollama / Claude API / GPT-4 / Gemini
            เลือกได้จาก Settings · ถามผ่านหน้าเว็บได้เลย



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
□ ลัคนา (Thai standard Oblique Ascension)
□ ราศีจักร Sidereal 12 ราศี
□ เรือน 12 (Whole Sign House)
□ Map ดาว → เรือน

Layer 1C — Planet Status & Relationships
□ Dignity (อุจจ์/มูลตรีโกณ/เกษตร/มิตร/กลาง/ศัตรู/นิจ)
□ Aspects (180/120/90/60°)
□ Special Vedic Aspects (อังคาร/พฤหัส/เสาร์)
□ Conjunction

Layer 1D — Divisional Charts
□ D1 Rasi
□ D3 Drekkana (10° ต่อส่วน)
□ D9 Navamsa (3°20' ต่อส่วน)

Layer 1E — Lunar
□ นักษัตร 27 ครบทุกดวง
□ นักษัตรลัคนา
□ นักษัตรจันทร์ (สำคัญสุด)

Layer 1F — Dasha
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