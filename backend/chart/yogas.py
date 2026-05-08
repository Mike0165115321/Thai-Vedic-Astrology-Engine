# Thai-Vedic Yoga & Special Placement Detection (Layer 2 - Logic Engine)
# Architecture: Rule-based Detection System (Hybrid Thai-Vedic)

# --- Configuration & Constants ---
NARAYA_SIGNS = [3, 6, 7, 9, 11]  # นระราศี (Human)
AMPHU_SIGNS = [4, 8, 12]          # อัมพุราศี (Water)
KEETA_SIGNS = [8]                 # กีฏะราศี (Scorpio)
CHATUSH_SIGNS = [1, 2, 5, 10]     # จตุบทราศี (Four-footed)

TRINE_HOUSES = [1, 5, 9]
KENDRA_HOUSES = [1, 4, 7, 10]

# --- Helper Functions ---

def is_in_house(planets, planet_name, target_house):
    """Checks if a planet is sitting in a specific house number."""
    return planets.get(planet_name, {}).get("house") == target_house

def add_yoga(detected, name, planet, house, description, score=0, category="general"):
    """Standardized way to add detected yogas with metadata."""
    # Avoid duplicate yogas for the same planet in the same house
    if any(y["name"] == name and y["planet"] == planet for y in detected):
        return

    detected.append({
        "name": name,
        "planet": planet,
        "house": house,
        "score": score,
        "category": category,
        "description": description,
        "strength": "strong" if score >= 40 else "medium" if score >= 20 else "weak"
    })

# --- Detection Logic ---

def detect_yogas(planets, lagna_sign, house_lords):
    detected = []

    # 1. องค์เกณฑ์ (Ong-Kane)
    detect_ong_kane(detected, planets, lagna_sign)

    # 2. อุดมเกณฑ์ (Udom-Kane)
    detect_udom_kane(detected, planets, lagna_sign)

    # 3. ปัญจมหาบุรุษโยค (Pancha Mahapurusha)
    detect_mahapurusha(detected, planets)

    # 4. พินทุบาทว์ (Pin-Tu-Bat)
    detect_pintubat(detected, planets)

    # 5. ราชาโยค / ธนะโยค (Raja / Dhana Yogas)
    detect_wealth_yogas(detected, planets, house_lords)

    return detected

def detect_ong_kane(detected, planets, lagna_sign):
    # นระองค์เกณฑ์ (1, 5, 7, 8 เป็น 1)
    if lagna_sign in NARAYA_SIGNS:
        for p in ["Sun", "Jupiter", "Saturn", "Rahu"]:
            if is_in_house(planets, p, 1):
                add_yoga(detected, "นระองค์เกณฑ์", p, 1, f"ดาว {p} ได้นระองค์เกณฑ์", score=35, category="power")

    # อัมพุองค์เกณฑ์ (2, 4, 5, 6 เป็น 4)
    if lagna_sign in AMPHU_SIGNS:
        for p in ["Moon", "Jupiter", "Mercury", "Venus"]:
            if is_in_house(planets, p, 4):
                add_yoga(detected, "อัมพุองค์เกณฑ์", p, 4, f"ดาว {p} ได้อัมพุองค์เกณฑ์", score=30, category="power")

    # กีฏะองค์เกณฑ์ (3, 7, 8, 9 เป็น 7)
    if lagna_sign in KEETA_SIGNS:
        for p in ["Mars", "Saturn", "Rahu", "Ketu"]:
            if is_in_house(planets, p, 7):
                add_yoga(detected, "กีฏะองค์เกณฑ์", p, 7, f"ดาว {p} ได้กีฏะองค์เกณฑ์", score=40, category="power")

    # จตุบทองค์เกณฑ์ (1, 2, 5, 6 เป็น 10)
    if lagna_sign in CHATUSH_SIGNS:
        for p in ["Sun", "Moon", "Jupiter", "Venus"]:
            if is_in_house(planets, p, 10):
                add_yoga(detected, "จตุบทองค์เกณฑ์", p, 10, f"ดาว {p} ได้จตุบทองค์เกณฑ์", score=32, category="power")

def detect_udom_kane(detected, planets, lagna_sign):
    # นระอุดมเกณฑ์ (1, 4, 5, 7)
    if lagna_sign in NARAYA_SIGNS:
        for p in ["Sun", "Mercury", "Jupiter", "Saturn"]:
            p_data = planets.get(p)
            if p_data:
                add_yoga(detected, "อุดมเกณฑ์", p, p_data["house"], f"ดาว {p} เป็นอุดมเกณฑ์ในนระราศี", score=20, category="abundance")

    # อัมพุอุดมเกณฑ์ (2, 3, 6, 8)
    if lagna_sign in AMPHU_SIGNS:
        for p in ["Moon", "Mars", "Venus", "Rahu"]:
            p_data = planets.get(p)
            if p_data:
                add_yoga(detected, "อุดมเกณฑ์", p, p_data["house"], f"ดาว {p} เป็นอุดมเกณฑ์ในอัมพุราศี", score=20, category="abundance")

    # กีฏะอุดมเกณฑ์ (8)
    if lagna_sign in KEETA_SIGNS:
        if "Rahu" in planets:
            add_yoga(detected, "อุดมเกณฑ์", "Rahu", planets["Rahu"]["house"], "ราหูเป็นอุดมเกณฑ์ในกีฏะราศี", score=25, category="abundance")

    # จตุบทอุดมเกณฑ์ (5)
    if lagna_sign in CHATUSH_SIGNS:
        if "Jupiter" in planets:
            add_yoga(detected, "อุดมเกณฑ์", "Jupiter", planets["Jupiter"]["house"], "พฤหัสเป็นอุดมเกณฑ์ในจตุบทราศี", score=25, category="abundance")

def detect_mahapurusha(detected, planets):
    # ปัญจมหาบุรุษโยค: เกษตร/อุจจ์ ในเคนทร (1, 4, 7, 10)
    rules = {
        "Mars": "รุจกะโยค",
        "Mercury": "ภัทระโยค",
        "Jupiter": "หรรษโยค",
        "Venus": "มาลวียะโยค",
        "Saturn": "ศศะโยค"
    }
    for p, yoga_name in rules.items():
        p_data = planets.get(p)
        if p_data and p_data.get("house") in KENDRA_HOUSES:
            dignity = p_data.get("dignity", "")
            if "เกษตร" in dignity or "อุจจ์" in dignity:
                add_yoga(detected, yoga_name, p, p_data["house"], f"{yoga_name}: ดาว {p} เป็นมหาบุรุษในภพเคนทร", score=60, category="great_being")

def detect_pintubat(detected, planets):
    # พินทุบาทว์ (จุดเสียดวงร้าว)
    # 7 ใน 7 (เสาร์เล็งลัคนา)
    if is_in_house(planets, "Saturn", 7):
        add_yoga(detected, "พินทุบาทว์ (ดวงร้าว)", "Saturn", 7, "เสาร์เล็งลัคนา: ชีวิตมักมีอุปสรรคเรื่องคู่หรือหุ้นส่วน", score=-30, category="affliction")
    
    # 8 ใน 8 (ราหูเป็นแปด)
    if is_in_house(planets, "Rahu", 8):
        add_yoga(detected, "พินทุบาทว์ (ดวงแตก)", "Rahu", 8, "ราหูเป็นแปด: ระวังเรื่องทรัพย์สินและการถูกคดโกง", score=-35, category="affliction")
    
    # 3 ใน 4 (อังคารเป็นสี่)
    if is_in_house(planets, "Mars", 4):
        add_yoga(detected, "พินทุบาทว์", "Mars", 4, "อังคารเป็นสี่: มักมีเรื่องวุ่นวายในครอบครัวหรือที่อยู่อาศัย", score=-25, category="affliction")

def detect_wealth_yogas(detected, planets, house_lords):
    # ธนะโยค / ราชาโยค (Simplified)
    # เจ้าเรือน 2 (กดุมภะ) หรือ 11 (ลาภะ) สถิตภพดี (1, 4, 7, 10, 5, 9)
    GOOD_HOUSES = [1, 4, 7, 10, 5, 9, 11]
    
    for h_num in [2, 11]:
        lord_info = house_lords.get(h_num)
        if lord_info:
            lord_name = lord_info["planet"]
            current_house = planets.get(lord_name, {}).get("house")
            if current_house in GOOD_HOUSES:
                yoga_name = "ธนะโยค" if h_num == 2 else "ลาภะโยค"
                add_yoga(detected, yoga_name, lord_name, current_house, 
                         f"{yoga_name}: เจ้าเรือน {lord_info['name']} สถิตภพดี ({current_house})", 
                         score=45, category="wealth")
