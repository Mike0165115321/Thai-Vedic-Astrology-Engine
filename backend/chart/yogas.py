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

    # 6. วิเคราะห์ตนุลัคน์ (Tanu Lord Placement)
    detect_tanu_yogas(detected, planets, house_lords)

    # 7. ราชาโยคขั้นสูง
    detect_raja_yoga(detected, planets, house_lords)

    # 8. สลับเรือนโยค
    detect_parivartana_yoga(detected, planets, house_lords)

    # 9. วิปรีตราชาโยค
    detect_viparita_raja_yoga(detected, planets, house_lords)

    # 10. นิจภังค์
    detect_neecha_bhanga(detected, planets)

    # 11. เคมทรุมโยค
    detect_kemadruma(detected, planets)

    # 12. คชเกษรีโยค
    detect_gaja_kesari(detected, planets)

    # 13. จันทรมังคละโยค
    detect_chandra_mangala(detected, planets)

    # 14. อธิโยค
    detect_adhi_yoga(detected, planets)

    # 15. วสุมาติโยค
    detect_vasumathi(detected, planets)

    return detected

# --- Sub-Detectors (Original) ---

def detect_tanu_yogas(detected, planets, house_lords):
    """Analyzes the placement of the Lagna Lord (Tanu Lord)."""
    tanu_lord_info = house_lords.get(1)
    if not tanu_lord_info:
        return

    tanu_lord = tanu_lord_info["planet"]
    p_data = planets.get(tanu_lord)
    if not p_data:
        return

    house = p_data["house"]
    
    if house == 6:
        add_yoga(detected, "ตนุลัคน์เป็นอริ", tanu_lord, house, "ตนุลัคน์สถิตภพอริ: ชีวิตมักต้องต่อสู้ดิ้นรนหรือมีอุปสรรคให้แก้ไขบ่อยครั้ง", score=-15, category="life_path")
    elif house == 8:
        add_yoga(detected, "ตนุลัคน์เป็นมรณะ", tanu_lord, house, "ตนุลัคน์สถิตภพมรณะ: ชีวิตมักมีการเปลี่ยนแปลงบ่อย หรือทำงานทางไกล/ต่างถิ่น", score=-20, category="life_path")
    elif house == 12:
        add_yoga(detected, "ตนุลัคน์เป็นวินาศ", tanu_lord, house, "ตนุลัคน์สถิตภพวินาศ: มักทำงานเบื้องหลัง หรือเป็นคนเก็บตัว มีโลกส่วนตัวสูง", score=-20, category="life_path")
    elif house == 1:
        add_yoga(detected, "ตนุลัคน์เป็นตนุ", tanu_lord, house, "ตนุลัคน์สถิตภพตนุ: เป็นคนมีความเชื่อมั่นในตัวเองสูง พึ่งพาตัวเองได้ดี", score=40, category="life_path")
    elif house == 4:
        add_yoga(detected, "ตนุลัคน์เป็นพันธุ", tanu_lord, house, "ตนุลัคน์สถิตภพพันธุ: ชีวิตผูกพันกับครอบครัว บ้านช่อง หรือการวางรากฐานชีวิต", score=30, category="life_path")
    elif house == 7:
        add_yoga(detected, "ตนุลัคน์เป็นปัตนิ", tanu_lord, house, "ตนุลัคน์สถิตภพปัตนิ: ชีวิตมักผูกพันกับคู่ครอง หุ้นส่วน หรือการติดต่อกับผู้อื่น", score=30, category="life_path")
    elif house == 10:
        add_yoga(detected, "ตนุลัคน์เป็นกัมมะ", tanu_lord, house, "ตนุลัคน์สถิตภพกัมมะ: เป็นคนมุ่งมั่นเรื่องการงาน ความรับผิดชอบ และความสำเร็จในอาชีพ", score=35, category="life_path")
    elif house == 5:
        add_yoga(detected, "ตนุลัคน์เป็นปุตตะ", tanu_lord, house, "ตนุลัคน์สถิตภพปุตตะ: ชีวิตมักเกี่ยวข้องกับการเริ่มต้นใหม่ ความรัก หรือบริวาร", score=32, category="life_path")
    elif house == 9:
        add_yoga(detected, "ตนุลัคน์เป็นศุภะ", tanu_lord, house, "ตนุลัคน์สถิตภพศุภะ: เป็นคนมีวาสนาดี มีผู้ใหญ่เมตตา หรือสนใจในธรรมะ/ความรู้สูง", score=45, category="life_path")
    elif house == 2:
        add_yoga(detected, "ตนุลัคน์สถิตกดุมภะ", tanu_lord, house, "ตนุลัคน์สถิตภพกดุมภะ: ชีวิตมักมุ่งเน้นเรื่องการสร้างฐานะและการเงิน", score=25, category="wealth")
    elif house == 3:
        add_yoga(detected, "ตนุลัคน์สถิตสหัชชะ", tanu_lord, house, "ตนุลัคน์สถิตภพสหัชชะ: เป็นคนเข้าสังคมเก่ง มีเพื่อนฝูงมาก หรือมีการเดินทางติดต่อบ่อย", score=22, category="life_path")
    elif house == 11:
        add_yoga(detected, "ตนุลัคน์สถิตลาภะ", tanu_lord, house, "ตนุลัคน์สถิตภพลาภะ: เป็นคนมีโชคลาภ เพื่อนฝูงและสังคมนำพาสิ่งดีๆ มาให้", score=30, category="wealth")

def detect_ong_kane(detected, planets, lagna_sign):
    if lagna_sign in NARAYA_SIGNS:
        for p in ["Sun", "Jupiter", "Saturn", "Rahu"]:
            if is_in_house(planets, p, 1):
                add_yoga(detected, "นระองค์เกณฑ์", p, 1, f"ดาว {p} ได้นระองค์เกณฑ์", score=35, category="power")
    if lagna_sign in AMPHU_SIGNS:
        for p in ["Moon", "Jupiter", "Mercury", "Venus"]:
            if is_in_house(planets, p, 4):
                add_yoga(detected, "อัมพุองค์เกณฑ์", p, 4, f"ดาว {p} ได้อัมพุองค์เกณฑ์", score=30, category="power")
    if lagna_sign in KEETA_SIGNS:
        for p in ["Mars", "Saturn", "Rahu", "Ketu"]:
            if is_in_house(planets, p, 7):
                add_yoga(detected, "กีฏะองค์เกณฑ์", p, 7, f"ดาว {p} ได้กีฏะองค์เกณฑ์", score=40, category="power")
    if lagna_sign in CHATUSH_SIGNS:
        for p in ["Sun", "Moon", "Jupiter", "Venus"]:
            if is_in_house(planets, p, 10):
                add_yoga(detected, "จตุบทองค์เกณฑ์", p, 10, f"ดาว {p} ได้จตุบทองค์เกณฑ์", score=32, category="power")

def detect_udom_kane(detected, planets, lagna_sign):
    if lagna_sign in NARAYA_SIGNS:
        for p in ["Sun", "Mercury", "Jupiter", "Saturn"]:
            p_data = planets.get(p)
            if p_data and p_data["house"] in [1, 4, 5, 7]:
                add_yoga(detected, "อุดมเกณฑ์", p, p_data["house"], f"ดาว {p} เป็นอุดมเกณฑ์ในนระราศี", score=20, category="abundance")
    if lagna_sign in AMPHU_SIGNS:
        for p in ["Moon", "Mars", "Venus", "Rahu"]:
            p_data = planets.get(p)
            if p_data and p_data["house"] in [2, 3, 6, 8]:
                add_yoga(detected, "อุดมเกณฑ์", p, p_data["house"], f"ดาว {p} เป็นอุดมเกณฑ์ในอัมพุราศี", score=20, category="abundance")
    if lagna_sign in KEETA_SIGNS:
        if "Rahu" in planets and planets["Rahu"]["house"] == 8:
            add_yoga(detected, "อุดมเกณฑ์", "Rahu", 8, "ราหูเป็นอุดมเกณฑ์ในกีฏะราศี", score=25, category="abundance")
    if lagna_sign in CHATUSH_SIGNS:
        if "Jupiter" in planets and planets["Jupiter"]["house"] == 5:
            add_yoga(detected, "อุดมเกณฑ์", "Jupiter", 5, "พฤหัสเป็นอุดมเกณฑ์ในจตุบทราศี", score=25, category="abundance")

def detect_mahapurusha(detected, planets):
    rules = {"Mars": "รุจกะโยค", "Mercury": "ภัทระโยค", "Jupiter": "หรรษโยค", "Venus": "มาลวียะโยค", "Saturn": "ศศะโยค"}
    for p, yoga_name in rules.items():
        p_data = planets.get(p)
        if p_data and p_data.get("house") in KENDRA_HOUSES:
            dignity = p_data.get("dignity", "")
            if "เกษตร" in dignity or "อุจจ์" in dignity:
                add_yoga(detected, yoga_name, p, p_data["house"], f"{yoga_name}: ดาว {p} เป็นมหาบุรุษในภพเคนทร", score=60, category="great_being")

def detect_pintubat(detected, planets):
    if is_in_house(planets, "Saturn", 7):
        add_yoga(detected, "พินทุบาทว์ (ดวงร้าว)", "Saturn", 7, "เสาร์เล็งลัคนา: ชีวิตมักมีอุปสรรคเรื่องคู่หรือหุ้นส่วน", score=-30, category="affliction")
    if is_in_house(planets, "Rahu", 8):
        add_yoga(detected, "พินทุบาทว์ (ดวงแตก)", "Rahu", 8, "ราหูเป็นแปด: ระวังเรื่องทรัพย์สินและการถูกคดโกง", score=-35, category="affliction")
    if is_in_house(planets, "Mars", 4):
        add_yoga(detected, "พินทุบาทว์", "Mars", 4, "อังคารเป็นสี่: มักมีเรื่องวุ่นวายในครอบครัวหรือที่อยู่อาศัย", score=-25, category="affliction")

def detect_wealth_yogas(detected, planets, house_lords):
    GOOD_HOUSES = [1, 4, 7, 10, 5, 9, 11]
    for h_num in [2, 11]:
        lord_info = house_lords.get(h_num)
        if lord_info:
            lord_name = lord_info["planet"]
            current_house = planets.get(lord_name, {}).get("house")
            if current_house in GOOD_HOUSES:
                yoga_name = "ธนะโยค" if h_num == 2 else "ลาภะโยค"
                add_yoga(detected, yoga_name, lord_name, current_house, f"{yoga_name}: เจ้าเรือน {lord_info['name']} สถิตภพดี ({current_house})", score=45, category="wealth")

# --- Sub-Detectors (Advanced/Vedic) ---

def detect_raja_yoga(detected, planets, house_lords):
    trine_lords = [house_lords[h]["planet"] for h in [1, 5, 9] if h in house_lords]
    kendra_lords = [house_lords[h]["planet"] for h in [1, 4, 7, 10] if h in house_lords]
    for t_lord in trine_lords:
        t_house = planets.get(t_lord, {}).get("house")
        for k_lord in kendra_lords:
            k_house = planets.get(k_lord, {}).get("house")
            if t_house and k_house and t_house == k_house:
                add_yoga(detected, "ราชาโยค", t_lord, t_house, f"เจ้าเรือนตรีโกณ ({t_lord}) กุมเจ้าเรือนเคนทร ({k_lord})", score=55, category="raja_yoga")

def detect_parivartana_yoga(detected, planets, house_lords):
    for h1, lord1_info in house_lords.items():
        lord1 = lord1_info["planet"]
        l1_house = planets.get(lord1, {}).get("house")
        if l1_house and l1_house in house_lords:
            lord2 = house_lords[l1_house]["planet"]
            l2_house = planets.get(lord2, {}).get("house")
            if l2_house == h1 and lord1 != lord2:
                add_yoga(detected, "สลับเรือนโยค", lord1, l1_house, f"{lord1} และ {lord2} เกิดสลับเรือน", score=48, category="exchange")

def detect_viparita_raja_yoga(detected, planets, house_lords):
    dusthana = [6, 8, 12]
    for h in dusthana:
        if h in house_lords:
            lord = house_lords[h]["planet"]
            curr_h = planets.get(lord, {}).get("house")
            if curr_h in dusthana:
                add_yoga(detected, "วิปรีตราชาโยค", lord, curr_h, f"เจ้าเรือน {h} ไปอยู่เรือนเสีย ({curr_h})", score=52, category="viparita")

def detect_neecha_bhanga(detected, planets):
    for p_name, p_data in planets.items():
        if "นิจ" in p_data.get("dignity", []) and p_data.get("house") in KENDRA_HOUSES:
            add_yoga(detected, "นิจภังค์", p_name, p_data["house"], f"{p_name} นิจแต่สถิตภพเคนทร", score=38, category="cancellation")

def detect_kemadruma(detected, planets):
    moon_h = planets.get("Moon", {}).get("house")
    if not moon_h: return
    prev_h = 12 if moon_h == 1 else moon_h - 1
    next_h = 1 if moon_h == 12 else moon_h + 1
    if not any(p != "Moon" and d.get("house") in [prev_h, next_h] for p, d in planets.items()):
        add_yoga(detected, "เคมทรุมโยค", "Moon", moon_h, "จันทร์โดดเดี่ยว ขาดแรงสนับสนุนทางจิตใจ", score=-45, category="affliction")

def detect_gaja_kesari(detected, planets):
    m_h, j_h = planets.get("Moon", {}).get("house"), planets.get("Jupiter", {}).get("house")
    if m_h and j_h and (((j_h - m_h) % 12) + 1) in [1, 4, 7, 10]:
        add_yoga(detected, "คชเกษรีโยค", "Jupiter", j_h, "พฤหัสอยู่เคนทรจากจันทร์", score=58, category="wisdom")

def detect_chandra_mangala(detected, planets):
    m_h, ma_h = planets.get("Moon", {}).get("house"), planets.get("Mars", {}).get("house")
    if m_h and ma_h and m_h == ma_h:
        add_yoga(detected, "จันทรมังคละโยค", "Mars", ma_h, "จันทร์กุมอังคาร ส่งเสริมการเงินและแรงผลักดัน", score=42, category="wealth")

def detect_adhi_yoga(detected, planets):
    m_h = planets.get("Moon", {}).get("house")
    if not m_h: return
    for p in ["Mercury", "Jupiter", "Venus"]:
        ph = planets.get(p, {}).get("house")
        if ph and (((ph - m_h) % 12) + 1) in [6, 7, 8]:
            add_yoga(detected, "อธิโยค", p, ph, f"{p} อยู่ {((ph - m_h) % 12) + 1} จากจันทร์", score=35, category="support")

def detect_vasumathi(detected, planets):
    for p in ["Mercury", "Jupiter", "Venus"]:
        h = planets.get(p, {}).get("house")
        if h in [3, 6, 10, 11]:
            add_yoga(detected, "วสุมาติโยค", p, h, f"{p} อยู่ภพอุปจยะ", score=36, category="wealth")