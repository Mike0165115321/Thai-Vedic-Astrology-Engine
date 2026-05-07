from fastapi import APIRouter, HTTPException
import swisseph as swe
from models.birth_data import BirthData
from core.time_utils import get_julian_date
from planets.calculator import get_all_planets
from chart.lagna import calculate_lagna

router = APIRouter()

@router.post("/")
def calculate_chart_endpoint(data: BirthData):
    try:
        jd = get_julian_date(data.year, data.month, data.day, data.hour, data.minute, data.second)
        
        planets = get_all_planets(
            jd, 
            ayanamsa_mode=data.ayanamsa_mode, 
            custom_ayanamsa_offset=data.custom_ayanamsa_offset,
            node_type=data.node_type,
            ketu_mode=data.ketu_mode
        )

        
        # Ensure correct ayanamsa is set for lagna as well
        from core.ayanamsa import set_ayanamsa
        set_ayanamsa(data.ayanamsa_mode, data.custom_ayanamsa_offset)
        
        lagna = calculate_lagna(jd, data.lat, data.lon)
        
        return {
            "julian_date": jd,
            "ayanamsa_name": data.ayanamsa_mode,
            "ayanamsa_value": swe.get_ayanamsa_ut(jd),
            "planets": planets,
            "lagna": lagna
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
