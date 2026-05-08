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
    "Rahu": swe.MEAN_NODE,
    "Uranus": swe.URANUS,
}

def calculate_planet_position(jd, planet_id):
    """Calculates the sidereal position of a planet."""
    
    # Calculate position (Longitude, Latitude, Distance, Speed)
    # Using SEFLG_SPEED to get velocity (needed for retrograde check)
    res, ret = swe.calc_ut(jd, planet_id, swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED)
    
    longitude = res[0]
    latitude = res[1]
    speed = res[3]
    
    sign = int(longitude / 30) + 1
    degree_in_sign = longitude % 30
    
    return {
        "longitude": longitude,
        "latitude": latitude,
        "sign": sign,
        "degree_in_sign": degree_in_sign,
        "speed": speed,
        "is_retrograde": speed < 0
    }


def get_all_planets(jd, node_type="MEAN", ketu_mode="vedic"):
    """Calculates positions for all 9 planets (including Ketu)."""
    results = {}
    
    # Set Rahu ID based on node_type
    rahu_id = swe.MEAN_NODE if node_type.upper() == "MEAN" else swe.TRUE_NODE
    
    # Calculate Sun to Saturn
    standard_planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Uranus"]
    for name in standard_planets:
        p_id = PLANET_IDS[name]
        results[name] = calculate_planet_position(jd, p_id)
        
    # Calculate Rahu
    results["Rahu"] = calculate_planet_position(jd, rahu_id)
    
    # Calculate Ketu based on mode
    if ketu_mode.lower() == "vedic":
        # Vedic Ketu is exactly 180 degrees from Rahu
        rahu_lon = results["Rahu"]["longitude"]
        ketu_lon = (rahu_lon + 180) % 360
        
        results["Ketu"] = {
            "longitude": ketu_lon,
            "latitude": -results["Rahu"]["latitude"], # Traditionally opposite latitude
            "sign": int(ketu_lon / 30) + 1,
            "degree_in_sign": ketu_lon % 30,
            "speed": results["Rahu"]["speed"],
            "is_retrograde": results["Rahu"]["is_retrograde"]
        }

    elif ketu_mode.lower() == "thai":
        raise NotImplementedError("Thai Ketu (9) calculation is not yet implemented.")
    else:
        raise ValueError(f"Unknown Ketu mode: {ketu_mode}")
    
    # --- Layer 1C: Planet Status ---
    from planets.dignity import get_dignity
    from planets.status import calculate_combustion, calculate_planetary_war, get_speed_status
    from core.constants import PLANETS as PLANET_META
    
    # 1. Dignity & Speed Status + Thai Names
    for name, data in results.items():
        name_to_id = {"Sun": 0, "Moon": 1, "Mars": 2, "Mercury": 3, "Jupiter": 4, "Venus": 5, "Saturn": 6, "Rahu": 7, "Ketu": 8, "Uranus": 9}
        p_id = name_to_id.get(name)
        
        dignity_list = get_dignity(p_id, data["longitude"])
        
        # Check Vargottama (วรโคตม)
        from chart.d9 import calculate_navamsa
        d1_sign = int(data["longitude"] / 30) + 1
        d9_sign = calculate_navamsa(data["longitude"])
        if d1_sign == d9_sign and "วรโคตม" not in dignity_list:
            if dignity_list == ["ปกติ"]:
                dignity_list = ["วรโคตม"]
            else:
                dignity_list.append("วรโคตม")

        data["dignity"] = " · ".join(dignity_list)
        data["dignity_list"] = dignity_list
        data["speed_status"] = get_speed_status(name, data["speed"])
        data["is_combust"] = False # Default
        data["planetary_war"] = False # Default
        
        # Attach Thai names and symbols from constants
        if p_id is not None and p_id in PLANET_META:
            data["thai_name"] = PLANET_META[p_id]["thai_name"]
            data["symbol"] = PLANET_META[p_id]["symbol"]

    # 2. Combustion
    combust_map = calculate_combustion(results)
    for name in combust_map:
        results[name]["is_combust"] = True
        
    # 3. Planetary War
    wars = calculate_planetary_war(results)
    for war in wars:
        for name in war["planets"]:
            results[name]["planetary_war"] = True
            # Optional: store war details
            results[name]["war_opponent"] = [p for p in war["planets"] if p != name][0]

    return results



