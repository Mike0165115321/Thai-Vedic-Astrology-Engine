from fastapi import APIRouter, HTTPException
import swisseph as swe
from models.birth_data import BirthData
from models.chart import BirthChart
from core.time_utils import get_julian_date, to_utc
from planets.calculator import get_all_planets
from chart.lagna import calculate_lagna
from chart.house_system import calculate_whole_sign_houses
from chart.zodiac_wheel import map_planets_to_houses
from core.ayanamsa import set_ayanamsa
from chart.aspects import calculate_western_aspects, calculate_vedic_aspects
from chart.divisional import get_divisional_positions
from chart.lunar import get_lunar_data
from chart.dasha import calculate_vimshottari_dasha
from chart.house_lords import get_house_lords, get_planet_lordships
from chart.yogas import detect_yogas
from datetime import datetime

router = APIRouter()

def calculate_birth_chart(data: BirthData):
    # 0. Handle Timezone (Convert Local to UTC)
    birth_dt_local = datetime(data.year, data.month, data.day, data.hour, data.minute, data.second or 0)
    birth_dt_utc = to_utc(birth_dt_local, data.timezone)
    
    # 1. Calculate Julian Date from UTC
    jd = get_julian_date(
        birth_dt_utc.year, birth_dt_utc.month, birth_dt_utc.day, 
        birth_dt_utc.hour, birth_dt_utc.minute, birth_dt_utc.second
    )

    # 1. Set Ayanamsa for all subsequent calculations
    set_ayanamsa(data.ayanamsa_mode, data.custom_ayanamsa_offset)
    ayanamsa_val = swe.get_ayanamsa_ut(jd)
    
    # 2. Calculate Lagna
    lagna = calculate_lagna(jd, data.lat, data.lon)
    lagna_sign = lagna["sign"]
    
    # 3. Calculate Planets
    planets = get_all_planets(
        jd, 
        node_type=data.node_type,
        ketu_mode=data.ketu_mode
    )
    
    # 4. Calculate Houses based on selected system
    if data.house_system == "Whole Sign":
        houses = calculate_whole_sign_houses(lagna_sign)
    else:
        # Fallback to Whole Sign for now, or implement other systems via swisseph
        houses = calculate_whole_sign_houses(lagna_sign)
    
    # 5. Map Planets to Houses
    planets_with_houses = map_planets_to_houses(planets, lagna_sign)
    
    # 6. Calculate Aspects
    western_aspects = calculate_western_aspects(planets_with_houses, custom_orb=data.aspect_orb)
    vedic_aspects = calculate_vedic_aspects(planets_with_houses)
    
    # 7. Layer 1E: Divisional Charts
    d3_planets, d3_lagna = get_divisional_positions(planets_with_houses, lagna_data=lagna, division="D3")
    d9_planets, d9_lagna = get_divisional_positions(planets_with_houses, lagna_data=lagna, division="D9")
    
    # 8. Layer 1F: Lunar / Nakshatra
    lunar_data = get_lunar_data(planets_with_houses, lagna["longitude"])
    
    # 9. Layer 1G: Dasha System
    moon_lon = planets_with_houses.get("Moon", {}).get("longitude", 0)
    dasha_timeline = calculate_vimshottari_dasha(moon_lon, birth_dt_utc)
    
    # 10. House Lords & Planet Lordships
    house_lords = get_house_lords(lagna_sign)
    planet_lordships = get_planet_lordships(lagna_sign)
    
    # Attach lordship to planets for easy frontend access
    for name, p_data in planets_with_houses.items():
        p_data["lordships"] = planet_lordships.get(name, [])

    # 11. Yoga Detection (Layer 2)
    detected_yogas = detect_yogas(planets_with_houses, lagna_sign, house_lords)

    return {
        "julian_date": jd,
        "ayanamsa_name": data.ayanamsa_mode,
        "ayanamsa_value": ayanamsa_val,
        "lagna": lagna,
        "planets": planets_with_houses,
        "houses": houses,
        "western_aspects": western_aspects,
        "vedic_aspects": vedic_aspects,
        "d3": d3_planets,
        "d9": d9_planets,
        "d3_lagna": d3_lagna,
        "d9_lagna": d9_lagna,
        "lunar_data": lunar_data,
        "dasha_timeline": dasha_timeline,
        "house_lords": house_lords,
        "yogas": detected_yogas
    }

@router.post("/", response_model=BirthChart)
def calculate_chart_endpoint(data: BirthData):
    try:
        return calculate_birth_chart(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



