import swisseph as swe
from core.constants import DEFAULT_AYANAMSA, DEFAULT_HOUSE_SYSTEM
from core.ayanamsa import set_ayanamsa

def calculate_lagna(jd, lat, lon, house_system=DEFAULT_HOUSE_SYSTEM):
    """Calculates the Ascendant (Lagna) and House cusps."""
    
    # Calculate houses
    # cusps: 13 elements (index 1 to 12 are houses)
    # ascmc: 10 elements (index 0 is Ascendant)
    cusps, ascmc = swe.houses_ex(jd, lat, lon, house_system.encode(), swe.FLG_SIDEREAL)
    
    lagna_longitude = ascmc[0]
    
    return {
        "longitude": lagna_longitude,
        "sign": int(lagna_longitude / 30) + 1, # Back to 1-12
        "degree_in_sign": lagna_longitude % 30,
        "cusps": list(cusps[1:])
    }
