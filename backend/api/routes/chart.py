from fastapi import APIRouter, HTTPException
import swisseph as swe
from models.birth_data import BirthData
from models.chart import BirthChart
from core.time_utils import get_julian_date
from planets.calculator import get_all_planets
from chart.lagna import calculate_lagna
from chart.house_system import calculate_whole_sign_houses
from chart.zodiac_wheel import map_planets_to_houses
from core.ayanamsa import set_ayanamsa
from chart.aspects import calculate_western_aspects, calculate_vedic_aspects

router = APIRouter()

@router.post("/", response_model=BirthChart)
def calculate_chart_endpoint(data: BirthData):
    try:
        jd = get_julian_date(data.year, data.month, data.day, data.hour, data.minute, data.second)
        
        # 1. Set Ayanamsa for all subsequent calculations
        set_ayanamsa(data.ayanamsa_mode, data.custom_ayanamsa_offset)
        ayanamsa_val = swe.get_ayanamsa_ut(jd)
        
        # 2. Calculate Lagna
        lagna = calculate_lagna(
            jd, data.lat, data.lon, 
            ayanamsa_mode=data.ayanamsa_mode, 
            custom_ayanamsa_offset=data.custom_ayanamsa_offset
        )
        lagna_sign = lagna["sign"]
        
        # 3. Calculate Planets
        planets = get_all_planets(
            jd, 
            ayanamsa_mode=data.ayanamsa_mode, 
            custom_ayanamsa_offset=data.custom_ayanamsa_offset,
            node_type=data.node_type,
            ketu_mode=data.ketu_mode
        )
        
        # 4. Calculate Whole Sign Houses
        houses = calculate_whole_sign_houses(lagna_sign)
        
        # 5. Map Planets to Houses
        planets_with_houses = map_planets_to_houses(planets, lagna_sign)
        
        # 6. Calculate Aspects
        western_aspects = calculate_western_aspects(planets_with_houses)
        vedic_aspects = calculate_vedic_aspects(planets_with_houses)
        
        return {
            "julian_date": jd,
            "ayanamsa_name": data.ayanamsa_mode,
            "ayanamsa_value": ayanamsa_val,
            "lagna": lagna,
            "planets": planets_with_houses,
            "houses": houses,
            "western_aspects": western_aspects,
            "vedic_aspects": vedic_aspects
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


