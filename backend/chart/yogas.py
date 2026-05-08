# Thai-Vedic Yoga & Special Placement Detection (Layer 2 - Logic Engine)
# Architecture: Rule-based Detection System

NARAYA_SIGNS = [3, 6, 7, 9, 11]  # นระราศี (Human)
AMPHU_SIGNS = [4, 8, 12]          # อัมพุราศี (Water)
KEETA_SIGNS = [8]                 # กีฏะราศี (Scorpio)
CHATUSH_SIGNS = [1, 2, 5, 10]     # จตุบทราศี (Four-footed)

TRINE_HOUSES = [1, 5, 9]
KENDRA_HOUSES = [1, 4, 7, 10]

# --- Helper Functions ---

def is_in_house(planets, planet_name, target_house):
    return planets.get(planet_name, {}).get("house") == target_house

def add_yoga(detected, name, planet, house, description, score=0, category="general"):
    detected.append({
        "name": name,
        "planet": planet,
        "house": house,
        "score": score,
        "category": category,
        "description": description,
        "strength": "strong" if score >= 30 else "medium"
    })

# --- Detection Logic ---

def detect_yogas(planets, lagna_sign, house_lords):
    detected = []

    # 1. องค์เกณฑ์ (Ong-Kane) - Purely House Based
    detect_ong_kane(detected, planets, lagna_sign)

    # 2. ราชาโยค (Raja Yoga / Kendra-Trine Relationship) 
    # หมายเหตุ: แยกจาก "ราชาโชค" ที่เป็นมาตรฐานราศี
    detect_raja_yoga_relation(detected, planets, house_lords)

    return detected

def detect_ong_kane(detected, planets, lagna_sign):
    # นระองค์เกณฑ์ (1, 5, 7, 8 เป็น 1)
    if lagna_sign in NARAYA_SIGNS:
        mapping = {"Sun": 1, "Jupiter": 1, "Saturn": 1, "Rahu": 1}
        for p, h in mapping.items():
            if is_in_house(planets, p, h):
                add_yoga(detected, "นระองค์เกณฑ์", p, h, f"ดาว {p} ได้นระองค์เกณฑ์", score=25, category="power")

    # อัมพุองค์เกณฑ์ (2, 4, 5, 6 เป็น 4)
    if lagna_sign in AMPHU_SIGNS:
        mapping = {"Moon": 4, "Jupiter": 4, "Mercury": 4, "Venus": 4}
        for p, h in mapping.items():
            if is_in_house(planets, p, h):
                add_yoga(detected, "อัมพุองค์เกณฑ์", p, h, f"ดาว {p} ได้อัมพุองค์เกณฑ์", score=20, category="power")

    # กีฏะองค์เกณฑ์ (3, 7, 8, 9 เป็น 7)
    if lagna_sign in KEETA_SIGNS:
        mapping = {"Mars": 7, "Saturn": 7, "Rahu": 7, "Ketu": 7}
        for p, h in mapping.items():
            if is_in_house(planets, p, h):
                add_yoga(detected, "กีฏะองค์เกณฑ์", p, h, f"ดาว {p} ได้กีฏะองค์เกณฑ์", score=30, category="power")

    # จตุบทองค์เกณฑ์ (1, 2, 5, 6 เป็น 10)
    if lagna_sign in CHATUSH_SIGNS:
        mapping = {"Sun": 10, "Moon": 10, "Jupiter": 10, "Venus": 10}
        for p, h in mapping.items():
            if is_in_house(planets, p, h):
                add_yoga(detected, "จตุบทองค์เกณฑ์", p, h, f"ดาว {p} ได้จตุบทองค์เกณฑ์", score=28, category="power")

def detect_raja_yoga_relation(detected, planets, house_lords):
    # ราชาโยค: เมื่อเจ้าเรือนตรีโกณ และ เคนทร มาสัมพันธ์กัน (ตามหลักพระเวทผสมไทย)
    # เราจะแสดงเป็น "ราชาโยค" เพื่อไม่ให้สับสนกับ "ราชาโชค"
    for house_num, lord_data in house_lords.items():
        if house_num in TRINE_HOUSES:
            lord_name = lord_data["planet"]
            current_house = planets.get(lord_name, {}).get("house")
            if current_house in KENDRA_HOUSES:
                add_yoga(detected, "ราชาโยค", lord_name, current_house, 
                         f"เจ้าเรือน {lord_data['name']} (ตรีโกณ) สถิตภพเคนทร ({current_house})", 
                         score=50, category="fortune")
