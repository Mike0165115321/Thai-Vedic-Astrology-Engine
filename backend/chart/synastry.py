from typing import Dict, Any, List

# --- Constants & Mappings ---

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", 
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", 
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", 
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", 
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
]

# Nakshatra Properties (Index 0-26)
# Gana: 0=Deva, 1=Manushya, 2=Rakshasa
# Yoni (Animal): 0=Horse, 1=Elephant, 2=Sheep, 3=Serpent, 4=Dog, 5=Cat, 6=Rat, 7=Cow, 8=Buffalo, 9=Tiger, 10=Deer, 11=Monkey, 12=Mongoose, 13=Lion
# Nadi: 0=Aadi (Vata), 1=Madhya (Pitta), 2=Antya (Kapha)
NAKSHATRA_PROPS = [
    {"gana": 0, "yoni": 0, "nadi": 0}, # 1 Ashwini
    {"gana": 1, "yoni": 1, "nadi": 1}, # 2 Bharani
    {"gana": 2, "yoni": 2, "nadi": 2}, # 3 Krittika
    {"gana": 1, "yoni": 3, "nadi": 2}, # 4 Rohini
    {"gana": 0, "yoni": 3, "nadi": 1}, # 5 Mrigashira
    {"gana": 1, "yoni": 4, "nadi": 0}, # 6 Ardra
    {"gana": 0, "yoni": 5, "nadi": 0}, # 7 Punarvasu
    {"gana": 0, "yoni": 2, "nadi": 1}, # 8 Pushya
    {"gana": 2, "yoni": 5, "nadi": 2}, # 9 Ashlesha
    {"gana": 2, "yoni": 6, "nadi": 2}, # 10 Magha
    {"gana": 1, "yoni": 6, "nadi": 1}, # 11 Purva Phalguni
    {"gana": 1, "yoni": 7, "nadi": 0}, # 12 Uttara Phalguni
    {"gana": 0, "yoni": 8, "nadi": 0}, # 13 Hasta
    {"gana": 2, "yoni": 9, "nadi": 1}, # 14 Chitra
    {"gana": 0, "yoni": 8, "nadi": 2}, # 15 Swati
    {"gana": 2, "yoni": 9, "nadi": 2}, # 16 Vishakha
    {"gana": 0, "yoni": 10, "nadi": 1}, # 17 Anuradha
    {"gana": 2, "yoni": 10, "nadi": 0}, # 18 Jyeshtha
    {"gana": 2, "yoni": 4, "nadi": 0}, # 19 Mula
    {"gana": 1, "yoni": 11, "nadi": 1}, # 20 Purva Ashadha
    {"gana": 1, "yoni": 12, "nadi": 2}, # 21 Uttara Ashadha
    {"gana": 0, "yoni": 11, "nadi": 2}, # 22 Shravana
    {"gana": 2, "yoni": 13, "nadi": 1}, # 23 Dhanishta
    {"gana": 2, "yoni": 0, "nadi": 0}, # 24 Shatabhisha
    {"gana": 1, "yoni": 13, "nadi": 0}, # 25 Purva Bhadrapada
    {"gana": 1, "yoni": 7, "nadi": 1}, # 26 Uttara Bhadrapada
    {"gana": 0, "yoni": 1, "nadi": 2}, # 27 Revati
]

# Rashi Properties (1-12)
# Varna: 3=Brahmin, 2=Kshatriya, 1=Vaishya, 0=Shudra
RASHI_VARNA = {
    1: 2, 2: 1, 3: 0, 4: 3, 5: 2, 6: 1, 7: 0, 8: 3, 9: 2, 10: 1, 11: 0, 12: 3
}

# Sign Lords (0=Sun, 1=Moon, 2=Mars, 3=Mercury, 4=Jupiter, 5=Venus, 6=Saturn)
RASHI_LORDS = {
    1: 2, 2: 5, 3: 3, 4: 1, 5: 0, 6: 3, 7: 5, 8: 2, 9: 4, 10: 6, 11: 6, 12: 4
}

# Lord Relationships Matrix (0=Friend, 1=Neutral, 2=Enemy)
# From \ To: Sun(0), Moon(1), Mars(2), Merc(3), Jup(4), Ven(5), Sat(6)
LORD_RELATION = [
    [0, 0, 0, 1, 0, 2, 2], # Sun
    [0, 0, 1, 0, 1, 1, 1], # Moon
    [0, 0, 0, 2, 0, 1, 1], # Mars
    [0, 2, 1, 0, 1, 0, 1], # Mercury
    [0, 0, 0, 2, 0, 2, 1], # Jupiter
    [2, 2, 1, 0, 1, 0, 0], # Venus
    [2, 2, 2, 0, 1, 0, 0], # Saturn
]

# Yoni Compatibility (Animal indices 0-13)
# 4=Best, 3=Friend, 2=Neutral, 1=Enemy, 0=Great Enemy
YONI_MATRIX = [
    # 0=Horse, 1=Elephant, 2=Sheep, 3=Serpent, 4=Dog, 5=Cat, 6=Rat, 7=Cow, 8=Buffalo, 9=Tiger, 10=Deer, 11=Monkey, 12=Mongoose, 13=Lion
    [4, 2, 2, 3, 2, 2, 2, 2, 0, 1, 3, 3, 2, 1], # Horse (0)
    [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0], # Elephant (1)
    [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1], # Sheep (2)
    [3, 3, 2, 4, 2, 1, 1, 1, 2, 2, 2, 2, 0, 2], # Serpent (3)
    [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1], # Dog (4)
    [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1], # Cat (5)
    [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2], # Rat (6)
    [2, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1], # Cow (7)
    [0, 3, 3, 2, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1], # Buffalo (8)
    [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1], # Tiger (9)
    [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 2], # Deer (10)
    [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2], # Monkey (11)
    [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2], # Mongoose (12)
    [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 2, 2, 2, 4], # Lion (13)
]

def calculate_ashtakoota(moon1: Dict[str, Any], moon2: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates the 8 Kootas (Ashtakoota) between two Moon positions.
    moon1: {'longitude': float, 'sign': int (1-12), 'nakshatra_index': int (1-27)}
    Traditionally: moon1 = Groom, moon2 = Bride.
    """
    s1, s2 = moon1["sign"], moon2["sign"]
    n1, n2 = moon1["nakshatra_index"] - 1, moon2["nakshatra_index"] - 1
    
    results = {}
    total_score = 0
    
    # 1. Varna (1 pt)
    v1, v2 = RASHI_VARNA[s1], RASHI_VARNA[s2]
    v_score = 1 if v1 >= v2 else 0
    results["varna"] = {"score": v_score, "max": 1}
    total_score += v_score
    
    # 2. Vashya (2 pts)
    # Simplified logic: 2 if same sign, 1 if friendly signs, 0 otherwise. 
    # Real logic uses 5 categories. Here we use a simpler version.
    vas_score = 2 if s1 == s2 else (1 if abs(s1 - s2) in [4, 8] else 0)
    results["vashya"] = {"score": vas_score, "max": 2}
    total_score += vas_score
    
    # 3. Tara (3 pts)
    d12 = (n2 - n1) % 27 + 1
    d21 = (n1 - n2) % 27 + 1
    t1 = 1.5 if (d12 % 9) in [2, 4, 6, 8, 0] else 0
    t2 = 1.5 if (d21 % 9) in [2, 4, 6, 8, 0] else 0
    t_score = t1 + t2
    results["tara"] = {"score": t_score, "max": 3}
    total_score += t_score
    
    # 4. Yoni (4 pts)
    y1, y2 = NAKSHATRA_PROPS[n1]["yoni"], NAKSHATRA_PROPS[n2]["yoni"]
    y_score = YONI_MATRIX[y1][y2]
    results["yoni"] = {"score": y_score, "max": 4}
    total_score += y_score
    
    # 5. Graha Maitri (5 pts)
    l1, l2 = RASHI_LORDS[s1], RASHI_LORDS[s2]
    r12 = LORD_RELATION[l1][l2]
    r21 = LORD_RELATION[l2][l1]
    # Score mapping: Both Friend=5, 1F 1N=4, Both Neutral=3, 1F 1E=1, 1N 1E=0.5, Both Enemy=0
    if r12 == 0 and r21 == 0: gm_score = 5
    elif (r12 == 0 and r21 == 1) or (r12 == 1 and r21 == 0): gm_score = 4
    elif r12 == 1 and r21 == 1: gm_score = 3
    elif (r12 == 0 and r21 == 2) or (r12 == 2 and r21 == 0): gm_score = 1
    elif (r12 == 1 and r21 == 2) or (r12 == 2 and r21 == 1): gm_score = 0.5
    else: gm_score = 0
    results["graha_maitri"] = {"score": gm_score, "max": 5}
    total_score += gm_score
    
    # 6. Gana (6 pts)
    g1, g2 = NAKSHATRA_PROPS[n1]["gana"], NAKSHATRA_PROPS[n2]["gana"]
    if g1 == g2: g_score = 6
    elif (g1 == 0 and g2 == 1) or (g1 == 1 and g2 == 0): g_score = 5
    elif (g1 == 0 and g2 == 2) or (g1 == 2 and g2 == 0): g_score = 1
    else: g_score = 0 # Manushya-Rakshasa
    results["gana"] = {"score": g_score, "max": 6}
    total_score += g_score
    
    # 7. Bhakoot (7 pts)
    # Distance between signs
    dist = (s2 - s1) % 12 + 1
    if dist in [1, 7, 3, 4, 10, 11]: b_score = 7
    else: b_score = 0
    results["bhakoot"] = {"score": b_score, "max": 7}
    total_score += b_score
    
    # 8. Nadi (8 pts)
    nd1, nd2 = NAKSHATRA_PROPS[n1]["nadi"], NAKSHATRA_PROPS[n2]["nadi"]
    nd_score = 8 if nd1 != nd2 else 0
    results["nadi"] = {"score": nd_score, "max": 8}
    total_score += nd_score
    
    return {
        "total": total_score,
        "max": 36,
        "details": results
    }
