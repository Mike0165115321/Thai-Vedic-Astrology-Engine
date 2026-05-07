from fastapi import APIRouter, HTTPException
from models.transit import TransitRequest
from models.chart import BirthChart
from api.routes.chart import calculate_chart_endpoint
from models.birth_data import BirthData
from chart.zodiac_wheel import map_planets_to_houses

router = APIRouter()

@router.post("/", response_model=BirthChart)
def calculate_transit_endpoint(data: TransitRequest):
    try:
        # 1. Calculate Natal Chart
        natal_chart = calculate_chart_endpoint(data.birth_data)
        lagna_sign = natal_chart["lagna"]["sign"]
        
        # 2. Prepare Transit Data (using the same BirthData model structure for planets calculation)
        transit_birth_data = BirthData(
            year=data.transit_year,
            month=data.transit_month,
            day=data.transit_day,
            hour=data.transit_hour,
            minute=data.transit_minute,
            lat=data.birth_data.lat, # Usually transit is relative to current location, but often we use birth location for simplicity or let user choose.
            lon=data.birth_data.lon,
            timezone=data.transit_timezone,
            ayanamsa_mode=data.birth_data.ayanamsa_mode,
            custom_ayanamsa_offset=data.birth_data.custom_ayanamsa_offset
        )
        
        # 3. Calculate Transit Chart
        transit_chart = calculate_chart_endpoint(transit_birth_data)
        
        # 4. REMAP Transit Planets to Natal Houses
        # By default, transit_chart has planets mapped to its own (transit) lagna.
        # We want them mapped to the natal lagna.
        transit_planets_raw = {name: {**p} for name, p in transit_chart["planets"].items()}
        # Remove old house mapping and re-map
        planets_in_natal_houses = map_planets_to_houses(transit_planets_raw, lagna_sign)
        
        # Return the transit chart but with natal house mappings
        return {
            **transit_chart,
            "planets": planets_in_natal_houses,
            "houses": natal_chart["houses"] # Optional: show natal houses as reference
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
