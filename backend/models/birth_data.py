from pydantic import BaseModel
from typing import Optional
from core.constants import DEFAULT_AYANAMSA, DEFAULT_NODE_TYPE, DEFAULT_KETU_MODE

class BirthData(BaseModel):
    name: Optional[str] = None
    year: int
    month: int
    day: int
    hour: int
    minute: int
    second: Optional[int] = 0
    lat: float
    lon: float
    timezone: Optional[str] = "UTC"

    # Calculation settings — defaults pulled from core/constants.py
    ayanamsa_mode: Optional[str] = DEFAULT_AYANAMSA
    custom_ayanamsa_offset: Optional[float] = None
    node_type: Optional[str] = DEFAULT_NODE_TYPE  # MEAN or TRUE
    ketu_mode: Optional[str] = DEFAULT_KETU_MODE  # vedic or thai
    house_system: Optional[str] = "Whole Sign"
    aspect_orb: Optional[float] = 5.0


