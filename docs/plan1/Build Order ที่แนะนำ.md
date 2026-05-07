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

Plan 1 เพิ่มเติม — Strength System
└── Shadbala / Vimshopaka Bala
    เปลี่ยน Dignity จาก label → score
    AI ตีความได้ฉลาดขึ้นมาก

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


Plan 4 — Strength System        ← ใหม่ (อาจารย์แนะนำ)
└── Shadbala / Vimshopaka Bala
    Dignity → Numerical Score

Plan 5 — Yogas Engine           ← ใหม่ (อาจารย์แนะนำ)
└── Raj Yoga / Dhana Yoga
    Neecha Bhanga / Gajakesari ฯลฯ

Plan 6 — Prediction Engine      ← ใหม่ (อาจารย์แนะนำ)
└── Dasha + Transit + Natal Promise
    Aspect Activation
    → ระบบทำนายเหตุการณ์จริง