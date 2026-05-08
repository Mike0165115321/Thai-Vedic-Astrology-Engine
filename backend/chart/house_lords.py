# Thai-Vedic House Lord Logic

# Sign Rulers (Kaset) - Thai-Vedic Hybrid Standard
# 1:Aries(Mars), 2:Taurus(Venus), 3:Gemini(Merc), 4:Cancer(Moon), 5:Leo(Sun), 6:Virgo(Merc)
# 7:Libra(Venus), 8:Scorpio(Mars), 9:Sagittarius(Jup), 10:Capricorn(Sat), 11:Aquarius(Rahu), 12:Pisces(Jup)
SIGN_LORDS = {
    1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon", 
    5: "Sun", 6: "Mercury", 7: "Venus", 8: "Mars", 
    9: "Jupiter", 10: "Saturn", 11: "Rahu", 12: "Jupiter"
}

HOUSE_NAMES_TH = [
    "ตนุ", "กดุมภะ", "สหัชชะ", "พันธุ", "ปุตตะ", "อริ", 
    "ปัตนิ", "มรณะ", "ศุภะ", "กัมมะ", "ลาภะ", "วินาศ"
]

def get_house_lords(lagna_sign):
    """
    Returns a mapping of House Number (1-12) to Planet Name
    based on the sign at the cusp (Whole Sign).
    """
    lords = {}
    for house_num in range(1, 13):
        # In Whole Sign, House 1 = Lagna Sign
        # Sign index for house n = (LagnaSign - 1 + (n - 1)) % 12 + 1
        sign_at_cusp = (lagna_sign - 1 + (house_num - 1)) % 12 + 1
        lords[house_num] = {
            "planet": SIGN_LORDS[sign_at_cusp],
            "sign": sign_at_cusp,
            "name": HOUSE_NAMES_TH[house_num - 1]
        }
    return lords

def get_planet_lordships(lagna_sign):
    """
    Returns a mapping of Planet Name to list of House Numbers it rules.
    """
    house_lords = get_house_lords(lagna_sign)
    planet_lordships = {}
    
    for house_num, data in house_lords.items():
        planet = data["planet"]
        if planet not in planet_lordships:
            planet_lordships[planet] = []
        planet_lordships[planet].append({
            "house": house_num,
            "name": data["name"]
        })
    return planet_lordships
