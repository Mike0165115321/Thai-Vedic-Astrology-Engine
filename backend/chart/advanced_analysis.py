
def calculate_inthaphas_batchan(planets, lagna_data, house_lords):
    """
    Calculates Inthaphas and Batchan planets based on Thai Royal Court standards.
    
    - Inthaphas: Lord of the sign resulting from (Lagna + Sun + Moon + Jupiter)
    - Batchan: Lord of the Moon's Navamsa position
    """
    
    # 1. Calculate Inthaphas
    lagna_lon = lagna_data.get("longitude", 0)
    sun_lon = planets.get("Sun", {}).get("longitude", 0)
    moon_lon = planets.get("Moon", {}).get("longitude", 0)
    jupiter_lon = planets.get("Jupiter", {}).get("longitude", 0)
    
    inthaphas_sum = (lagna_lon + sun_lon + moon_lon + jupiter_lon) % 360
    inthaphas_sign = int(inthaphas_sum / 30) + 1 # 1-12
    
    # Sign Lords (Thai Standard: 1=Sun, 2=Moon, 3=Mars, 4=Mercury, 5=Jupiter, 6=Venus, 7=Saturn, 8=Rahu)
    # Note: Using names consistent with the rest of the app
    sign_to_lord = {
        1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon", 
        5: "Sun", 6: "Mercury", 7: "Venus", 8: "Mars", 
        9: "Jupiter", 10: "Saturn", 11: "Rahu", 12: "Jupiter"
    }
    
    inthaphas_planet = sign_to_lord.get(inthaphas_sign)
    
    # 2. Calculate Batchan (Moon's Navamsa Lord)
    # The Moon's Navamsa is already calculated in the divisional chart logic, 
    # but we can derive it here for clarity.
    # Moon degree in sign (0-30)
    moon_deg_in_sign = moon_lon % 30
    nav_idx = int(moon_deg_in_sign / (3 + 1/3)) # 0-8
    
    # The starting sign for Navamsa depends on the Moon's Rashi (Element)
    # Fire (1,5,9) starts at Aries (1)
    # Earth (2,6,10) starts at Capricorn (10)
    # Air (3,7,11) starts at Libra (7)
    # Water (4,8,12) starts at Cancer (4)
    moon_rashi = int(moon_lon / 30) + 1
    
    start_sign = 1
    if moon_rashi in [1, 5, 9]: start_sign = 1
    elif moon_rashi in [2, 6, 10]: start_sign = 10
    elif moon_rashi in [3, 7, 11]: start_sign = 7
    elif moon_rashi in [4, 8, 12]: start_sign = 4
    
    batchan_sign = (start_sign + nav_idx - 1) % 12 + 1
    batchan_planet = sign_to_lord.get(batchan_sign)
    
    # 3. Interpretation / Status
    is_same = (inthaphas_planet == batchan_planet)
    
    return {
        "inthaphas": {
            "planet": inthaphas_planet,
            "sign": inthaphas_sign,
            "longitude": inthaphas_sum
        },
        "batchan": {
            "planet": batchan_planet,
            "sign": batchan_sign
        },
        "is_dual_lord": is_same,
        "summary_th": f"ดวงชะตานี้มีดาว{inthaphas_planet}เป็นดาวอินทภาส และดาว{batchan_planet}เป็นดาวบาทจันทร์"
    }
