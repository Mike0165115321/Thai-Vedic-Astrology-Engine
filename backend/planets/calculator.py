import swisseph as swe
from core.constants import DEFAULT_AYANAMSA
from core.ayanamsa import set_ayanamsa
try:
    from planets.corrections import apply_correction, get_preset_correction
except ImportError:
    from .corrections import apply_correction, get_preset_correction

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

def calculate_planet_position(jd, planet_id, is_sidereal=True, planet_name=None):
    """Calculates the position of a planet."""
    
    flags = swe.FLG_SWIEPH | swe.FLG_SPEED
    if is_sidereal:
        flags |= swe.FLG_SIDEREAL
        
    res, ret = swe.calc_ut(jd, planet_id, flags)
    
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


def get_all_planets(jd, node_type="MEAN", ketu_mode="vedic", ayanamsa_mode=DEFAULT_AYANAMSA, planet_corrections=None):
    """Calculates positions for all 9 planets (including Ketu)."""
    results = {}
    
    is_sidereal = (ayanamsa_mode.upper() != "TROPICAL")
    
    # Use corrections from Presets AND Manual Overrides from API
    def get_corrected_lon(name, raw_lon):
        # Base offset from the selected calendar mode (Preset)
        preset_offset = get_preset_correction(ayanamsa_mode, name)
        
        # Manual offset from the UI (Override)
        manual_offset = 0.0
        if planet_corrections and name in planet_corrections:
            manual_offset = float(planet_corrections[name])
            
        return (raw_lon + preset_offset + manual_offset) % 360

    # Set Rahu ID based on node_type
    rahu_id = swe.MEAN_NODE if node_type.upper() == "MEAN" else swe.TRUE_NODE
    
    # Calculate Sun to Saturn
    standard_planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Uranus"]
    for name in standard_planets:
        p_id = PLANET_IDS[name]
        raw_pos = calculate_planet_position(jd, p_id, is_sidereal=is_sidereal)
        raw_pos["longitude"] = get_corrected_lon(name, raw_pos["longitude"])
        # Re-calculate sign/degree after correction
        raw_pos["sign"] = int(raw_pos["longitude"] / 30) + 1
        raw_pos["degree_in_sign"] = raw_pos["longitude"] % 30
        results[name] = raw_pos
        
    # Calculate Rahu
    raw_rahu = calculate_planet_position(jd, rahu_id, is_sidereal=is_sidereal)
    raw_rahu["longitude"] = get_corrected_lon("Rahu", raw_rahu["longitude"])
    raw_rahu["sign"] = int(raw_rahu["longitude"] / 30) + 1
    raw_rahu["degree_in_sign"] = raw_rahu["longitude"] % 30
    results["Rahu"] = raw_rahu
    
    # Calculate Ketu based on mode (Force Vedic logic for HYBRID and MYHORO)
    is_hybrid_or_myhoro = ayanamsa_mode in ["HYBRID", "MYHORO"]
    
    if ketu_mode.lower() == "vedic" or is_hybrid_or_myhoro:
        # Vedic Ketu is exactly 180 degrees from Rahu
        rahu_lon = results["Rahu"]["longitude"]
        ketu_lon = (rahu_lon + 180) % 360
        ketu_lon = get_corrected_lon("Ketu", ketu_lon)
        
        results["Ketu"] = {
            "longitude": ketu_lon,
            "latitude": -results["Rahu"]["latitude"], # Traditionally opposite latitude
            "sign": int(ketu_lon / 30) + 1,
            "degree_in_sign": ketu_lon % 30,
            "speed": results["Rahu"]["speed"],
            "is_retrograde": results["Rahu"]["is_retrograde"]
        }

    elif ketu_mode.lower() == "thai":
        # Thai Ketu (เกตุ ๙) calculation
        # Constant speed: 40 arc-minutes per day (Direct)
        # Epoch: 01-01-1900 00:00 UTC (JD 2415020.5) -> Ketu at 288 degrees
        # Note: Thai Ketu is usually calculated in the Sidereal zodiac.
        # If Tropical mode is on, we'll still calculate it but it might be conceptually different.
        
        jd_epoch = 2415020.5
        days_since_epoch = jd - jd_epoch
        ketu_lon = (288.0 + (days_since_epoch * 40.0 / 60.0)) % 360
        ketu_lon = get_corrected_lon("Ketu", ketu_lon)
        
        results["Ketu"] = {
            "longitude": ketu_lon,
            "latitude": 0, # Thai Ketu is on the ecliptic
            "sign": int(ketu_lon / 30) + 1,
            "degree_in_sign": ketu_lon % 30,
            "speed": 40.0 / 60.0,
            "is_retrograde": False
        }
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
        
        # Dignity only applies to Sidereal zodiac in this engine
        if is_sidereal:
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

            data["dignity_list"] = [s.strip() for s in dignity_list if s.strip()]
            data["dignity"] = " · ".join(data["dignity_list"])
        else:
            data["dignity_list"] = []
            data["dignity"] = "N/A (Tropical)"

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



