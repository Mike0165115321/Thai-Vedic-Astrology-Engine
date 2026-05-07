from pydantic import BaseModel
from typing import Dict, Any, List

class BirthChart(BaseModel):
    julian_date: float
    ayanamsa_name: str
    ayanamsa_value: float
    lagna: Dict[str, Any]
    planets: Dict[str, Any]
    houses: Dict[int, int] # House Number -> Sign Index
