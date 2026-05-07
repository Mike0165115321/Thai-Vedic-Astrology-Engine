import swisseph as swe
from core.constants import DEFAULT_AYANAMSA
from core.ayanamsa import set_ayanamsa

# Planet IDs for internal use
PLANET_IDS = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mars": swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus": swe.VENUS,
    "Saturn": swe.SATURN,
    "Rahu": swe.MEAN_NODE, # Default to Mean Node as per Vedic tradition
}

def calculate_planet_position(jd, planet_id, ayanamsa_mode="LAHIRI", custom_ayanamsa_offset=None):
    """Calculates the sidereal position of a planet."""
    set_ayanamsa(ayanamsa_mode, custom_ayanamsa_offset)
    
    # Calculate position (Longitude, Latitude, Distance, Speed)
    # Using SEFLG_SPEED to get velocity (needed for retrograde check)
    res, ret = swe.calc_ut(jd, planet_id, swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED)
    
    longitude = res[0]
    latitude = res[1]
    speed = res[3]
    
    return {
        "longitude": longitude,
        "latitude": latitude,
        "speed": speed,
        "is_retrograde": speed < 0
    }

def get_all_planets(jd, ayanamsa_mode="LAHIRI", custom_ayanamsa_offset=None, node_type="MEAN", ketu_mode="vedic"):
    """Calculates positions for all 9 planets (including Ketu)."""
    results = {}
    
    # Set Rahu ID based on node_type
    rahu_id = swe.MEAN_NODE if node_type.upper() == "MEAN" else swe.TRUE_NODE
    
    # Calculate Sun to Saturn
    standard_planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
    for name in standard_planets:
        p_id = PLANET_IDS[name]
        results[name] = calculate_planet_position(jd, p_id, ayanamsa_mode, custom_ayanamsa_offset)
        
    # Calculate Rahu
    results["Rahu"] = calculate_planet_position(jd, rahu_id, ayanamsa_mode, custom_ayanamsa_offset)
    
    # Calculate Ketu based on mode
    if ketu_mode.lower() == "vedic":
        # Vedic Ketu is exactly 180 degrees from Rahu
        rahu_lon = results["Rahu"]["longitude"]
        ketu_lon = (rahu_lon + 180) % 360
        
        results["Ketu"] = {
            "longitude": ketu_lon,
            "latitude": -results["Rahu"]["latitude"], # Traditionally opposite latitude
            "speed": results["Rahu"]["speed"],
            "is_retrograde": results["Rahu"]["is_retrograde"]
        }
    elif ketu_mode.lower() == "thai":
        # Thai Ketu (9) has a completely different calculation method 
        # (usually based on a specific daily motion from a reference date).
        # We will implement this later when reliable reference data is available.
        raise NotImplementedError("Thai Ketu (9) calculation is not yet implemented.")
    else:
        raise ValueError(f"Unknown Ketu mode: {ketu_mode}")
    
    return results


